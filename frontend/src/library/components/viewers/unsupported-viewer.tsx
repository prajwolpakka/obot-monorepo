import { Button } from "@/common/components/ui/button";
import { ArrowLeft, Download, File, FileSpreadsheet, FileText } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { IDocument } from "../../models/types";

interface UnsupportedFileViewerProps {
  document: IDocument;
}

const UnsupportedFileViewer: React.FC<UnsupportedFileViewerProps> = ({ document }) => {
  const navigate = useNavigate();

  const getFileType = (filename: string, mimeType: string) => {
    const extension = filename?.toLowerCase().split(".").pop() || "";
    const type = (mimeType || "").toLowerCase();

    if (["doc", "docx"].includes(extension) || type.includes("word")) return "document";
    if (["xls", "xlsx"].includes(extension) || type.includes("excel") || type.includes("spreadsheet"))
      return "spreadsheet";
    return "unknown";
  };

  const fileType = getFileType(document.name || "", document.mimeType || "");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    // try {
    //   const documentUrl = `/documents/${document.id}/file`;
    //   const response = await api.get(documentUrl, {
    //     responseType: "blob",
    //   });
    //   const blob = new Blob([response.data]);
    //   const url = window.URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = document.name || 'document';
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   window.URL.revokeObjectURL(url);
    // } catch (error) {
    //   console.error("Download failed:", error);
    // }
  };

  const getFileIcon = () => {
    if (fileType === "document") return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType === "spreadsheet") return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileIconLarge = () => {
    if (fileType === "document") return <FileText className="h-16 w-16 text-gray-400" />;
    if (fileType === "spreadsheet") return <FileSpreadsheet className="h-16 w-16 text-gray-400" />;
    return <File className="h-16 w-16 text-gray-400" />;
  };

  const getPreviewMessage = () => {
    if (fileType === "document") return "Word documents cannot be previewed in browser";
    if (fileType === "spreadsheet") return "Excel files cannot be previewed in browser";
    return "This file type cannot be previewed in browser";
  };

  return (
    <div className="h-screen">
      {/* Fixed Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Left - Back button, icon, and name */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {getFileIcon()}
          <span className="font-medium">{document.name}</span>
        </div>

        {/* Center - File info */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Preview not available • {formatFileSize(document.fileSize)}</span>
        </div>

        {/* Right - Download */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Content with top padding */}
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 pt-20 px-6">
        <div className="text-center space-y-4">
          {getFileIconLarge()}

          <div>
            <h3 className="text-lg font-medium text-gray-700">Preview not available</h3>
            <p className="text-sm text-gray-500 mt-1">{getPreviewMessage()}</p>
            <p className="text-xs text-gray-400 mt-2">File size: {formatFileSize(document.fileSize)}</p>
          </div>

          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download to view
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnsupportedFileViewer;
