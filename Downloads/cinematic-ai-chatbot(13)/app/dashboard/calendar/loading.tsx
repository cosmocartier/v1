import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="flex flex-col w-full h-full min-h-screen p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm p-4 sm:p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full max-w-md" />
          <div className="grid grid-cols-7 gap-2">
            {Array(35)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
