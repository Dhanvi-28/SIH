import React from 'react';
import { Booking } from '../types';
import { QrCode, MapPin, Calendar, Clock, Wheat, Ticket } from 'lucide-react';

export const TokenCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ARRIVED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CALLED': return 'bg-amber-100 text-amber-900 border-amber-400 font-black animate-pulse';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-gradient-to-br from-forest-900 via-forest-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-forest-800 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />

      <div className="flex items-center justify-between pb-4 border-b border-forest-800/80">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Digital Procurement Token</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Token Number Display */}
        <div className="bg-forest-950/80 p-5 rounded-2xl border border-forest-700/80 text-center md:text-left shadow-inner">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Token Number</p>
          <h2 className="text-4xl sm:text-5xl font-black text-amber-400 mt-1 tracking-tight font-mono">
            {booking.tokenNumber}
          </h2>
          <p className="text-xs text-emerald-300 mt-1 font-semibold flex items-center justify-center md:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5" /> {booking.center?.name || 'Center'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Wheat className="w-4 h-4 text-emerald-400" />
            <span>Produce: <strong className="text-white">{booking.produce?.name || '—'}</strong> ({booking.quantity} Tons)</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Date: <strong className="text-white">{booking.schedule?.date || '—'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>
              Slot:{' '}
              <strong className="text-white">
                {booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : '—'}
              </strong>
            </span>
          </div>
        </div>

        {/* QR Code Visual */}
        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl shadow-lg border border-slate-200">
          <QrCode className="w-24 h-24 text-slate-900" />
          <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-wider">Scan at Official Counter</p>
        </div>
      </div>
    </div>
  );
};
