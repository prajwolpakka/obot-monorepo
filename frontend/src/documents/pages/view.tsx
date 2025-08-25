import { Skeleton } from "@/common/components/ui/skeleton";
import { Bot } from "lucide-react";
import React from "react";
import { useParams } from "react-router-dom";
import PDFViewer from "../components/viewers/pdf-viewer";
import ImageViewer from "../components/viewers/image-viewer";
import TextViewer from "../components/viewers/text-viewer";
import UnsupportedFileViewer from "../components/viewers/unsupported-viewer";
import { IDocument } from "../models/types";
import { useGetDocument } from "../services/hooks";

// Document renderer component for different file types
const DocumentRenderer: React.FC<{ document: IDocument }> = ({ document }) => {
  const [zoom, setZoom] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);

  // Determine file type from extension or mime type
  const getFileType = (filename: string, mimeType: string) => {
    const extension = filename?.toLowerCase().split(".").pop() || "";
    const type = (mimeType || "").toLowerCase();

    if (type.includes("pdf") || extension === "pdf") return "pdf";
    if (type.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
    if (["doc", "docx"].includes(extension) || type.includes("word")) return "document";
    if (["xls", "xlsx"].includes(extension) || type.includes("excel") || type.includes("spreadsheet"))
      return "spreadsheet";
    if (["txt", "md"].includes(extension) || type.includes("text")) return "text";

    return "unknown";
  };

  const fileType = getFileType(document.name || "", document.mimeType || "");

  const handleDownload = async () => {
    // try {
    //   const documentUrl = `/documents/${document.id}/file`;
    //   const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8002"}/api${documentUrl}`, {
    //     credentials: "include",
    //   });
    //   if (!response.ok) throw new Error("Download failed");
    //   const blob = await response.blob();
    //   const url = window.URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.download = document.name || "document";
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   window.URL.revokeObjectURL(url);
    // } catch (error) {
    //   console.error("Download failed:", error);
    // }
  };

  switch (fileType) {
    case "pdf":
      return (
        <PDFViewer
          document={document}
          zoom={zoom}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSetTotalPage={setTotalPages}
          onZoomChange={setZoom}
          onDownload={handleDownload}
        />
      );

    case "image":
      return <ImageViewer document={document} />;

    case "text":
      return <TextViewer document={document} />;

    case "document":
    case "spreadsheet":
    default:
      return <UnsupportedFileViewer document={document} />;
  }
};

const DocumentViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: document, isLoading, error } = useGetDocument(id || "");

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        {/* Toolbar Skeleton */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-12 w-12 rounded" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-[600px] w-[800px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-red-600">Error</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative max-w-md">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">
              {error instanceof Error ? error.message : "Failed to load document"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-yellow-600">Not Found</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative max-w-md">
            <strong className="font-bold">Not Found: </strong>
            <span className="block sm:inline">Document not found</span>
          </div>
        </div>
      </div>
    );
  }

  return <DocumentRenderer document={document} />;
};

export default DocumentViewerPage;
