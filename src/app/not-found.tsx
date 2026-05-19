import React from "react";
import Link from "next/link";
import { MonitorOff, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50 text-center space-y-6 animate-scale-up">
        {/* Sleek Disconnected Computer SVG/Icon */}
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-slate-200/50 dark:border-slate-700/50 relative">
          <MonitorOff className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500">
            404
          </div>
        </div>

        {/* Header and Details */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">ไม่พบหน้าเว็บ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            ขออภัยด้วยครับ ทางฝ่ายบริการ IT Helpdesk ไม่พบหน้าเว็บที่คุณต้องการค้นหา หรือหน้านี้อาจจะถูกย้าย/ลบไปแล้วครับ
          </p>
        </div>

        {/* Graphical computer cable SVG */}
        <div className="py-4 flex justify-center">
          <svg className="w-32 h-12 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 120 40">
            <path d="M10 20 H 50 Q 60 20 60 30 T 70 20 H 110" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="10" cy="20" r="4" fill="currentColor" />
            <circle cx="110" cy="20" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </Link>
          
          <Link
            href="/login"
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[0.98] text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
