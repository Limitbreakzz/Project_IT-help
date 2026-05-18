"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Toast from "@/components/Toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      } else {
        setToast({ message: "สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...", type: "success" });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
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
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-6 left-6 text-primary-600 hover:text-primary-800 font-medium flex items-center gap-2 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        กลับหน้าหลัก
      </Link>
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-primary-100 mt-12 animate-scale-up hover:shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">สมัครสมาชิก</h1>
          <p className="text-slate-500">สำหรับผู้แจ้งซ่อมทั่วไป</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อ-นามสกุล</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="สมชาย ใจดี"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
          >
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิกเลย"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-primary-600 hover:underline font-medium">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </main>
    </>
  );
}
