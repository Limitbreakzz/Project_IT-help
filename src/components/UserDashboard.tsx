"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ImageOff, Trash2, Wrench, LogOut } from "lucide-react";
import { Ticket } from "@/types/ticket";
import { useTicketRealtime } from "@/hooks/useTicketRealtime";
import { StatusBadge } from "./ui/StatusBadge";
import { ImagePreviewModal } from "./ui/ImagePreviewModal";
import Portal from "./ui/Portal";

interface UserDashboardProps {
  initialTickets: Ticket[];
  userId: string;
  userRole?: string;
}

export default function UserDashboard({ initialTickets, userId, userRole }: UserDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "progress" | "completed">("pending");
  
  const { tickets, setTickets } = useTicketRealtime(userId, initialTickets);

  useEffect(() => {
    setMounted(true);
  }, []);

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tickets/${ticketToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete));
        setTicketToDelete(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "เกิดข้อผิดพลาดในการลบรายการ");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmCancel = async () => {
    if (!ticketToCancel) return;
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/tickets/${ticketToCancel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      if (response.ok) {
        const json = await response.json();
        const updatedTicket = json.data;
        setTickets((prev) => prev.map((t) => t.id === ticketToCancel ? updatedTicket : t));
        setTicketToCancel(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "เกิดข้อผิดพลาดในการยกเลิกรายการ");
      }
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsCancelling(false);
    }
  };

  const pendingCount = tickets.filter(t => t.status === "PENDING").length;
  const progressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const completedCount = tickets.filter(t => t.status === "RESOLVED" || t.status === "CANCELLED").length;

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "pending") return ticket.status === "PENDING";
    if (activeTab === "progress") return ticket.status === "IN_PROGRESS";
    if (activeTab === "completed") return ticket.status === "RESOLVED" || ticket.status === "CANCELLED";
    return true;
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">ประวัติการแจ้งซ่อม</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">ติดตามสถานะงานของคุณได้แบบ Real-time</p>
        </div>
        <Link 
          href="/" 
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] shadow-md shadow-primary-500/10 whitespace-nowrap"
        >
          + แจ้งซ่อมใหม่
        </Link>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2.5 px-4 py-3 border-b-2 font-black text-xs tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>รอรับงาน</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "pending"
              ? "bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          className={`flex items-center gap-2.5 px-4 py-3 border-b-2 font-black text-xs tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer ${
            activeTab === "progress"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>กำลังดำเนินการ</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "progress"
              ? "bg-blue-100 dark:bg-blue-950/45 text-blue-700 dark:text-blue-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}>
            {progressCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-2.5 px-4 py-3 border-b-2 font-black text-xs tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer ${
            activeTab === "completed"
              ? "border-green-500 text-green-600 dark:text-green-400"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <span>เสร็จสิ้น / ยกเลิก</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "completed"
              ? "bg-green-100 dark:bg-green-950/45 text-green-700 dark:text-green-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}>
            {completedCount}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 text-sm font-bold">
              {activeTab === "pending" && "ไม่มีรายการแจ้งซ่อมใหม่ (รอดำเนินการ)"}
              {activeTab === "progress" && "ไม่มีรายการที่กำลังดำเนินการขณะนี้"}
              {activeTab === "completed" && "ไม่มีประวัติรายการที่เสร็จสิ้นหรือถูกยกเลิก"}
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <TicketItem 
              key={ticket.id} 
              ticket={ticket} 
              mounted={mounted} 
              imageError={imageError}
              onImageError={(id) => setImageError(prev => ({ ...prev, [id]: true }))}
              onImageClick={() => setPreviewImage(ticket.imageUrl || null)}
              onDelete={() => setTicketToDelete(ticket.id)}
              onCancel={() => setTicketToCancel(ticket.id)}
            />
          ))
        )}
      </div>

      <ImagePreviewModal 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      {/* Premium Delete Confirmation Modal */}
      {ticketToDelete && (
        <Portal>
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">ยืนยันการลบประวัติ</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6">
                คุณต้องการลบประวัติการแจ้งซ่อมนี้ใช่หรือไม่? การดำเนินการนี้จะไม่สามารถกู้คืนข้อมูลกลับมาได้
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
                  onClick={confirmDelete}
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

      {/* Premium Cancel Confirmation Modal */}
      {ticketToCancel && (
        <Portal>
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">ยืนยันการยกเลิกแจ้งซ่อม</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6">
                คุณต้องการยกเลิกการแจ้งซ่อมรายการนี้ใช่หรือไม่? เมื่อยกเลิกแล้ว ช่างจะไม่สามารถเข้ามารับงานนี้ได้อีก
              </p>
              <div className="flex gap-4">
                <button
                  disabled={isCancelling}
                  onClick={() => setTicketToCancel(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  disabled={isCancelling}
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCancelling ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      กำลังยกเลิก...
                    </>
                  ) : (
                    "ยืนยันการยกเลิก"
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function TicketItem({ ticket, mounted, imageError, onImageError, onImageClick, onDelete, onCancel }: { 
  ticket: Ticket; 
  mounted: boolean; 
  imageError: Record<string, boolean>;
  onImageError: (id: string) => void;
  onImageClick: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-all duration-300">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{ticket.title}</h3>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-4">
          {mounted ? new Date(ticket.createdAt).toLocaleString('th-TH') : ""}
        </p>
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed whitespace-pre-line">
          {ticket.description.replace(/\[รหัสอุปกรณ์:[^\]]+\]\s*/g, "").replace(/\[ห้อง:[^\]]+\]\s*/g, "")}
        </p>

        {/* Device metadata display if present */}
        {(ticket.description.includes("[รหัสอุปกรณ์:") || ticket.description.includes("[ห้อง:")) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {ticket.description.match(/\[ห้อง:\s*([^\]]+)\]/)?.[1] && (
              <span className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">
                📍 ห้อง: {ticket.description.match(/\[ห้อง:\s*([^\]]+)\]/)?.[1]}
              </span>
            )}
            {ticket.description.match(/\[รหัสอุปกรณ์:\s*([^\]]+)\]/)?.[1] && (
              <span className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">
                🏷️ รหัสอุปกรณ์: {ticket.description.match(/\[รหัสอุปกรณ์:\s*([^\]]+)\]/)?.[1]}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="md:text-right flex flex-col justify-end gap-3 min-w-[220px]">
        {ticket.imageUrl && ticket.imageUrl !== "uploaded_image" && (
          imageError[ticket.id] ? (
            <div className="h-24 bg-red-50/40 dark:bg-red-950/10 rounded-2xl border border-dashed border-red-200 dark:border-red-900/40 flex flex-col items-center justify-center text-red-500 gap-1 p-2">
              <ImageOff className="w-5 h-5 opacity-75 text-red-400" />
              <span className="text-[10px] font-bold">โหลดภาพไม่สำเร็จ</span>
            </div>
          ) : (
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img 
                src={ticket.imageUrl} 
                onError={() => onImageError(ticket.id)}
                alt="รูปภาพปัญหา" 
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={onImageClick}
              />
            </div>
          )
        )}
        {ticket.status === "PENDING" ? (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-950/10 px-4 py-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/35 flex flex-col items-center justify-center gap-1.5 shadow-sm shadow-amber-500/5 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 tracking-wide uppercase">กำลังรอช่างรับงานซ่อม...</span>
            </div>
            <p className="text-[10px] text-amber-600/85 dark:text-amber-500/70 font-black">ความสำคัญประเมินโดย AI: {ticket.priority}</p>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 text-left md:text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">ช่างผู้รับผิดชอบ</p>
            <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200 flex items-center md:justify-end gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {ticket.technician?.name || "ไม่ทราบชื่อ"}
            </p>
          </div>
        )}

        {(ticket.status === "PENDING" || ticket.status === "IN_PROGRESS") && (
          <button
            onClick={onCancel}
            className="mt-2 w-full md:w-auto px-4 py-2 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 self-end cursor-pointer"
          >
            ยกเลิกแจ้งซ่อม
          </button>
        )}

        {(ticket.status === "RESOLVED" || ticket.status === "CANCELLED") && (
          <button
            onClick={onDelete}
            className="mt-2 w-full md:w-auto px-4 py-2 border border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 self-end cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            ลบประวัติงาน
          </button>
        )}
      </div>
    </div>
  );
}
