import prisma from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TechnicianPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "TECHNICIAN")) {
    redirect("/login");
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <AdminDashboard initialTickets={tickets} />
      </div>
    </div>
  );
}
