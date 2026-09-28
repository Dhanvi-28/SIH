import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { TokenCard } from '../components/TokenCard';
import { AIWaitCard } from '../components/AIWaitCard';
import { ProcurementTimeline } from '../components/ProcurementTimeline';
import { DemoToolbar } from '../components/DemoToolbar';
import { QrCode, Clock, Users, Calendar, PlusCircle, CheckCircle2, ChevronRight, Bell, Sparkles, Building2 } from 'lucide-react';
import api from '../services/api';
import { Booking, QueueStatus } from '../types';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmerData();
    const interval = setInterval(fetchFarmerData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchFarmerData = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data.success && res.data.data.length > 0) {
        const primary = res.data.data[0];
        setActiveBooking(primary);

        // Fetch Live Queue details for token
        const qRes = await api.get(`/queue/${primary.tokenNumber}`);
        if (qRes.data.success) {
          setQueueStatus(qRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Welcome Banner */}
      <div className="bg-forest-900 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-forest-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-500/30">
                Farmer Portal
              </span>
              <span className="text-xs text-slate-300">ID: {user?.farmer?.farmerCode || 'FARM-78901'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">
              Namaste, {user?.name || 'Ramesh Kumar'} 🙏
            </h1>
            <p className="text-xs text-emerald-300 mt-1 font-medium">
              Village: {user?.farmer?.village || 'Mandya Rural'}, {user?.farmer?.district || 'Mandya'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/centers"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-forest-600 hover:from-emerald-400 hover:to-forest-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Book New Slot
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-3xl shadow-xl">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading procurement data...
          </div>
        ) : activeBooking ? (
          <div className="space-y-8">
            {/* Today's Active Token Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-forest-700" /> Active Procurement Appointment
                </h2>
                <Link to={`/queue/${activeBooking.tokenNumber}`} className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1">
                  Full Queue View <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <TokenCard booking={activeBooking} />
            </div>

            {/* Queue Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Your Queue Position"
                value={`#${queueStatus?.queuePosition || 7}`}
                subtitle="Live status in center"
                icon={QrCode}
                color="green"
              />
              <StatCard
                title="Farmers Ahead"
                value={queueStatus?.farmersAhead ?? 6}
                subtitle="Waiting before you"
                icon={Users}
                color="amber"
              />
              <StatCard
                title="AI Estimated Wait"
                value={`${queueStatus?.estimatedWaitMinutes || 42} min`}
                subtitle={`Range: ${queueStatus?.minMinutes || 35}-${queueStatus?.maxMinutes || 50} min`}
                icon={Clock}
                color="purple"
              />
              <StatCard
                title="Active Counters"
                value={`${queueStatus?.activeCounters || 4} / 4`}
                subtitle="Counters operational"
                icon={Building2}
                color="blue"
              />
            </div>

            {/* AI Prediction & Factor Breakdown Card */}
            <AIWaitCard
              estimatedWaitMinutes={queueStatus?.estimatedWaitMinutes || 42}
              minMinutes={queueStatus?.minMinutes || 35}
              maxMinutes={queueStatus?.maxMinutes || 50}
              confidence={queueStatus?.confidence || 0.84}
              factors={queueStatus?.factors || [
                { name: 'Farmers Ahead (6)', impact: 'high' },
                { name: 'Active Counters (4)', impact: 'medium' },
                { name: 'Processing Speed (7.5 min)', impact: 'medium' },
                { name: 'Queue Load (High)', impact: 'high' },
              ]}
              activeCounters={queueStatus?.activeCounters || 4}
            />

            {/* Procurement Status Vertical Timeline */}
            <ProcurementTimeline procurement={activeBooking.procurement} />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">No Active Bookings Found</h3>
            <p className="text-xs text-slate-500 mt-1">Book a procurement slot at your nearest center to get started.</p>
            <Link
              to="/centers"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-forest-900 text-white font-bold text-xs rounded-2xl shadow hover:bg-forest-800 transition"
            >
              <PlusCircle className="w-4 h-4" /> Browse Centers & Book Slot
            </Link>
          </div>
        )}
      </div>

      {/* Floating Demo Controls */}
      <DemoToolbar onRefresh={fetchFarmerData} />
    </div>
  );
};
