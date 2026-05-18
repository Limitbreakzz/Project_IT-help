"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import Link from "next/link";
import Toast from "@/components/Toast";

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
      setTickets((prev) => prev.map(t => t.id === data.id ? data : t));
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
        {tickets.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border-dashed">
            <p className="text-slate-500 text-lg">ยังไม่มีรายการแจ้งซ่อม</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="glass p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{ticket.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{new Date(ticket.createdAt).toLocaleString('th-TH')}</p>
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
                          {ticket.costEstimateMin && ticket.costEstimateMax 
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
                {ticket.imageUrl && ticket.imageUrl !== "uploaded_image" && (
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                    <img 
                      src={ticket.imageUrl} 
                      alt="รูปภาพปัญหาแจ้งซ่อม" 
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(ticket.imageUrl || "", "_blank")}
                    />
                  </div>
                )}
                {ticket.imageUrl === "uploaded_image" && (
                  <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm">
                    [รูปภาพเก่าไม่สามารถดูได้]
                  </div>
                )}
                <div className="mt-auto flex flex-col gap-2">
                  {ticket.status === "PENDING" && (
                    <button 
                      onClick={() => handleStatusUpdate(ticket.id, "IN_PROGRESS")}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                      รับงานนี้
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
                  <button className="w-full py-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-border rounded-lg font-medium transition-colors">
                    รายละเอียด
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
