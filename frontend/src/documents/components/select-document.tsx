import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Skeleton } from "@/common/components/ui/skeleton";
import { FileText, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { IDocument } from "../models/types";
import { useGetDocuments } from "../services/hooks";
import { useEmbeddingStatus } from "../hooks/use-embedding-status";
import { useQueryClient } from "@tanstack/react-query";

interface DocumentSelectionDialogProps {
  selectedDocuments: string[];
  onDocumentsChange: (documents: string[]) => void;
}

const DocumentSkeleton = () => (
  <div className="p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-4 w-4" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-24 mt-1" />
      </div>
    </div>
  </div>
);

const SelectDocument: React.FC<DocumentSelectionDialogProps> = ({ selectedDocuments, onDocumentsChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedDocs, setTempSelectedDocs] = useState<string[]>(selectedDocuments);

  const { data: documents, isLoading, error } = useGetDocuments();
  const { socket } = useEmbeddingStatus(null);
  const queryClient = useQueryClient();

  // Refetch documents when any embedding completes
  useEffect(() => {
    if (!socket) return;
    const handler = (update: { documentId: string; status: 'pending' | 'embedding' | 'processed' | 'failed' }) => {
      if (update.status === 'processed' || update.status === 'failed') {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    };
    socket.on('status-update', handler);
    return () => { socket.off('status-update', handler); };
  }, [socket, queryClient]);

  // Update temp selected docs when selectedDocuments prop changes
  useEffect(() => {
    setTempSelectedDocs(selectedDocuments);
  }, [selectedDocuments]);

  const filteredDocuments =
    documents?.filter((doc: IDocument) => doc.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const handleDocumentToggle = (docId: string) => {
    setTempSelectedDocs((prev) => (prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]));
  };

  const handleSave = () => {
    onDocumentsChange(tempSelectedDocs);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelectedDocs(selectedDocuments);
    setIsOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const selectedDocumentNames =
    documents?.filter((doc: IDocument) => selectedDocuments.includes(doc.id)).map((doc: IDocument) => doc.name) || [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {Array.from({ length: 4 }).map((_, index) => (
            <DocumentSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 overflow-y-auto border rounded-lg">
          <div className="p-8 text-center text-red-500">Failed to load documents. Please try again.</div>
        </div>
      );
    }

    if (!documents || documents.length === 0) {
      return (
        <div className="flex-1 overflow-y-auto border rounded-lg">
          <div className="p-8 text-center text-gray-500">No documents available. Upload some documents first.</div>
        </div>
      );
    }

    if (filteredDocuments.length === 0) {
      return (
        <div className="flex-1 overflow-y-auto border rounded-lg">
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? "No documents found matching your search." : "No documents available."}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto border rounded-lg">
        <div className="divide-y">
          {filteredDocuments.map((doc: IDocument) => (
            <div
              key={doc.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleDocumentToggle(doc.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={tempSelectedDocs.includes(doc.id)}
                  onCheckedChange={() => handleDocumentToggle(doc.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span className="font-medium text-sm">{doc.name}</span>
                    {!doc.isProcessed && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Processing</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(doc.fileSize)} • Uploaded {formatDate(doc.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-gray-500 font-normal">
          <FileText size={16} className="mr-2" />
          {selectedDocuments.length > 0 ? (
            <span className="text-gray-900 font-medium">{selectedDocuments.length} document(s) selected</span>
          ) : (
            "Select from Documents"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Documents</DialogTitle>
          <DialogDescription>
            Choose documents from your library to add to the chatbot's knowledge base.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Selected documents summary */}
          {selectedDocumentNames.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Currently selected ({selectedDocuments.length}):
              </div>
              <div className="text-sm text-blue-700">{selectedDocumentNames.join(", ")}</div>
            </div>
          )}

          {/* Documents list */}
          {renderContent()}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">{tempSelectedDocs.length} document(s) selected</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                Select
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectDocument;
