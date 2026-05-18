"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";

interface Technician {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
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

      setToast({ message: "เพิ่มข้อมูลช่างซ่อมคนใหม่สำเร็จ! ✨", type: "success" });
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

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <div className="p-8 space-y-8 max-w-5xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              จัดการข้อมูลช่างซ่อม (Back-office)
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              เพิ่มบัญชีช่างซ่อมบำรุง และควบคุมความปลอดภัยของระบบ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Technician Form Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">เพิ่มช่างซ่อมคนใหม่</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  อีเมล (Email) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="somchai@company.com"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  รหัสผ่าน (Password) *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านขั้นต่ำ 6 ตัวอักษร"
                  minLength={6}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                {submitLoading ? "กำลังบันทึก..." : "เพิ่มช่างซ่อมคนใหม่ ➕"}
              </button>
            </form>
          </div>

          {/* Technician List Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
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
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">ชื่อช่าง</th>
                      <th className="p-4">อีเมล</th>
                      <th className="p-4">วันที่เพิ่มข้อมูล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {technicians.map((tech) => (
                      <tr key={tech.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors text-sm">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-extrabold text-xs">
                            {tech.name[0]}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
