import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { StatCard } from '../components/StatCard';
import { DemoToolbar } from '../components/DemoToolbar';
import { BarChart2, TrendingUp, PieChart as PieIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/admin');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded border border-purple-300">
              System Intelligence & Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-purple-700" /> State Procurement Analytics & Insights
          </h1>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-700" /> Refresh Charts
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading analytics...</div>
      ) : data ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Quantity Procured" value={`${data.summary.totalQuantityProcured || 820} Tons`} subtitle="Across centers" icon={TrendingUp} color="green" />
            <StatCard title="Average Waiting Time" value={`${data.summary.avgWaitMinutes} mins`} subtitle="AI ML baseline" icon={BarChart2} color="purple" />
            <StatCard title="Acceptance Rate" value="98.2%" subtitle="Quality inspection pass rate" icon={CheckCircle2} color="amber" />
            <StatCard title="Completed Payouts" value={data.summary.completedProcurements || 81} subtitle="Direct bank transfers" icon={PieIcon} color="blue" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Center Capacity Utilization Bar Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">Center Capacity Utilization (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.centerAnalytics}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="utilizationPercent" fill="#15803d" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Waiting Time Hourly Trend Line Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">Average Hourly Waiting Time (Minutes)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.waitTimeTrend}>
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="waitMinutes" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Crop Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">Crop Procurement Volume Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.cropDistribution} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {data.cropDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <DemoToolbar onRefresh={fetchAnalytics} />
    </div>
  );
};
