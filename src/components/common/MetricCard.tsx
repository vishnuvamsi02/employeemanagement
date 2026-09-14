import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon,
  color = 'indigo',
  onClick
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      iconText: 'text-indigo-600',
      borderHover: 'hover:border-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconText: 'text-emerald-600',
      borderHover: 'hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50',
      iconText: 'text-amber-600',
      borderHover: 'hover:border-amber-300'
    },
    rose: {
      bg: 'bg-rose-50',
      iconText: 'text-rose-600',
      borderHover: 'hover:border-rose-300'
    },
    sky: {
      bg: 'bg-sky-50',
      iconText: 'text-sky-600',
      borderHover: 'hover:border-sky-300'
    },
    purple: {
      bg: 'bg-purple-50',
      iconText: 'text-purple-600',
      borderHover: 'hover:border-purple-300'
    }
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs transition-all duration-200 min-w-0 overflow-hidden w-full max-w-full ${
        onClick ? `cursor-pointer hover:shadow-md ${scheme.borderHover} hover:-translate-y-0.5` : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</span>
        <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${scheme.bg} ${scheme.iconText}`}>
          {icon}
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2 min-w-0">
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">{value}</span>
        {change && (
          <span
            className={`text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-md shrink-0 ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium truncate">{subtitle}</p>}
    </div>
  );
};
