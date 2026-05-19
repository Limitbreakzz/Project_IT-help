"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import { Pencil, Trash2, UserPlus, Key, Mail, User, ShieldAlert, X } from "lucide-react";

interface Technician {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Edit state
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingTech, setDeletingTech] = useState<Technician | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  async function fetchTechnicians() {
    try {
      const res = await fetch("/api/admin/technicians");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTechnicians(data);
    } catch (err) {
      console.error(err);
      setToast({ message: "ล้มเหลวในการโหลดรายชื่อช่างซ่อม", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setSubmitLoading(true);
    try {
      const res = await fetch("/api/admin/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      setToast({ message: "เพิ่มข้อมูลช่างซ่อมคนใหม่สำเร็จ!", type: "success" });
      setName("");
      setEmail("");
      setPassword("");
      fetchTechnicians(); // Refresh list
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "เกิดข้อผิดพลาดในการบันทึก", type: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (tech: Technician) => {
    setEditingTech(tech);
    setEditName(tech.name);
    setEditPassword("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech || !editName) return;

    setEditLoading(true);
    try {
      const res = await fetch("/api/admin/technicians", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTech.id,
          name: editName,
          password: editPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการแก้ไข");
      }

      setToast({ message: "แก้ไขข้อมูลช่างซ่อมสำเร็จ!", type: "success" });
      setEditingTech(null);
      fetchTechnicians();
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "เกิดข้อผิดพลาดในการบันทึก", type: "error" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingTech) return;

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/technicians", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingTech.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");
      }

      setToast({ message: "ลบบัญชีช่างซ่อมเรียบร้อยแล้ว", type: "success" });
      setDeletingTech(null);
      fetchTechnicians();
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "เกิดข้อผิดพลาดในการลบ", type: "error" });
    } finally {
      setDeleteLoading(false);
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
      
      <div className="p-8 space-y-8 max-w-6xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-primary-500" />
              จัดการข้อมูลช่างซ่อม (Back-office)
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              ควบคุม เพิ่ม แก้ไข หรือระงับการเข้าใช้ระบบของช่างไอทีบำรุง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Technician Form Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 h-fit space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-500" />
              เพิ่มช่างซ่อมคนใหม่
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <User className="w-4 h-4 text-slate-400" /> ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Mail className="w-4 h-4 text-slate-400" /> อีเมล (Email) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="somchai@company.com"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Key className="w-4 h-4 text-slate-400" /> รหัสผ่าน (Password) *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านขั้นต่ำ 6 ตัวอักษร"
                  minLength={6}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] text-sm cursor-pointer"
              >
                {submitLoading ? "กำลังบันทึก..." : "เพิ่มช่างซ่อมคนใหม่"}
              </button>
            </form>
          </div>

          {/* Technician List Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">รายชื่อช่างซ่อมทั้งหมดในระบบ</h3>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
                ))}
              </div>
            ) : technicians.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm font-semibold">ยังไม่มีบัญชีช่างซ่อมในระบบหลักบ้าน</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="p-4">ชื่อช่าง</th>
                      <th className="p-4">อีเมล</th>
                      <th className="p-4">วันที่เพิ่มข้อมูล</th>
                      <th className="p-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {technicians.map((tech) => (
                      <tr key={tech.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors text-sm">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 flex items-center justify-center font-extrabold text-xs shadow-sm">
                            {tech.name ? tech.name[0].toUpperCase() : "T"}
                          </div>
                          {tech.name}
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{tech.email}</td>
                        <td className="p-4 text-slate-400 font-medium">
                          {new Date(tech.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleEditClick(tech)}
                              className="p-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors cursor-pointer"
                              title="แก้ไขข้อมูลช่าง"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTech(tech)}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title="ลบบัญชีช่าง"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal (Glassmorphism design) */}
      {editingTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200/60 dark:border-slate-700 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary-500" />
                แก้ไขข้อมูลช่างซ่อม
              </h3>
              <button onClick={() => setEditingTech(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Mail className="w-4 h-4 text-slate-400" /> อีเมลผู้ใช้ (ห้ามแก้ไข)
                </label>
                <input
                  type="email"
                  disabled
                  value={editingTech.email}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 cursor-not-allowed outline-none text-sm font-medium shadow-sm"
                />
                <p className="text-[10px] text-red-500 dark:text-red-400/80 mt-1 font-bold">อีเมลเป็นคีย์หลักในระบบไม่สามารถแก้ไขได้</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <User className="w-4 h-4 text-slate-400" /> ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Key className="w-4 h-4 text-slate-400" /> รหัสผ่านใหม่ (ปล่อยว่างหากไม่ต้องการเปลี่ยน)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  minLength={6}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTech(null)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-sm cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-750 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] text-sm cursor-pointer"
                >
                  {editLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200/60 dark:border-slate-700 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-red-100 dark:border-red-900/20">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                ยืนยันการลบบัญชีช่าง?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีช่างคุณ <span className="font-bold text-slate-800 dark:text-white">"{deletingTech.name}"</span>?
                การลบจะยกเลิกการเชื่อมโยงบัญชีและป้องกันการเข้าสู่ระบบ แต่ประวัติการซ่อมจะยังคงอยู่
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTech(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-sm cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-750 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] text-sm cursor-pointer"
              >
                {deleteLoading ? "กำลังลบ..." : "ยืนยันการลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
