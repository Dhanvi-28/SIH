import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapacityBar } from '../components/CapacityBar';
import { Building2, MapPin, Wheat, Users, Clock, ArrowRight, Filter, Search } from 'lucide-react';
import api from '../services/api';
import { ProcurementCenter } from '../types';

export const CenterDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'capacity' | 'queue' | 'name'>('capacity');

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const res = await api.get('/centers');
      if (res.data.success) {
        setCenters(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.district.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'capacity') return (a.capacityUtilizationPercent || 0) - (b.capacityUtilizationPercent || 0);
      if (sortBy === 'queue') return (a.currentQueue || 0) - (b.currentQueue || 0);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-forest-700" /> Procurement Center Discovery
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Find center schedules, check live capacity availability, and book your procurement slot.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search district or center..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-forest-600 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 border border-slate-200 rounded-xl shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => setSortBy('capacity')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${sortBy === 'capacity' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Capacity
            </button>
            <button
              onClick={() => setSortBy('queue')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${sortBy === 'queue' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Queue
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading centers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 flex flex-col justify-between hover:shadow-2xl hover:border-forest-500 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                      {center.code}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1 group-hover:text-forest-800 transition">
                      {center.name}
                    </h3>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Operating Normal" />
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {center.address}, {center.district}
                </p>

                {/* Accepted Produces */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(center.centerProduces || []).map((cp) => (
                    <span key={cp.id} className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Wheat className="w-3 h-3 text-amber-600" /> {cp.produce.name}
                    </span>
                  ))}
                </div>

                {/* Capacity Meter Bar */}
                <div className="mt-5">
                  <CapacityBar
                    booked={center.todayBookedQuantity || 420}
                    total={center.dailyCapacity || 1000}
                    unit="Tons"
                  />
                </div>

                {/* Live Metrics Grid */}
                <div className="mt-5 grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Queue</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-600" /> {center.currentQueue || 18}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Counters</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {center.activeCounters || 4}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Speed</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> 7.5m
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/book?centerId=${center.id}`)}
                  className="w-full py-3 bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 group-hover:bg-emerald-600"
                >
                  Book Slot Here <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
