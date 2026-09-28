import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wheat, Building2, Calendar, Clock, CheckCircle2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Produce, ProcurementCenter, SlotRecommendation } from '../types';

export const BookingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCenterId = searchParams.get('centerId') || '';

  const [step, setStep] = useState(1);
  const [produces, setProduces] = useState<Produce[]>([]);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [recommendations, setRecommendations] = useState<SlotRecommendation[]>([]);

  // Selected State
  const [selectedProduceId, setSelectedProduceId] = useState('');
  const [quantity, setQuantity] = useState('24.0');
  const [selectedCenterId, setSelectedCenterId] = useState(preselectedCenterId);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, centerRes] = await Promise.all([
        api.get('/produce'),
        api.get('/centers'),
      ]);

      if (prodRes.data.success && prodRes.data.data.length > 0) {
        setProduces(prodRes.data.data);
        setSelectedProduceId(prodRes.data.data[0].id);
      }

      if (centerRes.data.success && centerRes.data.data.length > 0) {
        setCenters(centerRes.data.data);
        if (!preselectedCenterId) {
          setSelectedCenterId(centerRes.data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSlotRecommendations = async () => {
    setLoadingSlots(true);
    setError('');
    try {
      const res = await api.get('/slots/recommendations', {
        params: {
          centerId: selectedCenterId,
          produceId: selectedProduceId,
          date: selectedDate,
          quantity: parseFloat(quantity),
        },
      });

      if (res.data.success) {
        setRecommendations(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSlotId(res.data.data[0].slotId);
        }
      }
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Error fetching slot recommendations');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleNextToSlots = async () => {
    if (!selectedProduceId || !selectedCenterId || !quantity || parseFloat(quantity) <= 0) {
      setError('Please select produce, quantity, and center');
      return;
    }
    setStep(4);
    await fetchSlotRecommendations();
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlotId) {
      setError('Please select a slot');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      // Find current schedule ID for selected center
      const center = centers.find(c => c.id === selectedCenterId);
      const scheduleRes = await api.get(`/centers/${selectedCenterId}`);
      const schedules = scheduleRes.data.data.schedules || [];
      const schedule = schedules[0];

      const res = await api.post('/bookings', {
        centerId: selectedCenterId,
        produceId: selectedProduceId,
        scheduleId: schedule?.id || 'schedule-id',
        slotId: selectedSlotId,
        quantity: parseFloat(quantity),
      });

      if (res.data.success) {
        const token = res.data.data.tokenNumber;
        navigate(`/queue/${token}`);
      }
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'Failed to confirm booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedProduce = produces.find(p => p.id === selectedProduceId);
  const selectedCenter = centers.find(c => c.id === selectedCenterId);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Procurement Slot Booking</h1>
        <p className="text-xs text-slate-500 mt-1">Guided 4-step smart slot booking with digital token</p>

        {/* Stepper Header */}
        <div className="flex items-center justify-center gap-2 mt-6 max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition ${
                  step === s
                    ? 'bg-forest-900 text-white shadow-lg ring-4 ring-forest-100'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 4 && <div className={`h-1 flex-1 rounded ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium text-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
        {/* STEP 1: Select Produce & Quantity */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-600" /> Step 1: Select Produce & Quantity
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Crop / Produce Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {produces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduceId(p.id)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      selectedProduceId === p.id
                        ? 'border-forest-600 bg-forest-50 text-forest-950 font-bold ring-2 ring-forest-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="text-sm font-extrabold">{p.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">MSP Rate: ₹{p.baseRatePerUnit}/Ton</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Produce Quantity (Tons)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-forest-600"
                placeholder="e.g. 24.0"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              Continue to Center Selection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Select Center */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-forest-700" /> Step 2: Select Procurement Center
            </h2>

            <div className="space-y-3">
              {centers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCenterId(c.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedCenterId === c.id
                      ? 'border-forest-600 bg-forest-50 text-forest-950 font-bold ring-2 ring-forest-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{c.address}, {c.district}</p>
                    </div>
                    <span className="text-xs text-forest-700 font-bold">Cap: {c.dailyCapacity} Tons</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-2 py-3.5 bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Continue to Date <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Select Date */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest-700" /> Step 3: Select Date
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Procurement Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-forest-600"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNextToSlots}
                className="flex-2 py-3.5 bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Get AI Smart Slot Recommendations <Sparkles className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Smart Slot Recommendations */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Step 4: AI Recommended Slots
              </h2>
              <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Ranked by ML Engine
              </span>
            </div>

            {loadingSlots ? (
              <div className="p-8 text-center text-slate-500">Calculating optimal slot scores...</div>
            ) : recommendations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No available slots found for this date.</p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((slot) => (
                  <div
                    key={slot.slotId}
                    onClick={() => setSelectedSlotId(slot.slotId)}
                    className={`p-5 rounded-2xl border cursor-pointer transition ${
                      selectedSlotId === slot.slotId
                        ? 'border-purple-600 bg-purple-50/70 text-slate-900 ring-2 ring-purple-600 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-900 text-amber-400 font-black text-sm rounded-xl flex items-center justify-center shadow">
                          {slot.score}
                          <span className="text-[9px] font-normal text-slate-300">/100</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" /> {slot.startTime} – {slot.endTime}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Expected Wait: <strong className="text-purple-700">{slot.expectedWaitMinutes} mins</strong> | Crowd: <strong className="text-slate-900">{slot.crowdLevel}</strong>
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full w-fit">
                        Recommended
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs space-y-1">
                      {slot.reasons.map((r, idx) => (
                        <p key={idx} className="text-slate-600 font-medium">{r}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
                className="flex-2 py-3.5 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {bookingLoading ? 'Confirming...' : 'Confirm & Generate Digital Token'} <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
