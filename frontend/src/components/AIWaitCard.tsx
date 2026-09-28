import React, { useState } from 'react';
import { Brain, Clock, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

interface AIWaitCardProps {
  estimatedWaitMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  confidence: number;
  factors: Array<{ name: string; impact: 'high' | 'medium' | 'low' }>;
  activeCounters?: number;
}

export const AIWaitCard: React.FC<AIWaitCardProps> = ({
  estimatedWaitMinutes,
  minMinutes,
  maxMinutes,
  confidence,
  factors,
  activeCounters = 4,
}) => {
  const [expanded, setExpanded] = useState(true);

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/90 relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              AI Waiting-Time Engine
              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" /> Scikit-Learn ML
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time queue regression model</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
        >
          {expanded ? 'Hide Breakdown' : 'View Factors'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {/* Main Wait Estimate */}
        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
          <p className="text-[11px] font-bold uppercase text-purple-800 tracking-wider">Estimated Wait</p>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-black text-purple-900">{estimatedWaitMinutes}</span>
            <span className="text-xs font-bold text-purple-700">mins</span>
          </div>
        </div>

        {/* Likely Range */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Likely Range</p>
          <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {minMinutes} – {maxMinutes} <span className="text-xs font-medium text-slate-500">mins</span>
          </p>
        </div>

        {/* Model Confidence */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
          <p className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">AI Confidence</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">
            {Math.round(confidence * 100)}%
          </p>
        </div>
      </div>

      {/* Expandable Factor Breakdown */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>Primary Influencing Factors:</span>
            <span className="text-[11px] font-semibold text-slate-500">Counters Active: {activeCounters}</span>
          </h4>
          <div className="space-y-2">
            {factors.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">{f.name}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase border ${getImpactBadge(f.impact)}`}>
                  {f.impact} Impact
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 bg-slate-100/80 p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-slate-600">
            <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              AI-assisted estimate based on live queue length, active counter throughput, produce volume in tons, and historical processing speed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
