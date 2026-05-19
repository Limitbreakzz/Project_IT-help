"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Portal from "./Portal";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePreviewModal = ({ imageUrl, onClose }: ImagePreviewModalProps) => {
  if (!imageUrl) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <div 
          className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-800 animate-scale-up" 
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-900/60 hover:bg-slate-800/80 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src={imageUrl} 
            alt="พรีวิวรูปภาพปัญหา" 
            className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
          />
        </div>
      </div>
    </Portal>
  );
};
