import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
  borderAccent?: 'emerald' | 'amber' | 'rose' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  hoverable = false,
  borderAccent = 'none',
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm';
  
  const glassStyle = 'glass';
  const hoverStyle = 'hover:shadow-md hover:scale-[1.005] transition-all duration-200 ease-out';
  
  const borderAccents = {
    none: '',
    emerald: 'border-l-4 border-l-emerald-500',
    amber: 'border-l-4 border-l-amber-500',
    rose: 'border-l-4 border-l-rose-500',
  };

  const combinedStyles = [
    glass ? glassStyle : baseStyle,
    hoverable ? hoverStyle : '',
    borderAccents[borderAccent],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedStyles} {...props}>
      {children}
    </div>
  );
};

interface StatWidgetProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  color?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate';
  subtext?: string;
  onClick?: () => void;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'emerald',
  subtext,
  onClick,
}) => {
  const colors = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/30'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/30'
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800/50',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700/30'
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer ${onClick ? 'active:scale-95' : ''}`} 
      hoverable={true}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            {value}
          </h3>
        </div>
        
        <div className={`p-3 rounded-xl border ${colors[color].bg} ${colors[color].text} ${colors[color].border} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      
      {(trend || subtext) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
              trend.isPositive 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
            }`}>
              {trend.isPositive ? '+' : '-'}{trend.value}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {subtext}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
