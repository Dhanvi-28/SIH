import React, { useState, useEffect } from 'react';
import { ProcurementTimeline } from '../components/ProcurementTimeline';
import { DemoToolbar } from '../components/DemoToolbar';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Booking } from '../types';

export const ProcurementTimelinePage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-forest-700" /> End-to-End Procurement Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your produce from booking & arrival through quality inspection, weighbridge, and direct bank payout.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-forest-700" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading procurement timeline...</div>
      ) : bookings.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-3xl">No procurement records found.</div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Token: <strong className="text-forest-700 font-mono text-sm">{booking.tokenNumber}</strong> ({booking.center.name})</span>
              <span>Produce: {booking.produce.name} ({booking.quantity} Tons)</span>
            </div>
            <ProcurementTimeline procurement={booking.procurement} />
          </div>
        ))
      )}

      <DemoToolbar onRefresh={fetchBookings} />
    </div>
  );
};
