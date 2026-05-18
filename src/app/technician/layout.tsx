import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  if ((session.user as any).role === "USER") {
    redirect("/dashboard");
  }

  if ((session.user as any).role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">IT Helpdesk</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Technician Control Panel</p>
          </div>
          
          <nav className="p-4 space-y-2">
            <Link href="/technician" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              กระดานรับงาน (Queue)
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {(session.user as any).name?.[0] || "T"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{(session.user as any).name}</p>
              <p className="text-xs text-slate-500">{(session.user as any).role}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
