import prisma from "@/lib/prisma";
import Pusher from "pusher";
import { sendLineNotification } from "@/lib/line";
import { Ticket } from "@/types/ticket";
import { TicketStatus } from "@prisma/client";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

export const ticketService = {
  async getTicketById(id: string) {
    return await prisma.ticket.findUnique({
      where: { id },
      include: { technician: true },
    });
  },

  async deleteTicket(id: string) {
    return await prisma.ticket.delete({
      where: { id },
    });
  },

  async updateTicketStatus(id: string, technicianId: string, status: TicketStatus, usedParts?: any[]) {
    const hasParts = status === "RESOLVED" && Array.isArray(usedParts) && usedParts.length > 0;

    let ticket;
    if (hasParts) {
      ticket = await prisma.$transaction(async (tx) => {
        const updated = await tx.ticket.update({
          where: { id },
          data: {
            status,
          },
          include: { technician: true },
        });

        for (const part of usedParts!) {
          if (!part.id || !part.quantity) continue;
          await tx.inventoryItem.update({
            where: { id: part.id },
            data: { quantity: { decrement: parseInt(part.quantity) } },
          });
        }
        return updated;
      }, {
        maxWait: 20000,
        timeout: 30000,
      });
    } else {
      ticket = await prisma.ticket.update({
        where: { id },
        data: {
          status,
          technicianId: status === "IN_PROGRESS" ? technicianId : undefined,
        },
        include: { technician: true },
      });
    }

    await this.notifyTicketUpdate(ticket, status);
    return ticket;
  },

  async notifyTicketUpdate(ticket: any, status: string) {
    // LINE Notification
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
      console.error("LINE Notify send error:", lineErr);
    }

    // Pusher Real-time
    if (process.env.PUSHER_APP_ID) {
      try {
        const pusherTicket = { ...ticket };
        if (pusherTicket.imageUrl && pusherTicket.imageUrl.startsWith("data:") && pusherTicket.imageUrl.length > 500) {
          pusherTicket.imageUrl = "base64_image_too_large_for_pusher";
        }
        await pusher.trigger(`user-channel-${ticket.userId}`, "ticket-updated", pusherTicket);
        await pusher.trigger("admin-channel", "ticket-updated", pusherTicket);
      } catch (pusherErr) {
        console.error("Pusher trigger error:", pusherErr);
      }
    }
  }
};
