"use client";

import { useState } from "react";

export default function AssetsPage() {
  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return;

    // Construct the direct scanner URL pointing to our homepage
    const baseUrl = window.location.origin;
    const finalUrl = `${baseUrl}/?deviceId=${encodeURIComponent(deviceId)}&location=${encodeURIComponent(location)}`;
    setTargetUrl(finalUrl);

    // Call QR Code generator API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(finalUrl)}`;
    setQrUrl(qrApiUrl);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-4xl mx-auto print:p-0 animate-fade-in-up">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            ระบบจัดการ QR Code อุปกรณ์ IT (Asset QR Code)
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            สร้างสติกเกอร์ QR Code เพื่อติดบนคอมพิวเตอร์ หรืออุปกรณ์ต่างๆ ในองค์กร
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
        {/* Form - Hidden on Print */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 print:hidden">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">ระบุรายละเอียดอุปกรณ์</h3>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                รหัสครุภัณฑ์ / รหัสอุปกรณ์ (Device ID) *
              </label>
              <input
                type="text"
                required
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="เช่น PC-301-05, PRINTER-OFFICE-01"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                สถานที่ตั้ง / ห้อง (Location)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น ห้องปฏิบัติการ 301, สำนักงานชั้น 2"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              สร้าง QR Code ⚡
            </button>
          </form>

          <div className="bg-primary-50 dark:bg-primary-950/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800/30 text-xs text-primary-700 dark:text-primary-300 space-y-2">
            <p className="font-bold">💡 ประโยชน์ของ QR Code แจ้งซ่อม:</p>
            <p>1. แปะไว้บนเครื่องคอมพิวเตอร์ โต๊ะทำงาน หรืออุปกรณ์หลัก</p>
            <p>2. ผู้ใช้งานสแกนด้วยสมาร์ทโฟนแล้วจะแจ้งซ่อมได้ทันที</p>
            <p>3. ระบบจะกรอกรหัสอุปกรณ์และสถานที่ให้เองโดยผู้ใช้ไม่ต้องกรอกข้อมูลผิดพลาด</p>
          </div>
        </div>

        {/* Dynamic Printable Sticker Output */}
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 print:shadow-none print:border-none print:p-0 print:w-full">
          {qrUrl ? (
            <div className="w-full flex flex-col items-center gap-6">
              {/* STICKER LAYOUT */}
              <div className="w-64 border-4 border-slate-900 p-6 rounded-2xl text-center bg-white flex flex-col items-center gap-4 shadow-md print:shadow-none print:border-4 print:border-slate-900 print:mx-auto">
                <div className="w-full bg-slate-900 text-white py-1 rounded font-bold text-xs uppercase tracking-wider">
                  IT Support QR Code
                </div>
                
                {/* QR Code image */}
                <div className="w-48 h-48 flex items-center justify-center border border-slate-200 rounded p-1 bg-white">
                  <img src={qrUrl} alt="Device QR Code" className="w-full h-full object-contain" />
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Device ID</p>
                  <p className="text-lg font-extrabold text-slate-900">{deviceId}</p>
                  {location && (
                    <p className="text-xs text-slate-700 font-semibold mt-1">📍 {location}</p>
                  )}
                </div>

                <div className="text-[9px] text-slate-400 font-medium">
                  สแกนเพื่อแจ้งปัญหาคอมพิวเตอร์ / เครือข่าย
                </div>
              </div>

              {/* Action buttons - Hidden on Print */}
              <div className="flex gap-4 w-full justify-center print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  สั่งพิมพ์สติกเกอร์ (Print)
                </button>
              </div>

              {/* Target Scan URL preview - Hidden on print */}
              <div className="text-xs text-slate-400 text-center max-w-xs break-all print:hidden">
                <span className="font-bold">ลิงก์ของ QR Code นี้:</span><br />
                <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {targetUrl}
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
              <p className="text-sm font-semibold">กรอกข้อมูลด้านซ้ายเพื่อแสดงตัวอย่าง QR Code ที่พร้อมพิมพ์</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
