import React from 'react';
import { TicketStatus } from '@/types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'รอรับงาน', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  RESOLVED: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800 border-green-200' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { label, color } = STATUS_CONFIG[status] || { 
    label: status, 
    color: 'bg-gray-100 text-gray-800 border-gray-200' 
  };

  return (
    <span className={`px-3 py-1 ${color} rounded-full text-xs font-bold border`}>
      {label}
    </span>
  );
};
