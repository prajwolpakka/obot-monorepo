import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";

const SubscriptionSkeleton = () => (
  <div className="p-4 h-full w-full overflow-hidden">
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full min-h-0">
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>

          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="flex gap-4">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SubscriptionSkeleton;

