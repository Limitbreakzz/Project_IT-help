import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Pusher from "pusher";
import { sendLineNotification } from "@/lib/line";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, usedParts } = await req.json();
    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const technicianId = (session.user as any).id;

    // Use transaction to ensure consistency
    const ticket = await prisma.$transaction(async (tx) => {
      // 1. Update status
      const updated = await tx.ticket.update({
        where: { id: params.id },
        data: {
          status,
          technicianId: status === "IN_PROGRESS" ? technicianId : undefined,
        },
        include: {
          technician: true,
        }
      });

      // 2. Deduct inventory if resolved and parts are selected
      if (status === "RESOLVED" && Array.isArray(usedParts)) {
        for (const part of usedParts) {
          if (!part.id || !part.quantity) continue;
          await tx.inventoryItem.update({
            where: { id: part.id },
            data: {
              quantity: {
                decrement: parseInt(part.quantity)
              }
            }
          });
        }
      }

      return updated;
    });

    // Send LINE status update notification
    try {
      let statusText = "";
      if (status === "IN_PROGRESS") {
        statusText = `🔧 ช่าง ${ticket.technician?.name || "ช่างซ่อม"} ได้กดรับงาน "${ticket.title}" และกำลังดำเนินการซ่อมแซมครับ`;
      } else if (status === "RESOLVED") {
        statusText = `✅ งานซ่อม "${ticket.title}" ดำเนินการเสร็จสิ้นเรียบร้อยแล้วครับ!`;
      } else if (status === "CANCELLED") {
        statusText = `❌ งานซ่อม "${ticket.title}" ถูกยกเลิก`;
      }
      
      if (statusText) {
        await sendLineNotification(`\n📢 อัปเดตสถานะงานซ่อม\n${statusText}`);
      }
    } catch (lineErr) {
      console.error("LINE Notify send error on status change:", lineErr);
    }

    // Notify user realtime
    if (process.env.PUSHER_APP_ID) {
      try {
        await pusher.trigger(`user-channel-${ticket.userId}`, "ticket-updated", ticket);
        // Also notify admin channel
        await pusher.trigger("admin-channel", "ticket-updated", ticket);
      } catch (pusherErr) {
        console.error("Pusher trigger error on status update:", pusherErr);
      }
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
