import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Clock, ShieldCheck, Cpu, ChevronRight, CheckCircle2, Building2, BarChart3, UserCheck } from 'lucide-react';

export const Landing: React.FC = () => {
  const { user, quickLogin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-forest-950 via-forest-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sprout className="w-4 h-4 text-emerald-400" /> Ministry of Consumer Affairs, Food & Public Distribution
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Smart Farmer Procurement <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
            Making farmer procurement more <strong className="text-white">predictable</strong>, <strong className="text-white">organized</strong>, and <strong className="text-white">transparent</strong> across India.
          </p>

          <div className="mt-4 inline-block bg-forest-950/80 px-4 py-2 rounded-2xl border border-forest-800 text-amber-400 font-black text-sm tracking-wide shadow-inner">
            SMART PROCUREMENT = LESS WAITING + BETTER CAPACITY + MORE TRANSPARENCY
          </div>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link
                to={user.role === 'FARMER' ? '/farmer-dashboard' : user.role === 'OFFICIAL' ? '/official-dashboard' : '/admin-dashboard'}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-forest-600 hover:from-emerald-400 hover:to-forest-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Go to Dashboard <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => quickLogin('FARMER')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-forest-600 hover:from-emerald-400 hover:to-forest-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <UserCheck className="w-5 h-5" /> Demo as Farmer Ramesh
                </button>
                <button
                  onClick={() => quickLogin('OFFICIAL')}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Building2 className="w-5 h-5" /> Demo as Official Officer
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 5 Core Solution Modules */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200/80 hover:border-forest-500 transition group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
              01
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">BOOK</h3>
            <p className="text-xs text-slate-600 mt-2">Digital slot booking, produce quantity selection, and instant token generation.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200/80 hover:border-purple-500 transition group">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
              02
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">AI PREDICT</h3>
            <p className="text-xs text-slate-600 mt-2">Scikit-learn ML model predicts wait time, confidence, & factor breakdown.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200/80 hover:border-blue-500 transition group">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
              03
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">ALLOCATE</h3>
            <p className="text-xs text-slate-600 mt-2">Smart slot scoring algorithm prevents center overload & bottlenecks.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200/80 hover:border-amber-500 transition group">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
              04
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">PROCURE</h3>
            <p className="text-xs text-slate-600 mt-2">Token verification, moisture inspection, weighbridge, & decision workflow.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200/80 hover:border-emerald-500 transition group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
              05
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">TRACK</h3>
            <p className="text-xs text-slate-600 mt-2">End-to-end timeline tracking and direct bank payment payout status.</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-12 bg-slate-100 px-4 sm:px-6 lg:px-8 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Designed for Both Farmers & Center Officials</h2>
            <p className="text-sm text-slate-600 mt-2">Eliminating physical queues with digital tokens, transparent capacity, and real-time operational command center.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Farmer Benefits</h3>
                  <p className="text-xs text-slate-500">Simple, icon-driven mobile experience</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pre-visit capacity and schedule visibility</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Smart slot recommendations based on crowd levels</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Digital token with visual QR scanner preview</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI-estimated waiting time with factor analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live vertical timeline from inspection to bank payout</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl font-bold">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Procurement Center Official</h3>
                  <p className="text-xs text-slate-500">Operational command center dashboard</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Real-time daily capacity tracking in Tons</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Live counter management (toggle active counters)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Quick token verification & gate arrival marking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Digital inspection form & weighbridge recording</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Instant payment trigger calculation (MSP rate × weight)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
