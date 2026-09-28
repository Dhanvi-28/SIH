import React from 'react';
import { Procurement } from '../types';
import { CheckCircle2, Clock, XCircle, AlertCircle, IndianRupee, Scale, FileText, MapPin } from 'lucide-react';

export const ProcurementTimeline: React.FC<{ procurement?: Procurement }> = ({ procurement }) => {
  const status = procurement?.status || 'PENDING';
  const inspection = procurement?.inspection;
  const weighing = procurement?.weighing;
  const payment = procurement?.payment;

  const isStepDone = (targetStep: string) => {
    const steps = ['BOOKED', 'ARRIVED', 'INSPECTED', 'WEIGHED', 'ACCEPTED', 'PAID'];
    const currentIdx = steps.indexOf(status);
    const targetIdx = steps.indexOf(targetStep);
    if (status === 'REJECTED' && targetStep !== 'REJECTED') {
      return targetIdx < steps.indexOf('INSPECTED');
    }
    return currentIdx >= targetIdx;
  };

  const timelineSteps = [
    {
      title: 'Booking Confirmed',
      desc: 'Slot & Digital Token reserved',
      done: true,
      icon: CheckCircle2,
      details: null,
    },
    {
      title: 'Arrival Verified',
      desc: 'Scanned token at procurement gate',
      done: isStepDone('ARRIVED'),
      icon: MapPin,
      details: procurement ? 'Verified at center' : 'Awaiting arrival',
    },
    {
      title: 'Produce Inspection',
      desc: inspection ? `Grade: ${inspection.qualityGrade} | Moisture: ${inspection.moisture}%` : 'Moisture & Quality Inspection',
      done: isStepDone('INSPECTED') || status === 'REJECTED',
      isError: status === 'REJECTED',
      icon: FileText,
      details: inspection ? (
        <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p>Result: <strong className={inspection.result === 'ACCEPT' ? 'text-emerald-700' : 'text-red-700'}>{inspection.result}</strong></p>
          <p>Foreign Material: {inspection.foreignMaterial}% | Damage: {inspection.visibleDamage}%</p>
          {inspection.remarks && <p className="italic text-[11px] mt-0.5">"{inspection.remarks}"</p>}
        </div>
      ) : null,
    },
    {
      title: 'Weighbridge Weighing',
      desc: weighing ? `Actual Net Weight: ${weighing.actualQuantity} Tons` : 'Gross & Net Weight Measurement',
      done: isStepDone('WEIGHED'),
      icon: Scale,
      details: weighing ? (
        <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p>Declared: {weighing.declaredQuantity} Tons → Actual: <strong className="text-slate-900">{weighing.actualQuantity} Tons</strong></p>
          <p className="text-[10px] text-slate-400 mt-0.5">Weighbridge Operator: {weighing.recordedBy}</p>
        </div>
      ) : null,
    },
    {
      title: 'Procurement Decision',
      desc: status === 'REJECTED' ? `REJECTED: ${procurement?.rejectionReason || 'Quality criteria not met'}` : 'Produce Acceptance Status',
      done: isStepDone('ACCEPTED') || status === 'REJECTED',
      isError: status === 'REJECTED',
      icon: status === 'REJECTED' ? XCircle : CheckCircle2,
      details: null,
    },
    {
      title: 'Direct Bank Payment',
      desc: payment ? `Net Payout: ₹${payment.netAmount.toLocaleString('en-IN')}` : 'Direct Payout to Farmer Account',
      done: payment?.status === 'PAID',
      icon: IndianRupee,
      details: payment ? (
        <div className="mt-2 text-xs bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-emerald-900">Payment Status:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${payment.status === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
              {payment.status}
            </span>
          </div>
          <p className="text-slate-700">Gross Amount: ₹{payment.grossAmount.toLocaleString('en-IN')}</p>
          <p className="text-slate-600">Deductions: ₹{payment.deductions.toLocaleString('en-IN')}</p>
          <p className="font-extrabold text-sm text-emerald-800 mt-1">Net Payout: ₹{payment.netAmount.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Ref ID: {payment.reference}</p>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
      <h3 className="font-extrabold text-base text-slate-900 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-forest-700" /> Procurement Progress Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {timelineSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative flex items-start gap-4 group">
              {/* Circle Marker */}
              <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow-md transition-colors ${
                step.isError
                  ? 'bg-red-500 ring-4 ring-red-100'
                  : step.done
                  ? 'bg-emerald-500 ring-4 ring-emerald-100'
                  : 'bg-slate-300 ring-4 ring-slate-100'
              }`}>
                {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className={`text-sm font-bold ${step.isError ? 'text-red-700' : step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                {step.details}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
