"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import Link from "next/link";
import { Wrench, Sparkles, Clock, MapPin, Tag, X, CheckCircle, Image as ImageIcon, ImageOff, Trash2 } from "lucide-react";
import Toast from "@/components/Toast";
import Portal from "./ui/Portal";

interface Ticket {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: string;
  priority: string;
  category: string | null;
  aiAnalysis: any;
  costEstimateMin: number | null;
  costEstimateMax: number | null;
  timeEstimate: string | null;
  createdAt: string | Date;
  technician?: { name: string | null } | null;
}

export default function AdminDashboard({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<{ [ticketId: string]: { id: string; name: string; quantity: number }[] }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<Ticket | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/inventory");
        if (res.ok) {
          const data = await res.json();
          setInventory(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load inventory:", err);
      }
    }
    fetchInventory();
  }, []);

  useEffect(() => {
    // Enable pusher logging - don't include this in production
    // Pusher.logToConsole = true;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "YOUR_PUSHER_KEY_HERE", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
    });

    const channel = pusher.subscribe("admin-channel");
    channel.bind("new-ticket", function (data: Ticket) {
      setTickets((prev) => [data, ...prev]);
      
      // Play a notification sound or show toast here
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`มีรายการแจ้งซ่อมใหม่: ${data.category}`, {
          body: `ความรุนแรง: ${data.priority}\nประเมินค่าใช้จ่าย: ฿${data.costEstimateMin}-฿${data.costEstimateMax}`
        });
      }
    });

    channel.bind("ticket-updated", function (data: Ticket) {
      setTickets((prev) => prev.map(t => {
        if (t.id === data.id) {
          const imageUrl = (data.imageUrl === "base64_image_too_large_for_pusher" || !data.imageUrl)
            ? t.imageUrl
            : data.imageUrl;
          return { ...data, imageUrl };
        }
        return t;
      }));
    });

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    return () => {
      pusher.unsubscribe("admin-channel");
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-100 text-red-800 border-red-200";
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM": return "bg-blue-100 text-blue-800 border-blue-200";
      case "LOW": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    // Haptic vibration feedback for mobile devices!
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([40]);
    }

    setLoadingStatus(prev => ({ ...prev, [id]: true }));
    try {
      const parts = selectedParts[id] || [];
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          usedParts: parts.map(p => ({ id: p.id, quantity: p.quantity }))
        })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      const json = await res.json();
      const updatedTicket = json.data;
      setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));

      setSelectedParts(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      setToast({
        message: "อัปเดตสถานะสำเร็จ!",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: "ไม่สามารถอัปเดตสถานะได้",
        type: "error"
      });
    } finally {
      setLoadingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tickets/${ticketToDelete}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete ticket");
      
      setTickets(prev => prev.filter(t => t.id !== ticketToDelete));
      setTicketToDelete(null);
      setToast({
        message: "ลบรายการแจ้งซ่อมสำเร็จ!",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: "ไม่สามารถลบรายการแจ้งซ่อมได้",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOrder: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 1,
    RESOLVED: 2,
    CANCELLED: 3
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 99;
    const orderB = statusOrder[b.status] ?? 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">รายการแจ้งซ่อม (Real-time)</h2>
          <p className="text-slate-500">ติดตามและจัดการคิวซ่อมบำรุงที่วิเคราะห์โดย AI</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800/30">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium">ระบบออนไลน์</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedTickets.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border-dashed">
            <p className="text-slate-500 text-lg">ยังไม่มีรายการแจ้งซ่อม</p>
          </div>
        ) : (
          sortedTickets.map((ticket) => (
            <div key={ticket.id} className="glass p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{ticket.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {mounted ? new Date(ticket.createdAt).toLocaleString('th-TH') : ""}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-foreground/80 font-medium">รายละเอียด:</p>
                  <p className="text-slate-600 dark:text-slate-300">{ticket.description}</p>
                </div>

                {ticket.aiAnalysis && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800/30">
                    <h4 className="text-sm font-bold text-primary-700 dark:text-primary-300 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      AI วิเคราะห์เบื้องต้น
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 block">หมวดหมู่</span>
                        <span className="font-medium text-foreground">{ticket.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">สาเหตุที่เป็นไปได้</span>
                        <span className="font-medium text-foreground">{ticket.aiAnalysis.cause || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">คาดการณ์ค่าใช้จ่าย</span>
                        <span className="font-medium text-foreground">
                          {ticket.costEstimateMin !== null && ticket.costEstimateMax !== null 
                            ? `฿${ticket.costEstimateMin} - ฿${ticket.costEstimateMax}`
                            : 'ไม่สามารถประเมินได้'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ระยะเวลาดำเนินงาน</span>
                        <span className="font-medium text-foreground">{ticket.timeEstimate || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-64 flex flex-col gap-3">
                {ticket.imageUrl === "base64_image_too_large_for_pusher" ? (
                  <div className="h-32 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2 p-4 text-center">
                    <ImageIcon className="w-8 h-8 text-primary-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-tight">มีรูปภาพแนบ (กดรีเฟรชเพื่อแสดงรูป)</span>
                  </div>
                ) : ticket.imageUrl && ticket.imageUrl !== "uploaded_image" ? (
                  imageError[ticket.id] ? (
                    <div className="h-32 bg-red-50/40 dark:bg-red-950/10 rounded-xl border border-dashed border-red-200 dark:border-red-900/30 flex flex-col items-center justify-center text-red-500 dark:text-red-400 gap-2 p-4">
                      <ImageOff className="w-8 h-8 opacity-75 text-red-400" />
                      <span className="text-xs font-bold tracking-tight">โหลดรูปภาพไม่สำเร็จ</span>
                    </div>
                  ) : (
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 relative">
                      <img 
                        src={ticket.imageUrl} 
                        onError={() => setImageError(prev => ({ ...prev, [ticket.id]: true }))}
                        alt="รูปภาพปัญหาแจ้งซ่อม" 
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImage(ticket.imageUrl)}
                      />
                    </div>
                  )
                ) : ticket.imageUrl === "uploaded_image" ? (
                  <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm">
                    [รูปภาพเก่าไม่สามารถดูได้]
                  </div>
                ) : (
                  <div className="h-32 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2 p-4">
                    <ImageIcon className="w-8 h-8 opacity-65 text-slate-350 dark:text-slate-600 animate-pulse" />
                    <span className="text-xs font-bold tracking-tight">ไม่มีรูปภาพแนบ</span>
                  </div>
                )}
                <div className="mt-auto flex flex-col gap-2">
                  {ticket.status === "PENDING" && (
                    <button 
                      onClick={() => handleStatusUpdate(ticket.id, "IN_PROGRESS")}
                      disabled={loadingStatus[ticket.id]}
                      className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-75 disabled:transform-none disabled:pointer-events-none text-sm"
                    >
                      {loadingStatus[ticket.id] ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          รับงานนี้ <Wrench className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  )}
                  {ticket.status === "IN_PROGRESS" && (
                    <div className="flex flex-col gap-2">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-xs text-slate-500 block">รับงานโดย:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{ticket.technician?.name || "ช่างซ่อม"}</span>
                      </div>
                      
                      {/* Inventory parts selector */}
                      <div className="text-left space-y-1 my-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">เบิกอะไหล่ (ถ้ามี)</label>
                        <select 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const item = inventory.find(x => x.id === val);
                            if (!item) return;
                            
                            const current = selectedParts[ticket.id] || [];
                            if (current.some(x => x.id === item.id)) return;
                            
                            setSelectedParts(prev => ({
                              ...prev,
                              [ticket.id]: [...current, { id: item.id, name: item.name, quantity: 1 }]
                            }));
                            e.target.value = "";
                          }}
                          className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 focus:outline-none"
                        >
                          <option value="">-- เลือกอะไหล่ --</option>
                          {inventory.map(item => (
                            <option key={item.id} value={item.id} disabled={item.quantity <= 0}>
                              {item.name} ({item.quantity > 0 ? `เหลือ ${item.quantity} ชิ้น` : "หมด!"})
                            </option>
                          ))}
                        </select>
                        
                        {/* Selected parts list */}
                        <div className="space-y-1.5 mt-2">
                          {(selectedParts[ticket.id] || []).map((part, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                              <span className="truncate max-w-[120px] font-semibold text-slate-700 dark:text-slate-300">{part.name}</span>
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  min="1"
                                  value={part.quantity}
                                  onChange={(e) => {
                                    const qty = parseInt(e.target.value) || 1;
                                    setSelectedParts(prev => ({
                                      ...prev,
                                      [ticket.id]: prev[ticket.id].map(x => x.id === part.id ? { ...x, quantity: qty } : x)
                                    }));
                                  }}
                                  className="w-8 p-0.5 border rounded text-center text-slate-900 bg-white dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                                />
                                <button 
                                  onClick={() => {
                                    setSelectedParts(prev => ({
                                      ...prev,
                                      [ticket.id]: prev[ticket.id].filter(x => x.id !== part.id)
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleStatusUpdate(ticket.id, "RESOLVED")}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                      >
                        ปิดงานซ่อมเสร็จสิ้น
                      </button>
                    </div>
                  )}

                  {(ticket.status === "RESOLVED" || ticket.status === "CANCELLED") && (
                    <button
                      onClick={() => setTicketToDelete(ticket.id)}
                      className="w-full py-2 border border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบรายการแจ้งซ่อม
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate([20]);
                      }
                      setSelectedTicketForDetails(ticket);
                    }}
                    className="w-full py-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    รายละเอียด
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Premium Ticket Details Modal */}
    {selectedTicketForDetails && (
      <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 rounded-t-3xl">
              <div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getPriorityColor(selectedTicketForDetails.priority)}`}>
                  {selectedTicketForDetails.priority}
                </span>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mt-2">
                  {selectedTicketForDetails.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicketForDetails(null)}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all duration-300 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: Photo */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ภาพถ่ายจากสถานที่จริง</span>
                  {selectedTicketForDetails.imageUrl ? (
                    <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group flex items-center justify-center">
                      <img 
                        src={imageError[selectedTicketForDetails.id] ? "https://placehold.co/600x400/e2e8f0/475569?text=Image+Not+Found" : selectedTicketForDetails.imageUrl} 
                        onError={() => setImageError(prev => ({ ...prev, [selectedTicketForDetails.id]: true }))}
                        alt="ภาพปัญหาแจ้งซ่อม" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-sm p-4 text-center">
                      <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      ไม่มีรูปภาพประกอบ
                    </div>
                  )}

                  {/* Device Info */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ข้อมูลระบุตำแหน่ง</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-500" /> สถานที่/ห้อง: <span className="font-normal text-slate-500">{selectedTicketForDetails.description.match(/\[ห้อง:\s*([^\]]+)\]/)?.[1] || "ไม่ได้ระบุห้อง"}</span>
                    </p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary-500" /> รหัสอุปกรณ์: <span className="font-normal text-slate-500">{selectedTicketForDetails.description.match(/\[รหัสอุปกรณ์:\s*([^\]]+)\]/)?.[1] || "ไม่มีรหัสอุปกรณ์"}</span>
                    </p>
                  </div>
                </div>

                {/* Right Side: AI Analytics Report */}
                <div className="space-y-6">
                  
                  {/* AI Diagnoses Card */}
                  <div className="bg-primary-50/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-primary-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center gap-2 text-primary-700 dark:text-primary-400">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="font-black text-sm uppercase tracking-wider">รายงานผลวิเคราะห์ AI อัจฉริยะ</h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-0.5">หมวดหมู่ปัญหา:</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 inline-block shadow-sm">
                          {selectedTicketForDetails.category || "ทั่วไป"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-0.5">วิเคราะห์สาเหตุที่เป็นไปได้:</span>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          {selectedTicketForDetails.aiAnalysis?.cause || "ไม่พบสาเหตุระบุแน่ชัดในรายงาน"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estimates Card */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block shrink-0">ประเมินงบประมาณ</span>
                      <p className="text-base md:text-lg font-black text-slate-800 dark:text-white mt-1 break-words whitespace-normal leading-tight">
                        ฿{selectedTicketForDetails.costEstimateMin || 0} - ฿{selectedTicketForDetails.costEstimateMax || 0}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block shrink-0">ประเมินเวลาซ่อม</span>
                      <p className="text-base md:text-lg font-black text-slate-800 dark:text-white mt-1 break-words whitespace-normal leading-tight flex items-center gap-1.5">
                        <Clock className="w-5 h-5 text-slate-400" /> {selectedTicketForDetails.timeEstimate || "ไม่ระบุ"}
                      </p>
                    </div>
                  </div>

                  {/* Reporter details */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ข้อมูลผู้แจ้งเรื่อง</span>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center font-black text-primary-700 dark:text-primary-400">
                        U
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {selectedTicketForDetails.technician?.name || "ผู้ใช้งานแจ้งระบบ"}
                        </p>
                        <p className="text-xs text-slate-400">
                          วันที่แจ้ง: {mounted ? new Date(selectedTicketForDetails.createdAt).toLocaleString("th-TH") : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Description Details */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">รายละเอียดคำอธิบายฉบับเต็ม</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                  {selectedTicketForDetails.description.replace(/\[รหัสอุปกรณ์:[^\]]+\]\s*/g, "").replace(/\[ห้อง:[^\]]+\]\s*/g, "")}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 rounded-b-3xl flex justify-end">
              <button 
                onClick={() => setSelectedTicketForDetails(null)}
                className="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      </Portal>
    )}

    {/* Premium Image Preview Modal (Light-box) */}
    {previewImage && (
      <Portal>
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-800 animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/60 hover:bg-slate-800/80 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="พรีวิวรูปภาพปัญหา" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      </Portal>
    )}

    {/* Premium Delete Confirmation Modal */}
    {ticketToDelete && (
      <Portal>
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">ยืนยันการลบรายการแจ้งซ่อม</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6">
              คุณต้องการลบรายการแจ้งซ่อมนี้ใช่หรือไม่? การดำเนินการนี้จะไม่สามารถกู้คืนข้อมูลกลับมาได้
            </p>
            <div className="flex gap-4">
              <button
                disabled={isDeleting}
                onClick={() => setTicketToDelete(null)}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังลบ...
                  </>
                ) : (
                  "ยืนยันการลบ"
                )}
              </button>
            </div>
          </div>
        </div>
      </Portal>
    )}
    </>
  );
}
