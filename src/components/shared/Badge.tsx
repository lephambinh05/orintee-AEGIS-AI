'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils'; // I'll create this helper later

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'neutral' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    success: 'bg-[#dcfce7] color-[#166534]',
    danger:  'bg-[#fee2e2] color-[#991b1b]',
    warning: 'bg-[#fef3c7] color-[#92400e]',
    neutral: 'bg-[#f5f5f5] color-[#71717a]',
    blue:    'bg-[#dbeafe] color-[#1e40af]',
  };

  return (
    <span className={cn(
      'px-2 py-0.5 rounded-[4px] font-semibold text-[12px] inline-flex items-center',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
