"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Toast from "@/components/Toast";

export default function UserRequestForm() {
  const searchParams = useSearchParams();
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const devId = searchParams.get("deviceId") || "";
    const loc = searchParams.get("location") || "";
    if (devId) setDeviceId(devId);
    if (loc) setLocation(loc);
  }, [searchParams]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !imagePreview) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/analyze-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, image: imagePreview, deviceId, location }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setToast({
          message: `ระบบถูกปฏิเสธ: ${errorData.reason || errorData.error}`,
          type: "error"
        });
        return;
      }

      const data = await res.json();
      console.log(data);
      setDescription("");
      setImagePreview(null);
      setToast({
        message: "แจ้งซ่อมสำเร็จ! AI กำลังประเมินและส่งให้ช่าง",
        type: "success"
      });
    } catch (error) {
      console.error(error);
      setToast({
        message: "เกิดข้อผิดพลาดในการแจ้งซ่อม",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-6 glass rounded-2xl shadow-xl border border-border/50 transition-all">
      <h2 className="text-2xl font-bold mb-2 text-foreground">แจ้งปัญหาการใช้งาน</h2>
      
      {deviceId && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-primary-200 dark:border-slate-600 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
            📍
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">สแกนอุปกรณ์สำเร็จ</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {deviceId} {location ? `(ห้อง ${location})` : ""}
            </p>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground/80">ถ่ายรูปปัญหา (ถ้ามี)</label>
        <div className="relative border-2 border-dashed border-primary-200 rounded-xl hover:border-primary-500 transition-colors bg-primary-50/30 overflow-hidden group">
          {imagePreview ? (
            <div className="relative w-full h-48">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 cursor-pointer">
              <svg className="w-10 h-10 text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-sm text-primary-600 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium mb-2 text-foreground/80">อธิบายปัญหา</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="เช่น แอร์น้ำหยด, ไฟกระพริบ, ท่อน้ำแตก..."
          className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none shadow-sm"
          required={!imagePreview}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (!description && !imagePreview)}
        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังวิเคราะห์ข้อมูลด้วย AI...
          </span>
        ) : (
          "ส่งแจ้งซ่อม"
        )}
      </button>
    </form>
    </>
  );
}
