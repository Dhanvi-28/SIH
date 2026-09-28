import React, { useState } from 'react';
import { Play, FastForward, Sliders, RefreshCw, UserCheck, Shield, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DemoToolbar: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const { user, quickLogin } = useAuth();
  const [counters, setCounters] = useState(4);
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleAdvanceQueue = async () => {
    try {
      setLoadingMsg('Advancing queue...');
      const res = await api.post('/demo/advance-queue', {});
      if (res.data.success) {
        setLoadingMsg(res.data.message);
        if (onRefresh) onRefresh();
        setTimeout(() => setLoadingMsg(''), 3000);
      }
    } catch (e) {
      setLoadingMsg('Error advancing queue');
    }
  };

  const handleToggleCounters = async (num: number) => {
    try {
      setCounters(num);
      setLoadingMsg(`Setting counters to ${num}...`);
      const res = await api.post('/demo/toggle-counters', { activeCounters: num });
      if (res.data.success) {
        setLoadingMsg(res.data.message);
        if (onRefresh) onRefresh();
        setTimeout(() => setLoadingMsg(''), 3000);
      }
    } catch (e) {
      setLoadingMsg('Error updating counters');
    }
  };

  const handleResetDemo = async () => {
    try {
      setLoadingMsg('Resetting KPC-041 demo token...');
      const res = await api.post('/demo/reset-ramesh-token', {});
      if (res.data.success) {
        setLoadingMsg(res.data.message);
        await quickLogin('FARMER');
        if (onRefresh) onRefresh();
        setTimeout(() => setLoadingMsg(''), 3000);
      }
    } catch (e) {
      setLoadingMsg('Error resetting demo');
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex flex-wrap items-center gap-3 max-w-full text-xs">
      <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        <span className="font-extrabold text-amber-300">Interactive Demo Controls:</span>
      </div>

      {/* Role Switcher */}
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
        <button
          onClick={() => quickLogin('FARMER')}
          className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${user?.role === 'FARMER' ? 'bg-forest-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <UserCheck className="w-3 h-3" /> Farmer
        </button>
        <button
          onClick={() => quickLogin('OFFICIAL')}
          className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${user?.role === 'OFFICIAL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Sliders className="w-3 h-3" /> Official
        </button>
        <button
          onClick={() => quickLogin('ADMIN')}
          className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${user?.role === 'ADMIN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Shield className="w-3 h-3" /> Admin
        </button>
      </div>

      {/* Simulation Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdvanceQueue}
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white font-bold rounded-xl shadow flex items-center gap-1.5 transition active:scale-95"
        >
          <FastForward className="w-3.5 h-3.5" /> Call Next Token
        </button>

        <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
          <span className="text-[10px] text-slate-400 font-semibold">Counters:</span>
          {[2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleToggleCounters(num)}
              className={`w-5 h-5 rounded-md text-[10px] font-bold transition ${counters === num ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={handleResetDemo}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Reset Demo (KPC-041)
        </button>
      </div>

      {loadingMsg && (
        <span className="text-[11px] text-emerald-400 font-medium animate-pulse pl-2 border-l border-slate-700">
          {loadingMsg}
        </span>
      )}
    </div>
  );
};
