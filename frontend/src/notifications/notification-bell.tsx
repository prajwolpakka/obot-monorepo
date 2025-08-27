import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Separator } from "@/common/components/ui/separator";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { isToday } from "date-fns";
import { useNotifications } from "./notification-context";
import { NotificationItem } from "./notification-item";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead, deleteAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const recentNotifications = notifications.slice(0, 10);
  const todayNotifications = recentNotifications.filter((n) =>
    isToday(new Date(n.createdAt))
  );
  const earlierNotifications = recentNotifications.filter(
    (n) => !isToday(new Date(n.createdAt))
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[20px] h-5 text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-2">
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteAllNotifications}
              className="h-8 px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {todayNotifications.length > 0 && (
                <div className="mb-4">
                  <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">Today</p>
                  {todayNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <NotificationItem
                        notification={notification}
                        onClose={() => setIsOpen(false)}
                      />
                      {index < todayNotifications.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {earlierNotifications.length > 0 && (
                <div>
                  <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">Earlier</p>
                  {earlierNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <NotificationItem
                        notification={notification}
                        onClose={() => setIsOpen(false)}
                      />
                      {index < earlierNotifications.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 10 && (
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" size="sm">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
