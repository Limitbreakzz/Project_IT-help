export interface Ticket {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: string;
  createdAt: Date | string;
  technician?: { name: string | null } | null;
}

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string;
