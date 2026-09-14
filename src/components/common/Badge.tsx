import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-full',
    md: 'text-sm px-3 py-1 font-medium rounded-md',
  };

  return (
    <span className={`inline-flex items-center gap-1 border whitespace-nowrap shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export const AttendanceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'present':
      return <Badge variant="success">● Present</Badge>;
    case 'absent':
      return <Badge variant="danger">✕ Absent</Badge>;
    case 'half_day':
      return <Badge variant="warning">◐ Half Day</Badge>;
    case 'paid_leave':
      return <Badge variant="info">★ Paid Leave</Badge>;
    case 'unpaid_leave':
      return <Badge variant="danger">▲ Unpaid Leave</Badge>;
    case 'holiday':
      return <Badge variant="purple">🎉 Holiday</Badge>;
    case 'weekly_off':
      return <Badge variant="neutral">☕ Weekly Off</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const ApprovalStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'approved':
    case 'active':
    case 'settled':
      return <Badge variant="success">✓ {status.toUpperCase()}</Badge>;
    case 'pending':
    case 'pending_approval':
      return <Badge variant="warning">⏳ PENDING</Badge>;
    case 'rejected':
      return <Badge variant="danger">✕ REJECTED</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
