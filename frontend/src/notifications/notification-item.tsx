import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/utils/classnames";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Check, CheckCircle, ExternalLink, Info, X, XCircle } from "lucide-react";
import { useNotifications } from "./notification-context";
import { Notification } from "./types";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return CheckCircle;
    case "warning":
      return AlertTriangle;
    case "error":
      return XCircle;
    default:
      return Info;
  }
};

const getNotificationStyles = (priority: string) => {
  const baseStyles = "rounded-lg";

  const priorityStyles = {
    urgent: "ring-2 ring-red-200 dark:ring-red-800",
    high: "ring-1 ring-yellow-200 dark:ring-yellow-800",
    medium: "",
    low: "opacity-80",
  };

  return cn(baseStyles, priorityStyles[priority as keyof typeof priorityStyles]);
};

export const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const Icon = getNotificationIcon(notification.type);

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id);
  };

  const handleActionClick = () => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank");
      handleMarkAsRead();
      onClose?.();
    }
  };

  return (
    <div
      className={cn(
        "p-4 space-y-2 cursor-pointer transition-colors hover:bg-muted/50",
        getNotificationStyles(notification.priority),
        !notification.isRead && "bg-muted/30"
      )}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-4 flex-1">
          <Icon
            className={cn(
              "h-5 w-5 mt-0.5 flex-shrink-0",
              notification.type === "success" && "text-green-600",
              notification.type === "warning" && "text-yellow-600",
              notification.type === "error" && "text-red-600",
              notification.type === "info" && "text-blue-600"
            )}
          />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className={cn("text-sm font-medium", !notification.isRead && "font-semibold")}>
                {notification.title}
              </h4>
              {!notification.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              {notification.priority === "urgent" && (
                <span className="text-xs font-medium text-red-600 dark:text-red-400">Urgent</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {notification.actionUrl && notification.actionLabel && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick();
          }}
          className="w-full"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          {notification.actionLabel}
        </Button>
      )}
    </div>
  );
};
