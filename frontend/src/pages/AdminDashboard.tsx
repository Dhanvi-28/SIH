import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { CapacityBar } from '../components/CapacityBar';
import { DemoToolbar } from '../components/DemoToolbar';
import { Shield, Building2, Users, Wheat, BarChart3, Plus, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { ProcurementCenter, Produce } from '../types';

export const AdminDashboard: React.FC = () => {
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [produces, setProduces] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/centers'),
        api.get('/produce'),
      ]);

      if (cRes.data.success) setCenters(cRes.data.data);
      if (pRes.data.success) setProduces(pRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded border border-blue-300">
              State Governance Admin Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">Administrator: Dr. Anita Rao</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-700" /> Admin Management & Center Configuration
          </h1>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-700" /> Refresh State Metrics
        </button>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Centers" value={centers.length || 5} subtitle="State network rollout" icon={Building2} color="blue" />
        <StatCard title="Registered Farmers" value="1,420" subtitle="Across 5 districts" icon={Users} color="green" />
        <StatCard title="Active Crop Types" value={produces.length || 6} subtitle="MSP Configured" icon={Wheat} color="amber" />
        <StatCard title="Daily Capacity Allocation" value="5,400 Tons" subtitle="Combined network capacity" icon={BarChart3} color="purple" />
      </div>

      {/* Center Management Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Procurement Centers Network</h3>
          <span className="text-xs font-bold text-slate-500">5 Centers Deployed</span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {centers.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.district}, {c.state}</p>
                </div>
                <span className="text-xs font-bold text-slate-700">{c.activeCounters} Counters</span>
              </div>

              <CapacityBar booked={c.todayBookedQuantity || 420} total={c.dailyCapacity || 1000} />
            </div>
          ))}
        </div>
      </div>

      <DemoToolbar onRefresh={fetchAdminData} />
    </div>
  );
};
