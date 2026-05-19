"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Ticket } from "@/types/ticket";

export function useTicketRealtime(userId: string, initialTickets: Ticket[]) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "YOUR_PUSHER_KEY_HERE", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
    });

    const channel = pusher.subscribe(`user-channel-${userId}`);
    
    channel.bind("ticket-updated", (data: Ticket) => {
      setTickets((prev) => prev.map(t => {
        if (t.id === data.id) {
          const imageUrl = (data.imageUrl === "base64_image_too_large_for_pusher" || !data.imageUrl)
            ? t.imageUrl
            : data.imageUrl;
          return { ...data, imageUrl };
        }
        return t;
      }));
    });

    return () => {
      pusher.unsubscribe(`user-channel-${userId}`);
    };
  }, [userId]);

  return { tickets, setTickets };
}
