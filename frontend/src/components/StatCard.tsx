import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'green' | 'amber' | 'blue' | 'purple' | 'red';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'green',
  trend,
}) => {
  const colorMap = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  const iconBgMap = {
    green: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
    blue: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white',
    red: 'bg-red-500 text-white',
  };

  return (
    <div className={`p-5 rounded-2xl border shadow-sm ${colorMap[color]} transition hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</p>
          <h3 className="text-2xl font-extrabold mt-1 text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs mt-1 font-medium opacity-90">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${iconBgMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2 border-t border-black/5 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
