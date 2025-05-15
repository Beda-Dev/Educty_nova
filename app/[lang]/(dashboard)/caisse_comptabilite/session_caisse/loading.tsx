import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-[140px]" />
              <Skeleton className="h-10 w-[160px]" />
              <Skeleton className="h-10 w-[140px]" />
              <Skeleton className="h-10 w-[240px]" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-9 gap-4 mb-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>

              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-9 gap-4 mb-4">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <Skeleton key={j} className="h-10" />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-5 w-64" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
