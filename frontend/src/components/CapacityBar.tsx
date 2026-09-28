import React from 'react';

interface CapacityBarProps {
  booked: number;
  total: number;
  unit?: string;
}

export const CapacityBar: React.FC<CapacityBarProps> = ({ booked, total, unit = 'Tons' }) => {
  const percent = Math.min(100, Math.round((booked / total) * 100));

  let statusText = 'Normal Capacity';
  let statusBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let barColor = 'bg-emerald-500';

  if (percent >= 100) {
    statusText = 'FULL';
    statusBg = 'bg-red-100 text-red-800 border-red-300';
    barColor = 'bg-red-500';
  } else if (percent >= 90) {
    statusText = 'Almost Full';
    statusBg = 'bg-red-50 text-red-700 border-red-200';
    barColor = 'bg-red-500';
  } else if (percent >= 80) {
    statusText = 'Filling Fast';
    statusBg = 'bg-amber-100 text-amber-800 border-amber-300';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
        <span className="text-slate-700">
          Capacity: <span className="text-slate-900">{booked} / {total} {unit}</span> ({percent}%)
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusBg}`}>
          {statusText}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
