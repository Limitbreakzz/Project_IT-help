"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-300 shadow-emerald-500/5";
      case "error":
        return "bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-300 shadow-rose-500/5";
      case "info":
      default:
        return "bg-sky-50/90 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/30 text-sky-800 dark:text-sky-300 shadow-sky-500/5";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✨";
      case "error":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 ease-out animate-bounce-subtle ${getStyles()}`}>
      <span className="text-xl leading-none">{getIcon()}</span>
      <div className="flex flex-col">
        <p className="text-sm font-bold tracking-wide leading-tight">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="ml-3 hover:opacity-50 transition-opacity text-current font-bold text-lg leading-none"
      >
        ✕
      </button>
    </div>
  );
}
