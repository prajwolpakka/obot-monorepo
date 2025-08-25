import { Card, CardContent, CardHeader } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";

const DashboardSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="space-y-2">
      <Skeleton className="h-9 w-64 bg-white" />
      <Skeleton className="h-5 w-96 bg-white" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-5 rounded" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-32 rounded" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>

    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
          <div className="h-full">
            <Skeleton className="h-5 w-32 mb-3" />
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
          <div className="h-full">
            <Skeleton className="h-5 w-32 mb-3" />
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
      </CardContent>
    </Card>
  </div>
);

export default DashboardSkeleton;
