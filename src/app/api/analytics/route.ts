import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Status breakdown
    const statusCounts = await prisma.ticket.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // 2. Priority breakdown
    const priorityCounts = await prisma.ticket.groupBy({
      by: ["priority"],
      _count: { id: true },
    });

    // 3. Category breakdown
    const categoryCounts = await prisma.ticket.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    // 4. Monthly breakdown (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        costEstimateMax: true,
      },
    });

    // Process monthly data
    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const last6Months: { [key: string]: { count: number; totalCost: number } } = {};
    
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      last6Months[label] = { count: 0, totalCost: 0 };
    }

    monthlyTickets.forEach((ticket) => {
      const date = new Date(ticket.createdAt);
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (last6Months[label]) {
        last6Months[label].count += 1;
        last6Months[label].totalCost += ticket.costEstimateMax || 0;
      }
    });

    const monthlyData = Object.keys(last6Months)
      .reverse()
      .map((key) => ({
        month: key,
        count: last6Months[key].count,
        totalCost: last6Months[key].totalCost,
      }));

    // 5. Total counts and calculations
    const totalTickets = await prisma.ticket.count();
    const resolvedTickets = await prisma.ticket.count({ where: { status: "RESOLVED" } });
    const pendingTickets = await prisma.ticket.count({ where: { status: "PENDING" } });
    const inProgressTickets = await prisma.ticket.count({ where: { status: "IN_PROGRESS" } });

    const totalBudget = await prisma.ticket.aggregate({
      _sum: {
        costEstimateMax: true,
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        total: totalTickets,
        resolved: resolvedTickets,
        pending: pendingTickets,
        inProgress: inProgressTickets,
        totalCostEst: totalBudget._sum.costEstimateMax || 0,
      },
      statusDistribution: statusCounts.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      priorityDistribution: priorityCounts.map((item) => ({
        priority: item.priority,
        count: item._count.id,
      })),
      categoryDistribution: categoryCounts.map((item) => ({
        category: item.category || "อื่นๆ",
        count: item._count.id,
      })),
      monthlyTrends: monthlyData,
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Failed to load analytics data" }, { status: 500 });
  }
}
