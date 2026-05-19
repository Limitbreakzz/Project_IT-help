"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  QrCode, 
  Users, 
  Package, 
  LogOut, 
  Wrench, 
  BarChart3,
  User
} from "lucide-react";

interface NavigationShellProps {
  children: React.ReactNode;
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  };
}

export default function NavigationShell({ children, session }: NavigationShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const user = session?.user;
  const role = user?.role || "USER";

  const adminLinks = [
    { href: "/admin", label: "วิเคราะห์ข้อมูล (Analytics)", icon: BarChart3 },
    { href: "/admin/assets", label: "จัดการ QR Code อุปกรณ์", icon: QrCode },
    { href: "/admin/technicians", label: "จัดการข้อมูลช่างซ่อม", icon: Users },
    { href: "/admin/inventory", label: "จัดการคลังอะไหล่", icon: Package },
  ];

  const technicianLinks = [
    { href: "/technician", label: "กระดานรับงาน (Queue)", icon: Wrench },
  ];

  const links = role === "ADMIN" ? adminLinks : technicianLinks;
  const panelTitle = role === "ADMIN" ? "Admin Control Panel" : "Technician Control Panel";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-600" /> IT Helpdesk
            </h1>
            <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">{panelTitle}</p>
          </div>
          <button 
            className="md:hidden p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  isActive 
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/25 scale-[1.02]" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-500"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 rounded-b-3xl">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-3 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/40">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-black">
            {user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-400 font-semibold truncate capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-primary-600 dark:text-primary-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 dark:text-white leading-none">IT Helpdesk</h1>
            <p className="text-[9px] text-slate-400 font-black tracking-widest mt-0.5 uppercase">{role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-700 dark:text-primary-400 text-xs font-black">
            {user?.name?.[0] || "U"}
          </div>
          <button 
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 sticky top-0 h-screen z-30">
        <div className="w-full h-full">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Sidebar Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative w-80 max-w-sm bg-white dark:bg-slate-900 h-full flex flex-col z-10 shadow-2xl animate-slide-right">
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
