import React, { useState } from 'react';
import { Procurement } from '../types';
import { X, CheckCircle2, XCircle, Scale, FileText, IndianRupee, ShieldAlert } from 'lucide-react';
import api from '../services/api';

interface InspectionModalProps {
  procurement: Procurement;
  onClose: () => void;
  onSuccess: () => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({ procurement, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'inspect' | 'weigh' | 'pay'>('inspect');

  // Inspection form
  const [moisture, setMoisture] = useState(procurement.inspection?.moisture || 12.0);
  const [qualityGrade, setQualityGrade] = useState(procurement.inspection?.qualityGrade || 'A');
  const [foreignMaterial, setForeignMaterial] = useState(procurement.inspection?.foreignMaterial || 0.8);
  const [visibleDamage, setVisibleDamage] = useState(procurement.inspection?.visibleDamage || 0.2);
  const [remarks, setRemarks] = useState(procurement.inspection?.remarks || '');
  const [rejectionReason, setRejectionReason] = useState('');

  // Weighing form
  const [actualQuantity, setActualQuantity] = useState(
    procurement.weighing?.actualQuantity || procurement.actualQuantity || procurement.booking?.quantity || 24.0
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleInspection = async (result: 'ACCEPT' | 'REJECT') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/procurements/${procurement.id}/inspection`, {
        moisture,
        qualityGrade,
        foreignMaterial,
        visibleDamage,
        remarks,
        result,
        rejectionReason,
      });

      if (res.data.success) {
        setMsg(res.data.message);
        if (result === 'ACCEPT') {
          setActiveTab('weigh');
        } else {
          setTimeout(() => { onSuccess(); onClose(); }, 1500);
        }
      }
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Inspection recording failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWeighing = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/procurements/${procurement.id}/weigh`, {
        actualQuantity,
        remarks,
      });

      if (res.data.success) {
        setMsg(res.data.message);
        setActiveTab('pay');
      }
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Weighing recording failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!procurement.payment) {
      setError('Payment payout record not ready');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/payments/${procurement.payment.id}/process`, {});
      if (res.data.success) {
        setMsg(res.data.message);
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
      }
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const rate = procurement.booking?.produce.baseRatePerUnit || 2300;
  const gross = actualQuantity * rate;
  const net = gross - 140;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
            {procurement.booking?.tokenNumber}
          </span>
          <h3 className="font-extrabold text-base text-slate-900">
            {procurement.booking?.farmer.user.name} ({procurement.booking?.produce.name})
          </h3>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('inspect')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'inspect' ? 'border-forest-600 text-forest-800' : 'border-transparent text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" /> 1. Quality Inspection
          </button>
          <button
            onClick={() => setActiveTab('weigh')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'weigh' ? 'border-forest-600 text-forest-800' : 'border-transparent text-slate-400'
            }`}
          >
            <Scale className="w-4 h-4" /> 2. Weighbridge
          </button>
          <button
            onClick={() => setActiveTab('pay')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'pay' ? 'border-forest-600 text-forest-800' : 'border-transparent text-slate-400'
            }`}
          >
            <IndianRupee className="w-4 h-4" /> 3. Trigger Payment
          </button>
        </div>

        {error && <p className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
        {msg && <p className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl">{msg}</p>}

        {/* TAB 1: INSPECTION */}
        {activeTab === 'inspect' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Moisture % (Standard: &lt; 14%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Acceptable)</option>
                  <option value="REJECT">Substandard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Foreign Material %</label>
                <input
                  type="number"
                  step="0.1"
                  value={foreignMaterial}
                  onChange={(e) => setForeignMaterial(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visible Damage %</label>
                <input
                  type="number"
                  step="0.1"
                  value={visibleDamage}
                  onChange={(e) => setVisibleDamage(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Inspector Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Excellent paddy quality"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => handleInspection('ACCEPT')}
                disabled={loading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" /> ACCEPT Produce
              </button>
              <button
                onClick={() => handleInspection('REJECT')}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <XCircle className="w-4 h-4" /> REJECT Produce
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WEIGHING */}
        {activeTab === 'weigh' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-semibold">Declared Booking Quantity:</p>
              <p className="text-lg font-black text-slate-900">{procurement.booking?.quantity} Tons</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Actual Weighbridge Net Quantity (Tons)</label>
              <input
                type="number"
                step="0.1"
                value={actualQuantity}
                onChange={(e) => setActualQuantity(parseFloat(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
              />
            </div>

            <button
              onClick={handleWeighing}
              disabled={loading}
              className="w-full py-3 bg-forest-900 hover:bg-forest-800 text-white font-extrabold rounded-xl shadow mt-4"
            >
              Record Weighing & Generate Payout Breakdown
            </button>
          </div>
        )}

        {/* TAB 3: PAYMENT */}
        {activeTab === 'pay' && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
              <p className="font-bold text-emerald-900">Direct Payment Payout Summary</p>
              <p className="text-slate-700">Accepted Weight: <strong className="text-slate-900">{actualQuantity} Tons</strong></p>
              <p className="text-slate-700">Government MSP Rate: <strong className="text-slate-900">₹{rate} / Ton</strong></p>
              <p className="text-slate-700">Gross Amount: <strong className="text-slate-900">₹{gross.toLocaleString('en-IN')}</strong></p>
              <p className="text-slate-600">Handling Fee Deductions: ₹140</p>
              <p className="text-base font-black text-emerald-800 pt-1 border-t border-emerald-200">
                Net Farmer Payout: ₹{net.toLocaleString('en-IN')}
              </p>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <IndianRupee className="w-5 h-5" /> Trigger Direct Bank Payout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
