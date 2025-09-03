import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { Checkbox } from "@/common/components/ui/checkbox";
import { useToast } from "@/common/components/ui/use-toast";
import { AlertCircle, File, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useUploadMultipleDocuments } from "../services/hooks";

const ALLOWED_TYPES = ".pdf,.doc,.docx,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadDialogProps {
  children: React.ReactNode;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ children }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { mutate: uploadFiles, isPending: isUploading } = useUploadMultipleDocuments();

  const validateFiles = (files: FileList | File[]): File[] => {
    const validFiles: File[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds 10MB limit`);
        return [];
      }
      validFiles.push(file);
    }

    return validFiles;
  };

  const handleFileSelect = (files: FileList | File[]) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      // Check for duplicates based on name and size
      const filteredFiles = validFiles.filter((newFile) => {
        return !selectedFiles.some(
          (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
        );
      });

      if (filteredFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...filteredFiles]);
        setError("");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files?.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFileSelection = (index: number) => {
    setSelectedForRemoval((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const removeSelectedFiles = () => {
    setSelectedFiles((prev) => prev.filter((_, index) => !selectedForRemoval.has(index)));
    setSelectedForRemoval(new Set());
  };

  const selectAllFiles = () => {
    if (selectedForRemoval.size === selectedFiles.length) {
      setSelectedForRemoval(new Set());
    } else {
      setSelectedForRemoval(new Set(selectedFiles.map((_, index) => index)));
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file");
      return;
    }

    uploadFiles(selectedFiles, {
      onSuccess: (uploadedDocuments) => {
        toast({
          title: "Upload successful",
          description: `${uploadedDocuments.length} document${
            uploadedDocuments.length > 1 ? "s" : ""
          } uploaded successfully`,
        });
        setSelectedFiles([]);
        setError("");
        setIsOpen(false);
      },
      onError: (error: any) => {
        console.error("Upload error:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Upload failed";
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        });
        setError(errorMessage);
      },
    });
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    setSelectedForRemoval(new Set());
    setError("");
    setIsOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>Add files to your document library.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Bulk Actions - Always show */}
              <div className="flex items-center justify-between mb-3 flex-shrink-0 h-8">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => !isUploading && selectAllFiles()}
                >
                  <Checkbox
                    checked={selectedFiles.length > 0 && selectedForRemoval.size === selectedFiles.length}
                    onCheckedChange={selectAllFiles}
                    disabled={isUploading}
                  />
                  <span className="text-sm text-muted-foreground">Select all</span>
                </div>
                {selectedForRemoval.size > 0 && (
                  <Button variant="outline" size="sm" onClick={removeSelectedFiles} disabled={isUploading}>
                    Remove
                  </Button>
                )}
              </div>

              {/* Files List */}
              <div className="flex-1 overflow-y-auto min-h-0 rounded-lg bg-muted/20">
                <div className="p-2 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedForRemoval.has(index)
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/50 hover:bg-muted/70 border-muted-foreground/20"
                      }`}
                      onClick={() => !isUploading && toggleFileSelection(index)}
                    >
                      <Checkbox
                        checked={selectedForRemoval.has(index)}
                        onCheckedChange={() => toggleFileSelection(index)}
                        disabled={isUploading}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <File className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="h-6 w-6 p-0"
                        disabled={isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload Area or Upload Button */}
          {selectedFiles.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer flex-1 flex flex-col justify-center p-12 ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <Upload className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <h3 className="font-medium mb-2 text-lg">Drop files here or click to browse</h3>
              <p className="text-sm text-muted-foreground mb-2">Maximum file size: 10MB per file</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES}
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                disabled={isUploading}
              />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                className="w-full p-4 h-auto border-dashed"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add More Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES}
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                disabled={isUploading}
              />
            </div>
          )}

          {/* Error */}
          <div className="flex-shrink-0">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedFiles.length === 0
                ? ""
                : selectedForRemoval.size > 0
                ? `${selectedForRemoval.size} of ${selectedFiles.length} files selected`
                : `${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""}`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading}>
                {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
