import UserRequestForm from "@/components/UserRequestForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Zap, Lock } from "lucide-react";
import UserHeader from "@/components/UserHeader";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && ((session.user as any).role === "ADMIN" || (session.user as any).role === "TECHNICIAN")) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased">
      <UserHeader session={session} />
      
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-400/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 py-8">
          <div className="flex-1 text-center lg:text-left animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight mb-4 leading-tight">
              ระบบแจ้งซ่อม <span className="text-primary-600 dark:text-primary-400">IT Helpdesk</span>
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 flex flex-wrap items-center justify-center lg:justify-start gap-1 leading-relaxed">
              เพียงแค่ถ่ายรูปปัญหา AI ของเราจะวิเคราะห์อาการ แนะนำช่าง และประเมินค่าใช้จ่ายเบื้องต้นให้คุณทันที <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-400 dark:text-slate-500 mb-8">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></span> AI วิเคราะห์แม่นยำ
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></span> แจ้งเตือนช่างทันที
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-start">
              {session ? (
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 font-black text-sm rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800/80 hover:scale-[1.02]"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  ดูประวัติการแจ้งซ่อมของฉัน
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-2xl shadow-md shadow-primary-500/25 transition-all hover:scale-[1.02]"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  เข้าสู่ระบบเพื่อใช้งาน
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg animate-fade-in-up [animation-delay:200ms] fill-mode-forwards">
            {session ? (
              <UserRequestForm />
            ) : (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800/60 text-center">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">ต้องเข้าสู่ระบบก่อนแจ้งซ่อม</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">เพื่อให้เรารู้ว่าใครเป็นผู้แจ้งและสามารถติดตามสถานะงานได้ กรุณาเข้าสู่ระบบก่อนครับ</p>
                <Link href="/login" className="block w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-2xl shadow-md shadow-primary-500/25 transition-colors">
                  ไปที่หน้าเข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
