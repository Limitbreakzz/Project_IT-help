import { PrismaClient } from "@prisma/client";
import AdminDashboard from "@/components/AdminDashboard";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function TechnicianPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  return (
    <div className="p-8 animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <AdminDashboard initialTickets={tickets} />
      </div>
    </div>
  );
}
