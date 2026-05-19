import React from "react";
import { StatCardSkeleton, TicketListSkeleton } from "@/components/SkeletonLoader";

export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header skeleton */}
      <div className="flex justify-between items-center mb-8 animate-pulse">
        <div className="space-y-2">
          <div className="w-56 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="w-72 h-4 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
        </div>
        <div className="w-32 h-9 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      </div>

      {/* Stats Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Main dashboard content layout */}
      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-between items-center">
          <div className="w-48 h-7 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
        
        {/* Ticket queue items skeleton */}
        <TicketListSkeleton />
      </div>
    </div>
  );
}
