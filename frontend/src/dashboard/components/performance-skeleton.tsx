import { Skeleton } from "@/common/components/ui/skeleton";
import { MessageCircle, MessageSquare } from "lucide-react";

const PerformanceSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
      {/* Message Performance Skeleton */}
      <div className="h-full">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Per Message
        </h4>
        <div className="space-y-3 overflow-y-auto h-80">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Performance Skeleton */}
      <div className="h-full">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Per Conversation
        </h4>
        <div className="space-y-3 overflow-y-auto h-80">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceSkeleton;
