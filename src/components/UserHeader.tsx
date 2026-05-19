"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Wrench, History, PlusCircle, LogOut } from "lucide-react";

interface UserHeaderProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  } | null;
}

export default function UserHeader({ session }: UserHeaderProps) {
  const pathname = usePathname();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-45 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2.5 bg-primary-600 text-white rounded-2xl shadow-md shadow-primary-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 dark:text-white leading-none">IT Helpdesk</h1>
            <p className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-0.5 uppercase">ระบบบริการแจ้งซ่อม</p>
          </div>
        </Link>

        {/* Navigation Tabs (Only if logged in) */}
        {user && (
          <nav className="flex items-center gap-2 bg-slate-100/85 dark:bg-slate-800/60 p-1 rounded-2xl">
            <Link 
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                pathname === "/"
                  ? "bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm scale-102"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              แจ้งซ่อมใหม่
            </Link>
            <Link 
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                pathname === "/dashboard"
                  ? "bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm scale-102"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <History className="w-4 h-4" />
              ประวัติการแจ้งซ่อม
            </Link>
          </nav>
        )}

        {/* User Card / Login Action */}
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ผู้แจ้งซ่อม</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-red-100 dark:border-red-900/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs transition-all duration-300 shadow-md shadow-primary-500/20"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
