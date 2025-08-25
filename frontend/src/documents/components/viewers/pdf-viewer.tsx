import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import { Separator } from "@/common/components/ui/separator";
import { Skeleton } from "@/common/components/ui/skeleton";
import api from "@/common/services/api";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  File,
  FileText,
  Loader2,
  ZoomOut,
  ZoomIn,
  ScanSearch,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useNavigate } from "react-router-dom";
import { IDocument } from "../../models/types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("/pdf.worker.min.mjs", import.meta.url).toString();

const pdfViewerOptions = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

interface Props {
  document: IDocument;
  zoom: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSetTotalPage: (totalPage: number) => void;
  onZoomChange?: (zoom: number) => void;
  onDownload?: () => void;
}

const PDFViewer = ({ document, zoom, currentPage, onPageChange, onSetTotalPage, onZoomChange, onDownload }: Props) => {
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState<number>();
  const [maxWidth, setMaxWidth] = useState<number | undefined>();
  const [baseWidth, setBaseWidth] = useState<number>(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<Error | null>(null);
  const [workerLoaded, setWorkerLoaded] = useState(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const src = `/documents/${document.id}/file`;

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.25, 6.67); // 300% * 2.22
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.25, 0.44); // 20% * 2.22
    onZoomChange?.(newZoom);
  };

  useEffect(() => {
    const initWorker = async () => {
      try {
        await pdfjs.getDocument({ data: new Uint8Array(0) }).promise.catch(() => {});
        setWorkerLoaded(true);
      } catch (err) {
        console.error("Worker initialization error:", err);
        setError("PDF viewer initialization failed");
      }
    };

    initWorker();
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchPdf = async () => {
      if (!workerLoaded) return;

      try {
        setLoading(true);
        setError(null);
        setDocumentError(null);

        if (src) {
          const response = await api.get(src, {
            responseType: "blob",
          });

          const contentType = response.headers["content-type"];
          if (!contentType?.includes("application/pdf")) {
            throw new Error("Response is not a PDF");
          }

          setPdfBlob(response.data);
        }
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    if (src) {
      fetchPdf();
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, workerLoaded]);

  const updateMaxWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 64;
      setMaxWidth(containerWidth);
      setBaseWidth(containerWidth); // Set base width only once
    }
  }, []);

  useLayoutEffect(() => {
    updateMaxWidth();
    window.addEventListener("resize", updateMaxWidth);
    return () => {
      window.removeEventListener("resize", updateMaxWidth);
    };
  }, [updateMaxWidth]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onSetTotalPage(numPages);
    setDocumentError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF document:", error);
    setDocumentError(error);
  };

  const handleScroll = useCallback(() => {
    if (!numPages || !containerRef.current) return;

    let currentPage = 1;
    let minDiff = Infinity;

    pageRefs.current.forEach((page, index) => {
      if (page) {
        const rect = page.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const diff = Math.abs(rect.top - containerRect.top);
        if (diff < minDiff) {
          minDiff = diff;
          currentPage = index + 1;
        }
      }
    });

    onPageChange(currentPage);
  }, [numPages, onPageChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (pageRefs.current[currentPage - 1] && containerRef.current) {
      const pageElement = pageRefs.current[currentPage - 1];
      const container = containerRef.current;

      if (pageElement) {
        const offsetTop = pageElement.offsetTop - container.offsetTop - 20;
        container.scrollTo({
          top: offsetTop,
          behavior: "auto",
        });
      }
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <File className="h-5 w-5 text-red-500" />
            <Skeleton className="h-5 w-32" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Loading PDF document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || documentError) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <File className="h-5 w-5 text-red-500" />
            <span className="font-medium">{document.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-red-500">Error loading PDF</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center text-red-500 bg-gray-50 px-6">
          <div className="text-center">
            <p className="text-lg">
              Error loading PDF: {error || (documentError && documentError.message) || "Failed to load PDF document"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!pdfBlob) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <File className="h-5 w-5 text-red-500" />
            <span className="font-medium">{document.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">No document</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* No Document Content */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No PDF document available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* Left - Back button, icon, and name */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <File className="h-5 w-5 text-red-500" />
          <span className="font-medium">{document.name}</span>
        </div>

        {/* Center - Page and zoom controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Page:</span>
            <span className="text-sm text-gray-600">
              {currentPage} / {numPages || 0}
            </span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.44}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono min-w-[60px] text-center">{Math.round((zoom / 2.22) * 100)}%</span>
            <Button variant="outline" size="icon" disabled={zoom >= 6.67} onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onZoomChange?.(2.22)} title="Reset Zoom">
              <ScanSearch className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right - Download */}
        <div className="flex items-center gap-2">
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full overflow-auto bg-gray-100" style={{ scrollBehavior: "auto" }}>
          <div className="p-6 flex justify-center">
            <div className="inline-block">
              <Document
              file={pdfBlob}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              options={pdfViewerOptions}
              loading={
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Loading document...</p>
                </div>
              }
              error={
                <Alert variant="destructive" className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error loading PDF document</AlertDescription>
                </Alert>
              }
            >
              <div className="flex flex-col items-center space-y-6">
                {Array.from(new Array(numPages), (_el, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      pageRefs.current[index] = el;
                    }}
                    className="bg-white shadow-lg"
                  >
                    <Page
                      key={`page_${index + 1}_zoom_${zoom}`}
                      pageNumber={index + 1}
                      width={baseWidth * zoom}
                      className="!border-0"
                      loading={
                        <div className="h-[1000px] w-full flex items-center justify-center bg-white">
                          <Skeleton className="h-full w-full" />
                        </div>
                      }
                      error={
                        <div className="h-[400px] w-full flex items-center justify-center bg-white">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>Error loading page {index + 1}</AlertDescription>
                          </Alert>
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            </Document>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
