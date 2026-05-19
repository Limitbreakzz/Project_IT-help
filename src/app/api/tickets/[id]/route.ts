import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ticketService } from "@/services/ticketService";
import { createApiResponse, createApiErrorResponse } from "@/types/api/response";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(createApiErrorResponse("Unauthorized"), { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const ticket = await ticketService.getTicketById(params.id);

    if (!ticket) {
      return NextResponse.json(createApiErrorResponse("Ticket not found"), { status: 404 });
    }

    if (userRole !== "ADMIN" && userRole !== "TECHNICIAN" && ticket.userId !== userId) {
      return NextResponse.json(createApiErrorResponse("Unauthorized to delete this ticket"), { status: 403 });
    }

    if (ticket.status !== "RESOLVED" && ticket.status !== "CANCELLED") {
      return NextResponse.json(createApiErrorResponse("Only resolved or cancelled tickets can be deleted"), { status: 400 });
    }

    await ticketService.deleteTicket(params.id);
    return NextResponse.json(createApiResponse(null, "Ticket deleted successfully"));
  } catch (error: any) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(createApiErrorResponse(error.message || "Internal Server Error", error), { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(createApiErrorResponse("Unauthorized"), { status: 401 });
    }

    const userId = (session.user as any).id;
    const { action } = await req.json();

    if (action !== "CANCEL") {
      return NextResponse.json(createApiErrorResponse("Invalid action"), { status: 400 });
    }

    const ticket = await ticketService.getTicketById(params.id);

    if (!ticket) {
      return NextResponse.json(createApiErrorResponse("Ticket not found"), { status: 404 });
    }

    if (ticket.userId !== userId) {
      return NextResponse.json(createApiErrorResponse("Unauthorized to modify this ticket"), { status: 403 });
    }

    if (ticket.status !== "PENDING" && ticket.status !== "IN_PROGRESS") {
      return NextResponse.json(createApiErrorResponse("Only pending or in-progress tickets can be cancelled"), { status: 400 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
      include: { technician: true }
    });

    await ticketService.notifyTicketUpdate(updatedTicket, "CANCELLED");

    return NextResponse.json(createApiResponse(updatedTicket, "Ticket cancelled successfully"));
  } catch (error: any) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json(createApiErrorResponse(error.message || "Internal Server Error", error), { status: 500 });
  }
}
