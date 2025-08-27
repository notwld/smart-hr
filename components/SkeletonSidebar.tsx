"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-white shadow-sm">
      {/* Logo Section */}
      <div className="border-b p-6">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-4 space-y-2">
        {/* Navigation Items */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </aside>
  );
}
