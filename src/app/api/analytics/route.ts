import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyticsService } from "@/services/analyticsService";
import { createApiResponse, createApiErrorResponse } from "@/types/api/response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    if (!session || (userRole !== "ADMIN" && userRole !== "TECHNICIAN")) {
      return NextResponse.json(createApiErrorResponse("Unauthorized"), { status: 401 });
    }

    const stats = await analyticsService.getDashboardStats();
    return NextResponse.json(createApiResponse(stats, "Analytics data fetched successfully"));
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(createApiErrorResponse("Failed to load analytics data", error), { status: 500 });
  }
}
