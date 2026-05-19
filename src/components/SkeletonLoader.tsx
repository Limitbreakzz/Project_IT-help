import React from "react";

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="w-24 h-4 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
      </div>
      <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      <div className="w-32 h-3.5 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
    </div>
  );
}

export function TicketListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="w-48 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="w-32 h-4 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
              </div>
              <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-4 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
              <div className="w-2/3 h-4 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="w-24 h-4 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
                <div className="w-32 h-4 bg-slate-150 dark:bg-slate-700 rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-3 justify-between">
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            <div className="w-full h-11 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden animate-pulse">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="w-36 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex-1 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="w-24 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="w-24 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="flex-1 h-5 bg-slate-150 dark:bg-slate-700 rounded"></div>
            <div className="w-24 h-5 bg-slate-150 dark:bg-slate-700 rounded"></div>
            <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
