import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ticketService } from "@/services/ticketService";
import { createApiResponse, createApiErrorResponse } from "@/types/api/response";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    if (!session || (userRole !== "ADMIN" && userRole !== "TECHNICIAN")) {
      return NextResponse.json(createApiErrorResponse("Unauthorized"), { status: 401 });
    }

    const { status, usedParts } = await req.json();
    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(createApiErrorResponse("Invalid status"), { status: 400 });
    }

    const technicianId = (session.user as any).id;
    const ticket = await ticketService.updateTicketStatus(params.id, technicianId, status, usedParts);

    return NextResponse.json(createApiResponse(ticket, "Ticket status updated successfully"));
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(createApiErrorResponse(error.message || "Internal Server Error", error), { status: 500 });
  }
}
