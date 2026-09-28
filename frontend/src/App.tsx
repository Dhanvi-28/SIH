import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { CenterDiscovery } from './pages/CenterDiscovery';
import { BookingWizard } from './pages/BookingWizard';
import { QueueView } from './pages/QueueView';
import { ProcurementTimelinePage } from './pages/ProcurementTimelinePage';
import { OfficialDashboard } from './pages/OfficialDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnalyticsPage } from './pages/AnalyticsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-slate-500">Loading OptiFreight...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Farmer Routes */}
          <Route
            path="/farmer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'OFFICIAL', 'ADMIN']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/centers"
            element={
              <ProtectedRoute>
                <CenterDiscovery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'OFFICIAL', 'ADMIN']}>
                <BookingWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue/:token"
            element={
              <ProtectedRoute>
                <QueueView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement-timeline"
            element={
              <ProtectedRoute>
                <ProcurementTimelinePage />
              </ProtectedRoute>
            }
          />

          {/* Official Routes */}
          <Route
            path="/official-dashboard"
            element={
              <ProtectedRoute allowedRoles={['OFFICIAL', 'ADMIN', 'FARMER']}>
                <OfficialDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OFFICIAL', 'FARMER']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
