import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { CapacityBar } from '../components/CapacityBar';
import { InspectionModal } from './InspectionModal';
import { DemoToolbar } from '../components/DemoToolbar';
import { Building2, Users, Scale, CheckCircle2, AlertTriangle, QrCode, Phone, FastForward, Play, RefreshCw, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { Procurement, Booking } from '../types';

export const OfficialDashboard: React.FC = () => {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [verifyToken, setVerifyToken] = useState('KPC-041');
  const [activeModalProc, setActiveModalProc] = useState<Procurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchOfficialData();
    const interval = setInterval(fetchOfficialData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchOfficialData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        api.get('/procurements'),
        api.get('/bookings'),
      ]);

      if (pRes.data.success) setProcurements(pRes.data.data);
      if (bRes.data.success) setBookings(bRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyArrival = async (tokenNum: string) => {
    try {
      setMsg(`Verifying token ${tokenNum}...`);
      const res = await api.post(`/queue/${tokenNum}/arrive`);
      if (res.data.success) {
        setMsg(`Arrival verified for token ${tokenNum}! Marked ARRIVED.`);
        fetchOfficialData();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {
      setMsg('Error verifying token');
    }
  };

  const handleCallFarmer = async (tokenNum: string) => {
    try {
      setMsg(`Calling farmer token ${tokenNum} to Counter 2...`);
      const res = await api.post(`/queue/${tokenNum}/call`, { counterNumber: 2 });
      if (res.data.success) {
        setMsg(`Called token ${tokenNum}! Notification sent.`);
        fetchOfficialData();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {
      setMsg('Error calling farmer');
    }
  };

  const completedCount = procurements.filter(p => p.status === 'PAID').length;
  const pendingCount = procurements.filter(p => p.status !== 'PAID' && p.status !== 'REJECTED').length;
  const activeQueueCount = bookings.filter(b => ['ARRIVED', 'WAITING', 'CALLED', 'PROCESSING'].includes(b.status)).length;
  const totalVolume = bookings.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Official Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
              Mandya Center Command Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">Official ID: OFF-9082</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-forest-700" /> Operational Command Center
          </h1>
        </div>

        <button
          onClick={fetchOfficialData}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-forest-700" /> Refresh Command Metrics
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl animate-bounce">
          {msg}
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Expected Farmers" value="128" subtitle="Registered appointments" icon={Users} color="blue" />
        <StatCard title="Expected Produce Volume" value={`${totalVolume} Tons`} subtitle="Daily capacity: 1000 Tons" icon={Scale} color="amber" />
        <StatCard title="Completed Procurements" value={completedCount || 81} subtitle="Payout completed" icon={CheckCircle2} color="green" />
        <StatCard title="Current Live Queue" value={activeQueueCount || 18} subtitle="Waiting at gate & counters" icon={QrCode} color="purple" />
      </div>

      {/* Capacity & Bottleneck Detector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Mandya Center Capacity Monitor</h3>
          <CapacityBar booked={820} total={1000} unit="Tons" />

          {/* Active Counters Operational Status */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-700 mb-2">Counter Operational Status:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Counter 1</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">Serving KPC-034</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Counter 2</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">Serving KPC-035</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Counter 3</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">Serving KPC-036</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Counter 4</span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">Serving KPC-041</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottleneck Risk Detector */}
        <div className="bg-gradient-to-br from-slate-900 to-forest-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" /> Bottleneck Risk Engine
            </div>
            <h3 className="text-xl font-extrabold text-white mt-2">MODERATE LOAD</h3>
            <p className="text-xs text-slate-300 mt-1">
              Throughput is optimal. 4 counters operational. Expected arrival surge at 11:30 AM is within threshold.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-emerald-300">
            ✓ Recommended: Maintain 4 counters to sustain average 7.5 min turnaround.
          </div>
        </div>
      </div>

      {/* Quick Token Scanner / Verification Box */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
        <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-forest-700" /> Token Verification & Gate Arrival Verification
        </h3>
        <div className="flex gap-3 max-w-md">
          <input
            type="text"
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
            placeholder="Enter token e.g. KPC-041"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:border-forest-600"
          />
          <button
            onClick={() => handleVerifyArrival(verifyToken)}
            className="px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs rounded-xl shadow transition"
          >
            Verify & Mark Arrival
          </button>
        </div>
      </div>

      {/* Live Queue Management Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Procurement Queue & Workflow Table</h3>
          <span className="text-xs font-bold text-slate-500">Total Bookings: {bookings.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Token</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Produce</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-extrabold font-mono text-amber-700">{b.tokenNumber}</td>
                  <td className="p-4 font-bold">{b.farmer.user.name}</td>
                  <td className="p-4">{b.produce.name}</td>
                  <td className="p-4 font-bold">{b.quantity} Tons</td>
                  <td className="p-4">{b.slot.startTime}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      b.status === 'ARRIVED' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'CALLED' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                      b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {b.status === 'BOOKED' && (
                      <button
                        onClick={() => handleVerifyArrival(b.tokenNumber)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow"
                      >
                        Verify Arrival
                      </button>
                    )}
                    {b.status === 'ARRIVED' && (
                      <button
                        onClick={() => handleCallFarmer(b.tokenNumber)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow"
                      >
                        Call to Counter
                      </button>
                    )}
                    {b.procurement && (
                      <button
                        onClick={() => setActiveModalProc(b.procurement!)}
                        className="px-3 py-1 bg-forest-900 hover:bg-forest-800 text-white font-bold text-[11px] rounded-lg shadow"
                      >
                        Inspection & Payout
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Inspection, Weighing & Payment */}
      {activeModalProc && (
        <InspectionModal
          procurement={activeModalProc}
          onClose={() => setActiveModalProc(null)}
          onSuccess={fetchOfficialData}
        />
      )}

      <DemoToolbar onRefresh={fetchOfficialData} />
    </div>
  );
};
