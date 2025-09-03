import { Button } from "@/common/components/ui/button";
import SelectDocument from "@/library/components/select-document";
import { Bot, FileText, Plus, Upload, X } from "lucide-react";
import React from "react";

interface FilesTabProps {
  selectedFiles: File[];
  documentFiles: string[];
  onFileUpload: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onDocumentsChange: (documents: string[]) => void;
}

const FilesTab: React.FC<FilesTabProps> = ({
  selectedFiles,
  documentFiles,
  onFileUpload,
  onRemoveFile,
  onDocumentsChange,
}) => {
  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div>
        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Knowledge Base</h4>
              <p className="text-sm text-blue-700 break-words leading-relaxed">
                Your chatbot will use these files as its knowledge source to answer questions.
              </p>
            </div>
          </div>
        </div>

        {/* Document Library Section */}
        <div className="space-y-4">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select from Library</label>
            <SelectDocument selectedDocuments={documentFiles} onDocumentsChange={onDocumentsChange} />
          </div>

          {/* Upload Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Upload Files</label>

            {/* Show upload area only when no files are selected */}
            {selectedFiles.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx,.md"
                  onChange={(e) => onFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, TXT, DOC, DOCX, MD files</p>
                </label>
              </div>
            ) : (
              /* Show uploaded files and add more button */
              <div>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-500" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.md"
                    onChange={(e) => onFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload-additional"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => document.getElementById("file-upload-additional")?.click()}
                  >
                    <Plus size={16} className="mr-2" />
                    Add More Files
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesTab;
