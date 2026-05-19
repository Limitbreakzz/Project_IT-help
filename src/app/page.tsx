import UserRequestForm from "@/components/UserRequestForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Zap, LogIn, Lock } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && ((session.user as any).role === "ADMIN" || (session.user as any).role === "TECHNICIAN")) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary-900 dark:text-primary-50 tracking-tight mb-4">
            ระบบแจ้งซ่อม <span className="text-primary-600 dark:text-primary-400">IT Helpdesk</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto md:mx-0 flex flex-wrap items-center justify-center md:justify-start gap-1">
            เพียงแค่ถ่ายรูปปัญหา AI ของเราจะวิเคราะห์อาการ แนะนำช่าง และประเมินค่าใช้จ่ายเบื้องต้นให้คุณทันที <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span> AI วิเคราะห์แม่นยำ
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span> แจ้งเตือนช่างทันที
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start">
            {session ? (
              <Link 
                href={
                  (session.user as any).role === "ADMIN" ? "/admin" :
                  (session.user as any).role === "TECHNICIAN" ? "/technician" :
                  "/dashboard"
                } 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-primary-600 font-bold rounded-xl shadow-md hover:shadow-lg transition-all border border-primary-100 dark:border-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                {(session.user as any).role === "ADMIN" ? "เข้าสู่ระบบจัดการแอดมิน" : 
                 (session.user as any).role === "TECHNICIAN" ? "เข้าสู่กระดานงานช่างซ่อม" : 
                 "ดูประวัติการแจ้งซ่อมของฉัน"}
              </Link>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-primary-600 font-bold rounded-xl shadow-md hover:shadow-lg transition-all border border-primary-100 dark:border-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                เข้าสู่ระบบเพื่อใช้งาน
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg animate-fade-in-up [animation-delay:200ms] fill-mode-forwards">
          {session ? (
            <UserRequestForm />
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">ต้องเข้าสู่ระบบก่อนแจ้งซ่อม</h3>
              <p className="text-slate-500 mb-6">เพื่อให้เรารู้ว่าใครเป็นผู้แจ้งและสามารถติดตามสถานะงานได้ กรุณาเข้าสู่ระบบก่อนครับ</p>
              <Link href="/login" className="block w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-colors">
                ไปที่หน้าเข้าสู่ระบบ
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
