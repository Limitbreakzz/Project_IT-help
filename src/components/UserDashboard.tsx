"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: string;
  createdAt: Date | string;
  technician?: { name: string | null } | null;
}

export default function UserDashboard({ initialTickets, userId, userRole }: { initialTickets: any[], userId: string, userRole?: string }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "YOUR_PUSHER_KEY_HERE", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
    });

    const channel = pusher.subscribe(`user-channel-${userId}`);
    
    channel.bind("ticket-updated", function (data: Ticket) {
      setTickets((prev) => prev.map(t => t.id === data.id ? data : t));
    });

    return () => {
      pusher.unsubscribe(`user-channel-${userId}`);
    };
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">รอรับงาน</span>;
      case "IN_PROGRESS": return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">กำลังดำเนินการ</span>;
      case "RESOLVED": return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">เสร็จสิ้น</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">ประวัติการแจ้งซ่อม</h2>
          <p className="text-slate-500">ติดตามสถานะงานของคุณได้แบบ Real-time</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
            + แจ้งซ่อมใหม่
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors whitespace-nowrap">
            ออกจากระบบ
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">คุณยังไม่มีประวัติการแจ้งซ่อม</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-800">{ticket.title}</h3>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  {mounted ? new Date(ticket.createdAt).toLocaleString('th-TH') : ""}
                </p>
                <p className="text-slate-700">{ticket.description}</p>
              </div>
              
              <div className="md:text-right flex flex-col justify-end gap-3 min-w-[200px]">
                {ticket.imageUrl && ticket.imageUrl !== "uploaded_image" && (
                  <div className="h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={ticket.imageUrl} 
                      alt="รูปภาพปัญหา" 
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(ticket.imageUrl || "", "_blank")}
                    />
                  </div>
                )}
                {ticket.status === "PENDING" ? (
                  <p className="text-slate-500 text-sm">กำลังรอช่างรับงาน...</p>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">ช่างผู้รับผิดชอบ:</p>
                    <p className="font-bold text-slate-700 flex items-center md:justify-end gap-2">
                      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {ticket.technician?.name || "ไม่ทราบชื่อ"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
