import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import api from "@/common/services/api";
import { ArrowLeft, Download, FileText, Minus, Plus, ZoomIn } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IDocument } from "../../models/types";

interface TextViewerProps {
  document: IDocument;
}

const TextViewer: React.FC<TextViewerProps> = ({ document }) => {
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [searchTerm, setSearchTerm] = useState("");

  const documentUrl = `/documents/${document.id}/file`;

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        setLoading(true);
        const response = await api.get(documentUrl, {
          responseType: "text",
        });
        setContent(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchTextContent();
  }, [documentUrl]);

  const handleDownload = async () => {
    // try {
    //   const response = await api.get(documentUrl, {
    //     responseType: "blob",
    //   });
    //   const blob = new Blob([response.data], { type: 'text/plain' });
    //   const url = window.URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = document.name || 'document.txt';
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   window.URL.revokeObjectURL(url);
    // } catch (error) {
    //   console.error("Download failed:", error);
    // }
  };

  const handleFontSizeIncrease = () => setFontSize((prev) => Math.min(prev + 2, 60));
  const handleFontSizeDecrease = () => setFontSize((prev) => Math.max(prev - 2, 10));
  const handleFontSizeReset = () => setFontSize(14);

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  const getFileIcon = () => {
    const extension = document.name?.toLowerCase().split(".").pop() || "";
    if (extension === "md") return <FileText className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {getFileIcon()}
            <Skeleton className="h-5 w-32" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {getFileIcon()}
            <span className="font-medium">{document.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-red-500">Error loading content</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center text-red-500 bg-gray-50 px-6">
          <div className="text-center">
            <p className="text-lg">Error loading content: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* Left - Back button, icon, and name */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {getFileIcon()}
          <span className="font-medium">{document.name}</span>
        </div>

        {/* Center - Font size and search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleFontSizeDecrease} disabled={fontSize <= 10}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono min-w-[40px] text-center">{fontSize}px</span>
            <Button variant="outline" size="icon" onClick={handleFontSizeIncrease} disabled={fontSize >= 60}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleFontSizeReset}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 overflow-auto bg-white">
        <pre
          className="p-6 text-sm font-mono whitespace-pre-wrap min-h-full leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          {content}
        </pre>
      </div>
    </div>
  );
};

export default TextViewer;
