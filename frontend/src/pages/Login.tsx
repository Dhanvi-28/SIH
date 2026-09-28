import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, UserCheck, Shield, Building2, Lock, Phone } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('farmer123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(identifier, password);
    setLoading(false);
    if (ok) {
      navigate('/farmer-dashboard');
    } else {
      setError('Invalid credentials. Try demo buttons below.');
    }
  };

  const handleDemo = async (role: 'FARMER' | 'OFFICIAL' | 'ADMIN') => {
    setLoading(true);
    await quickLogin(role);
    setLoading(false);
    if (role === 'FARMER') navigate('/farmer-dashboard');
    else if (role === 'OFFICIAL') navigate('/official-dashboard');
    else navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-forest-900 text-emerald-400 flex items-center justify-center mx-auto shadow-lg mb-3">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">OptiFreight Portal Sign In</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Smart Farmer Procurement Management System</p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number / Email</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                placeholder="e.g. 9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition active:scale-98"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Seeded Quick Login Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Quick Demo Accounts (Instant Access)
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleDemo('FARMER')}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" /> Farmer (Ramesh Kumar)
              </span>
              <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">9876543210</span>
            </button>

            <button
              onClick={() => handleDemo('OFFICIAL')}
              className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" /> Center Official (Suresh Gowda)
              </span>
              <span className="text-[10px] font-mono bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded">official@procurement.gov</span>
            </button>

            <button
              onClick={() => handleDemo('ADMIN')}
              className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs rounded-xl flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" /> State Admin (Dr. Anita Rao)
              </span>
              <span className="text-[10px] font-mono bg-blue-200/80 text-blue-950 px-1.5 py-0.5 rounded">admin@procurement.gov</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
