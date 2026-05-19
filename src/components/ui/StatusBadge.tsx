import React from 'react';
import { TicketStatus } from '@/types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'รอรับงาน', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/20' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/20' },
  RESOLVED: { label: 'เสร็จสิ้น', color: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/20' },
  CANCELLED: { label: 'ยกเลิกแล้ว', color: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/20' },
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
