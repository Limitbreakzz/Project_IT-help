"use client";

import React from "react";
import { Monitor } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 animate-pulse">
        {/* Elegant pulsing icon */}
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-primary-200 dark:border-primary-800">
          <Monitor className="w-10 h-10 animate-bounce" />
        </div>
        
        {/* Loading text and shimmering bars */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">IT Helpdesk</h2>
          <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">กำลังเชื่อมต่อและโหลดข้อมูลระบบอัจฉริยะกรุณารอสักครู่...</p>
        </div>
        
        {/* Shimmer loading indicator */}
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-shimmer" style={{
            animation: 'shimmer 1.5s infinite ease-in-out'
          }}></div>
        </div>
      </div>
      
      {/* Styles for the loading animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
