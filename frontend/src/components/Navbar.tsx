import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Bell, User as UserIcon, LogOut, Shield, LayoutDashboard, QrCode, Building2, BarChart2, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { AppNotification, Booking } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [activeToken, setActiveToken] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Resolve the farmer's own latest token so the nav link never points at a
  // hardcoded / stale token.
  useEffect(() => {
    if (!user) {
      setActiveToken('');
      return;
    }
    let cancelled = false;
    api.get('/bookings')
      .then((res) => {
        if (cancelled || !res.data.success) return;
        const active = (res.data.data as Booking[]).find(
          (b) => !['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(b.status)
        );
        const latest = active || res.data.data[0];
        if (latest) setActiveToken(latest.tokenNumber);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      // quiet
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-forest-900 text-white shadow-md border-b border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-forest-500 to-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                OptiFreight
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">SMART SYSTEM</span>
              </span>
              <p className="text-[10px] text-emerald-300 font-medium">Smart Farmer Procurement Management</p>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-forest-950/60 p-1 rounded-xl border border-forest-800/80">
              {user.role === 'FARMER' && (
                <>
                  <Link to="/farmer-dashboard" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link to="/centers" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Book Slot
                  </Link>
                  <Link
                    to={activeToken ? `/queue/${activeToken}` : '/procurement-timeline'}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {activeToken ? `Token ${activeToken}` : 'Token & Live Queue'}
                  </Link>
                  <Link to="/procurement-timeline" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Procurement Status
                  </Link>
                </>
              )}

              {user.role === 'OFFICIAL' && (
                <>
                  <Link to="/official-dashboard" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Command Center
                  </Link>
                  <Link to="/analytics" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> Capacity Analytics
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin-dashboard" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Admin Portal
                  </Link>
                  <Link to="/analytics" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-100 hover:bg-forest-800 transition flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> Analytics & Reports
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* User Controls & Quick Role Selector */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Role Switcher Pill */}
                <div className="hidden lg:flex items-center bg-forest-950 p-0.5 rounded-lg border border-forest-800 text-[11px]">
                  <button
                    onClick={() => quickLogin('FARMER')}
                    className={`px-2 py-1 rounded-md font-semibold transition ${user.role === 'FARMER' ? 'bg-emerald-500 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                  >
                    Farmer
                  </button>
                  <button
                    onClick={() => quickLogin('OFFICIAL')}
                    className={`px-2 py-1 rounded-md font-semibold transition ${user.role === 'OFFICIAL' ? 'bg-amber-500 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                  >
                    Official
                  </button>
                  <button
                    onClick={() => quickLogin('ADMIN')}
                    className={`px-2 py-1 rounded-md font-semibold transition ${user.role === 'ADMIN' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                  >
                    Admin
                  </button>
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 rounded-xl bg-forest-800/80 hover:bg-forest-700 text-emerald-200 transition relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-forest-700" /> Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-forest-700 hover:underline font-semibold">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 py-4 text-center">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`py-2.5 px-1 text-xs ${!n.read ? 'bg-emerald-50/70 font-medium' : ''}`}>
                              <p className="font-bold text-slate-800">{n.title}</p>
                              <p className="text-slate-600 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 bg-forest-800/60 pl-3 pr-2 py-1 rounded-xl border border-forest-700/60">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-bold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-emerald-300 font-medium uppercase tracking-wider">{user.role}</p>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    title="Logout"
                    className="p-1.5 hover:bg-forest-700 text-emerald-300 hover:text-white rounded-lg transition ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-forest-800 text-emerald-100 hover:bg-forest-700 transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
