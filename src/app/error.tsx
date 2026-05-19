"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCw, Home, RefreshCw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your analytics or reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  const isConnectionError = 
    error.message?.includes("connections") || 
    error.message?.includes("connection") ||
    error.message?.includes("PrismaClient") ||
    error.message?.includes("Can't reach database") ||
    error.message?.includes("1040");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50 text-center space-y-6 animate-scale-up">
        {/* Animated Warning Icon */}
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-red-100 dark:border-red-900/30 relative">
          <AlertOctagon className="w-8 h-8 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {isConnectionError ? "การเชื่อมต่อขัดข้อง" : "เกิดข้อผิดพลาดในการโหลด"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {isConnectionError 
              ? "ไม่สามารถเชื่อมต่อฐานข้อมูลหรือเซิร์ฟเวอร์ตอบสนองช้าเกินไป เนื่องจากจำนวนผู้ใช้งานหนาแน่น กรุณาลองใหม่อีกครั้งครับ"
              : "ระบบพบข้อผิดพลาดบางประการระหว่างการประมวลผลคำขอของคุณ"}
          </p>
        </div>

        {/* Error diagnosis box */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left font-mono text-[11px] text-slate-400 dark:text-slate-500 overflow-x-auto max-h-24 break-words">
          <span className="font-bold text-slate-500 block mb-1">Diagnostic Report:</span>
          {error.message || "Unknown error occurred"}
          {error.digest && <span className="block mt-1">Digest: {error.digest}</span>}
        </div>

        {/* Navigation / Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <RotateCw className="w-4 h-4 animate-spin-reverse" />
            ลองอีกครั้ง (Retry)
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[0.98] text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
