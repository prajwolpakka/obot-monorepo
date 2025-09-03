import { Badge } from "@/common/components/ui/badge";
import { useNotifications } from "@/notifications";
import { AlertCircle, Clock, FileCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export type DocumentStatus = "pending" | "embedding" | "processed" | "failed";

interface DocumentStatusBadgeProps {
  documentId: string;
  initialStatus: DocumentStatus;
  isProcessed: boolean;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ documentId, initialStatus, isProcessed }) => {
  const [status, setStatus] = useState<DocumentStatus>(initialStatus);
  const { notifications } = useNotifications();

  useEffect(() => {
    // Listen for document status updates via notifications
    const latestNotification = notifications
      .filter((n) => n.documentId === documentId)
      .sort((a, b) => (new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()))[0];

    if (latestNotification) {
      if (latestNotification.type === "document-embedding-started") {
        setStatus("embedding");
      } else if (latestNotification.type === "document-processed") {
        setStatus(latestNotification.success ? "processed" : "failed");
      }
    }
  }, [notifications, documentId]);

  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        };
      case "embedding":
        return {
          icon: Loader2,
          label: "Processing",
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          animate: true,
        };
      case "processed":
        return {
          icon: FileCheck,
          label: "Processed",
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "failed":
        return {
          icon: AlertCircle,
          label: "Failed",
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={`text-xs ${config.className}`}>
      <Icon size={10} className={`mr-1 ${config.animate ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
};
