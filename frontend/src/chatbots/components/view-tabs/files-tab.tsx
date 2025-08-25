import { useAddDocuments, useLinkDocuments, useRemoveDocument } from "@/chatbots/services/hooks";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { DataTable } from "@/common/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { useToast } from "@/common/components/ui/use-toast";
import { Clock, FileCheck, FileIcon, FileText, Loader2, Plus, Search, Trash2, Upload, Link } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DocumentStatusBadge } from "@/documents/components/document-status-badge";
import { useGetDocuments } from "@/documents/services/hooks";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Checkbox } from "@/common/components/ui/checkbox";

interface Document {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  isProcessed: boolean;
  status?: 'pending' | 'embedding' | 'processed' | 'failed';
  createdAt: string;
}

interface FilesTabProps {
  chatbot: any;
  formatDate: (dateString: string) => string;
  formatFileSize: (bytes: number) => string;
}

const FilesTab: React.FC<FilesTabProps> = ({ chatbot, formatDate, formatFileSize }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [documentsToDelete, setDocumentsToDelete] = useState<Document[]>([]);
  const [clearSelectionCallback, setClearSelectionCallback] = useState<(() => void) | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [tempSelectedDocumentIds, setTempSelectedDocumentIds] = useState<string[]>([]);
  const { mutate: addDocuments, isPending: isAdding } = useAddDocuments();
  const { mutate: linkDocuments, isPending: isLinking } = useLinkDocuments();
  const { mutate: removeDocument, isPending: isRemoving } = useRemoveDocument();
  const { data: allDocuments, isLoading: isLoadingDocuments } = useGetDocuments();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    addDocuments(
      { chatbotId: chatbot.id, files },
      {
        onSuccess: () => {
          toast({
            title: "Files uploaded successfully!",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: (error) => {
          toast({
            title: "Failed to upload files",
            description: error instanceof Error ? error.message : "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleAddExistingDocuments = (documentIds: string[]) => {
    if (documentIds.length === 0) return;

    linkDocuments(
      { chatbotId: chatbot.id, documentIds },
      {
        onSuccess: () => {
          toast({
            title: "Files added successfully!",
            description: `${documentIds.length} file(s) have been added to the chatbot.`,
          });
          setSelectedDocumentIds([]);
        },
        onError: (error) => {
          toast({
            title: "Failed to add files",
            description: error instanceof Error ? error.message : "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const confirmSingleDelete = () => {
    if (!documentToDelete) return;

    removeDocument(
      { chatbotId: chatbot.id, documentId: documentToDelete },
      {
        onSuccess: () => {
          toast({
            title: "File removed successfully!",
          });
          setDeleteDialogOpen(false);
          setDocumentToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Failed to remove file",
            description: error instanceof Error ? error.message : "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleBulkDelete = (selectedDocuments: Document[], clearSelection: () => void) => {
    setDocumentsToDelete(selectedDocuments);
    setClearSelectionCallback(() => clearSelection);
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    const count = documentsToDelete.length;

    // Delete each selected document
    documentsToDelete.forEach((document, index) => {
      removeDocument(
        { chatbotId: chatbot.id, documentId: document.id },
        {
          onSuccess: () => {
            // Clear selection and show toast after last successful delete
            if (index === documentsToDelete.length - 1) {
              clearSelectionCallback?.();
              toast({
                title: `${count} file${count > 1 ? 's' : ''} removed successfully!`,
              });
              setBulkDeleteDialogOpen(false);
              setDocumentsToDelete([]);
              setClearSelectionCallback(null);
            }
          },
          onError: (error) => {
            toast({
              title: "Failed to remove files",
              description: error instanceof Error ? error.message : "Something went wrong",
              variant: "destructive",
            });
          },
        }
      );
    });
  };

  const filteredDocuments = chatbot.documents?.filter((document: Document) =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const columns = useMemo<ColumnDef<Document>[]>(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="max-w-[200px] truncate">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "fileName",
      header: "File",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">
          {row.getValue("fileName")}
        </div>
      ),
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatFileSize(row.getValue("fileSize"))}
        </div>
      ),
    },
    {
      accessorKey: "isProcessed",
      header: "Status",
      cell: ({ row }) => {
        const document = row.original;
        return (
          <DocumentStatusBadge
            documentId={document.id}
            initialStatus={document.status || (document.isProcessed ? 'processed' : 'pending')}
            isProcessed={document.isProcessed}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => (
        <div className="text-sm text-gray-400">
          {formatDate(row.getValue("createdAt"))}
        </div>
      ),
    },
  ], [formatFileSize, formatDate]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No files found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        No files match "{searchTerm}"
      </p>
    </div>
  );

  const noFilesState = (
    <div className="flex flex-col items-center justify-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No files added
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        This chatbot doesn't have any knowledge base files yet.
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setShowDocumentSelector(true)}
          disabled={isLinking}
        >
          {isLinking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link className="h-4 w-4 mr-2" />}
          Add Files
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} disabled={isAdding}>
          {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload Files
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-full flex flex-col">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {chatbot.documents && chatbot.documents.length > 0 ? (
          // Show table with search and add button when files exist
          <Card className="h-full flex flex-col">
            <CardContent className="p-4 h-full flex flex-col">
              {/* Header with search and buttons */}
              <div className="flex justify-between items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDocumentSelector(true)}
                    disabled={isLinking}
                  >
                    {isLinking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link className="h-4 w-4 mr-2" />}
                    Add Files
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isAdding}>
                    {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Files
                  </Button>
                </div>
              </div>

              {/* Table Content */}
              <div className="flex-1">
                <DataTable
                  data={filteredDocuments}
                  columns={columns}
                  emptyState={emptyState}
                  bulkAction={(selectedRows, clearSelection) => (
                    <>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedRows.length} selected
                      </span>
                      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkDelete(selectedRows, clearSelection)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                  endAction={({ row }) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(row.original.id)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                  pagination={filteredDocuments.length > 10}
                  className="h-full"
                  bordered={true}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          // Clean empty state when no files exist
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              {noFilesState}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Single File Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this file? This action cannot be undone and will permanently delete the file from your knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSingleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Files</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {documentsToDelete.length} file{documentsToDelete.length > 1 ? 's' : ''}? This action cannot be undone and will permanently delete these files from your knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete {documentsToDelete.length} File{documentsToDelete.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Selection Dialog */}
      <Dialog open={showDocumentSelector} onOpenChange={setShowDocumentSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Files from Library</DialogTitle>
            <DialogDescription>
              Select documents from your library to add to this chatbot's knowledge base.
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
                disabled={isLoadingDocuments}
              />
            </div>

            {/* Documents list */}
            <div className="flex-1 overflow-y-auto border rounded-lg">
              {isLoadingDocuments ? (
                <div className="p-8 text-center text-gray-500">Loading documents...</div>
              ) : !allDocuments || allDocuments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No documents available. Upload some documents first.</div>
              ) : (
                <div className="divide-y">
                  {allDocuments
                    .filter((doc: any) => 
                      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      !chatbot.documents?.some((chatbotDoc: Document) => chatbotDoc.id === doc.id)
                    )
                    .map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setTempSelectedDocumentIds(prev => 
                            prev.includes(doc.id) 
                              ? prev.filter(id => id !== doc.id)
                              : [...prev, doc.id]
                          );
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={tempSelectedDocumentIds.includes(doc.id)}
                            onCheckedChange={() => {
                              setTempSelectedDocumentIds(prev => 
                                prev.includes(doc.id) 
                                  ? prev.filter(id => id !== doc.id)
                                  : [...prev, doc.id]
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-gray-500" />
                              <span className="font-medium text-sm">{doc.name}</span>
                              {doc.status === 'processing' && (
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
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">{tempSelectedDocumentIds.length} document(s) selected</div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDocumentSelector(false);
                    setTempSelectedDocumentIds([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleAddExistingDocuments(tempSelectedDocumentIds);
                    setShowDocumentSelector(false);
                    setTempSelectedDocumentIds([]);
                  }} 
                  disabled={isLoadingDocuments || isLinking || tempSelectedDocumentIds.length === 0}
                >
                  {isLinking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Add Selected Files
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FilesTab;
