export interface Ticket {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: string;
  priority: string;
  category: string | null;
  aiAnalysis: any;
  costEstimateMin: number | null;
  costEstimateMax: number | null;
  timeEstimate: string | null;
  createdAt: Date | string;
  technician?: { name: string | null } | null;
}

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string;
