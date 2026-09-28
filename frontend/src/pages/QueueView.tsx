import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TokenCard } from '../components/TokenCard';
import { AIWaitCard } from '../components/AIWaitCard';
import { ProcurementTimeline } from '../components/ProcurementTimeline';
import { DemoToolbar } from '../components/DemoToolbar';
import { QrCode, Users, Clock, Building2, ChevronRight, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { QueueStatus } from '../types';

export const QueueView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const tokenNum = token || 'KPC-041';

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 8000);
    return () => clearInterval(interval);
  }, [tokenNum]);

  const fetchQueue = async () => {
    try {
      const res = await api.get(`/queue/${tokenNum}`);
      if (res.data.success) {
        setQueueStatus(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              Live Queue Tracking
            </span>
            <span className="text-xs text-slate-500 font-medium">Auto-refreshing every 8s</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-forest-700" /> Digital Token & Live Queue Status
          </h1>
        </div>

        <button
          onClick={fetchQueue}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-forest-700" /> Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading live queue status...</div>
      ) : queueStatus ? (
        <div className="space-y-8">
          {/* Token Card Header */}
          <TokenCard booking={queueStatus.booking} />

          {/* Core 4 Live Queue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-forest-900 text-white p-5 rounded-2xl shadow-lg border border-forest-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Your Token</p>
              <h3 className="text-3xl font-black text-amber-400 mt-1 font-mono">{queueStatus.booking.tokenNumber}</h3>
              <p className="text-xs text-emerald-200 mt-1 font-medium">Position #{queueStatus.queuePosition}</p>
            </div>

            <div className="bg-amber-500 text-slate-950 p-5 rounded-2xl shadow-lg border border-amber-600">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">Now Serving</p>
              <h3 className="text-3xl font-black text-slate-950 mt-1 font-mono">{queueStatus.nowServingToken}</h3>
              <p className="text-xs text-slate-900 mt-1 font-bold">Counter Active</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
              <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Farmers Ahead</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{queueStatus.farmersAhead}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">In waiting line</p>
            </div>

            <div className="bg-purple-900 text-white p-5 rounded-2xl shadow-lg border border-purple-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200">AI Est. Waiting Time</p>
              <h3 className="text-3xl font-black text-amber-300 mt-1">{queueStatus.estimatedWaitMinutes} min</h3>
              <p className="text-xs text-purple-200 mt-1 font-medium">Range: {queueStatus.minMinutes}-{queueStatus.maxMinutes} min</p>
            </div>
          </div>

          {/* Visual Queue Timeline Sequence */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center justify-between">
              <span>Visual Live Queue Sequence (Mandya Center)</span>
              <span className="text-xs font-semibold text-slate-500">Counters: {queueStatus.activeCounters} Active</span>
            </h3>

            <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2">
              {/* Serving */}
              <div className="bg-amber-500 text-slate-950 p-3 rounded-2xl font-black text-sm shrink-0 border-2 border-amber-600 shadow-md animate-pulse">
                <span className="block text-[9px] uppercase font-bold text-slate-900">Serving</span>
                {queueStatus.nowServingToken}
              </div>

              <span className="text-slate-400 font-bold">→</span>

              {/* Waiting Farmers in front */}
              {[...Array(Math.min(5, queueStatus.farmersAhead))].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl font-bold text-xs shrink-0 border border-slate-200">
                    <span className="block text-[9px] text-slate-400 font-normal">Wait #{i + 1}</span>
                    KPC-03{5 + i}
                  </div>
                  <span className="text-slate-300 font-bold">→</span>
                </React.Fragment>
              ))}

              {/* Your Token */}
              <div className="bg-forest-900 text-amber-400 p-3 rounded-2xl font-black text-sm shrink-0 border-2 border-emerald-500 shadow-lg ring-4 ring-emerald-100">
                <span className="block text-[9px] uppercase font-bold text-emerald-300">YOUR TOKEN</span>
                {queueStatus.booking.tokenNumber}
              </div>
            </div>
          </div>

          {/* AI Prediction Breakdown Widget */}
          <AIWaitCard
            estimatedWaitMinutes={queueStatus.estimatedWaitMinutes}
            minMinutes={queueStatus.minMinutes}
            maxMinutes={queueStatus.maxMinutes}
            confidence={queueStatus.confidence}
            factors={queueStatus.factors}
            activeCounters={queueStatus.activeCounters}
          />

          {/* Procurement Progress Timeline */}
          <ProcurementTimeline procurement={queueStatus.booking.procurement} />
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white rounded-3xl">Token not found</div>
      )}

      <DemoToolbar onRefresh={fetchQueue} />
    </div>
  );
};
