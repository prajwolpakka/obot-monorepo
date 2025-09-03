import { Button } from "@/common/components/ui/button";
import { Separator } from "@/common/components/ui/separator";
import { Skeleton } from "@/common/components/ui/skeleton";
import api from "@/common/services/api";
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  ScanSearch,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { IDocument } from "../../models/types";

interface ImageViewerProps {
  document: IDocument;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ document }) => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const transformRef = useRef<any>(null);

  const documentUrl = `/documents/${document.id}/file`;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await api.get(documentUrl, {
          responseType: "blob",
        });

        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [documentUrl]);

  const handleDownload = async () => {
    // try {
    //   const response = await api.get(documentUrl, {
    //     responseType: "blob",
    //   });
    //   const blob = new Blob([response.data]);
    //   const url = window.URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = document.name || 'image';
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   window.URL.revokeObjectURL(url);
    // } catch (error) {
    //   console.error("Download failed:", error);
    // }
  };

  const handleZoomIn = () => {
    if (transformRef.current) {
      transformRef.current.zoomIn(0.2);
    }
  };

  const handleZoomOut = () => {
    if (transformRef.current) {
      transformRef.current.zoomOut(0.2);
    }
  };
  const handleZoomReset = () => transformRef.current?.resetTransform();
  const handleRotateCCW = () => setRotation((prev) => prev + 90);
  const handleRotateCW = () => setRotation((prev) => prev - 90);

  const handleTransformChange = (ref: any) => {
    if (ref?.state?.scale) {
      setZoomLevel(Math.round(ref.state.scale * 100));
    }
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
            <ImageIcon className="h-5 w-5 text-green-500" />
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
          <Skeleton className="w-full h-full max-w-4xl max-h-[80vh]" />
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
            <ImageIcon className="h-5 w-5 text-green-500" />
            <span className="font-medium">{document.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-red-500">Error loading image</span>
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
            <p className="text-lg">Error loading image: {error}</p>
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
          <ImageIcon className="h-5 w-5 text-green-500" />
          <span className="font-medium">{document.name}</span>
        </div>

        {/* Center - Zoom controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono min-w-[60px] text-center">{zoomLevel}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button variant="outline" disabled={zoomLevel === 100} size="icon" onClick={handleZoomReset}>
            <ScanSearch className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8 mx-2" />

          <Button variant="outline" size="icon" onClick={handleRotateCW}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRotateCCW}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Right - Download */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Image Content */}
      <div className="flex-1 p-4 h-full w-full overflow-hidden">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.25}
          maxScale={3}
          centerOnInit={true}
          wheel={{ step: 0.2 }}
          doubleClick={
            zoomLevel < 200 ? { disabled: false, mode: "zoomIn", step: 3 } : { disabled: false, mode: "reset" }
          }
          onTransformed={handleTransformChange}
        >
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="w-full h-full flex items-center justify-center"
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%" }}
          >
            <img
              src={imageUrl}
              alt={document.name}
              className="w-full h-full object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center",
                transitionDuration: "0.2s",
              }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};

export default ImageViewer;
