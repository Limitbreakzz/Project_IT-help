import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/UserDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  if (userRole === "ADMIN" || userRole === "TECHNICIAN") {
    redirect("/admin");
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { technician: true }
  });

  return (
    <main className="min-h-screen bg-slate-50 p-8 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <UserDashboard initialTickets={tickets} userId={userId} userRole={userRole} />
      </div>
    </main>
  );
}
