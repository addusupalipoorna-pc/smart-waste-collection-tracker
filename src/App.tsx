import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DashboardLayout } from '@/components/DashboardLayout';

// Public pages
import { LandingPage } from '@/pages/public/LandingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ServicesPage } from '@/pages/public/ServicesPage';
import { ContactPage } from '@/pages/public/ContactPage';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';

// Citizen pages
import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { ReportWastePage } from '@/pages/citizen/ReportWastePage';
import { ComplaintHistoryPage } from '@/pages/citizen/ComplaintHistoryPage';

// Collector pages
import { CollectorDashboard } from '@/pages/collector/CollectorDashboard';
import { AssignedComplaintsPage } from '@/pages/collector/AssignedComplaintsPage';
import { CollectorRouteMapPage } from '@/pages/collector/CollectorRouteMapPage';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AllComplaintsPage } from '@/pages/admin/AllComplaintsPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { ManageUsersPage } from '@/pages/admin/ManageUsersPage';
import { AdminLiveMapPage } from '@/pages/admin/AdminLiveMapPage';
import { SmartBinsPage } from '@/pages/admin/SmartBinsPage';
import { RouteOptimizationPage } from '@/pages/admin/RouteOptimizationPage';
import { VehicleManagementPage } from '@/pages/admin/VehicleManagementPage';
import { ReportsPage } from '@/pages/admin/ReportsPage';

// Shared pages
import { ComplaintDetailPage } from '@/pages/shared/ComplaintDetailPage';
import { ProfilePage } from '@/pages/shared/ProfilePage';
import { CollectionSchedulePage } from '@/pages/shared/CollectionSchedulePage';
import { ImpactSDGPage } from '@/pages/shared/ImpactSDGPage';
import { AIClassifierPage } from '@/pages/shared/AIClassifierPage';

import type { UserRole } from '@/types';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-3">
      <div className="h-8 w-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-500">Loading Smart Waste Portal...</p>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session || !profile) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (roles && !roles.includes(profile.role)) {
    const dest = profile.role === 'admin' ? '/admin' : profile.role === 'collector' ? '/collector' : '/citizen';
    return <Navigate to={dest} replace />;
  }
  return <DashboardLayout />;
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (session && profile) {
    const dest = profile.role === 'admin' ? '/admin' : profile.role === 'collector' ? '/collector' : '/citizen';
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
      <Route path="/signup" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />

      {/* Citizen */}
      <Route element={<RequireAuth roles={['citizen']} />}>
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/citizen/report" element={<ReportWastePage />} />
        <Route path="/citizen/history" element={<ComplaintHistoryPage />} />
      </Route>

      {/* Collector */}
      <Route element={<RequireAuth roles={['collector']} />}>
        <Route path="/collector" element={<CollectorDashboard />} />
        <Route path="/collector/assigned" element={<AssignedComplaintsPage />} />
        <Route path="/collector/map" element={<CollectorRouteMapPage />} />
      </Route>

      {/* Admin */}
      <Route element={<RequireAuth roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/bins" element={<SmartBinsPage />} />
        <Route path="/routes" element={<RouteOptimizationPage />} />
        <Route path="/vehicles" element={<VehicleManagementPage />} />
        <Route path="/admin/complaints" element={<AllComplaintsPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/map" element={<AdminLiveMapPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Shared (any authenticated role) */}
      <Route element={<RequireAuth />}>
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/schedule" element={<CollectionSchedulePage />} />
        <Route path="/impact" element={<ImpactSDGPage />} />
        <Route path="/ai-classifier" element={<AIClassifierPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
