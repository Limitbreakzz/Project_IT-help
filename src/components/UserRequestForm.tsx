"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, MonitorSmartphone, ImagePlus, X, Loader2 } from "lucide-react";

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
          message: `ถูกปฏิเสธ: ${errorData.reason || "ไม่เกี่ยวกับอุปกรณ์ IT"}. กรุณาแจ้งปัญหาที่เกี่ยวข้องกับ IT เท่านั้น`,
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground/80">
            <MapPin className="w-4 h-4 text-primary-500" /> สถานที่ / ห้อง (ระบุถ้ามี)
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="เช่น ห้อง 404, ชั้น 2"
            className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="deviceId" className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground/80">
            <MonitorSmartphone className="w-4 h-4 text-primary-500" /> รหัสอุปกรณ์ (ระบุถ้ามี)
          </label>
          <input
            type="text"
            id="deviceId"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="เช่น PC-1234, AC-01"
            className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground/80">ถ่ายรูปปัญหา (ถ้ามี)</label>
        <div className="relative border-2 border-dashed border-primary-200 rounded-xl hover:border-primary-500 transition-colors bg-primary-50/30 overflow-hidden group">
          {imagePreview ? (
            <div className="relative w-full h-48">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 cursor-pointer">
              <ImagePlus className="w-10 h-10 text-primary-400 mb-2" />
              <span className="text-sm text-primary-600 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium mb-2 text-foreground/80">อธิบายปัญหา (เฉพาะปัญหา IT)</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="เช่น เปิดคอมไม่ติด, เน็ตใช้งานไม่ได้, พริ้นเตอร์ไม่ออก, หรือจอฟ้า (กรุณาแจ้งเฉพาะปัญหาด้านไอที)"
          className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none shadow-sm"
          required={!imagePreview}
        />
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <MonitorSmartphone className="w-3 h-3" /> ระบบนี้รองรับเฉพาะการแจ้งซ่อมคอมพิวเตอร์ อุปกรณ์ไอที และเน็ตเวิร์คเท่านั้น
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (!description && !imagePreview)}
        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin w-5 h-5" />
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
