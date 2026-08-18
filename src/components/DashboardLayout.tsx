import { Link, Outlet, useLocation, useNavigate, NavigateFunction } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, FileText, Map, BarChart3, Users, LogOut, Menu, X,
  Leaf, Bell, User, ClipboardList, PlusCircle, History, Trash2, Cpu,
  Navigation, Truck, Calendar, Globe, Sparkles, RefreshCw, AlertTriangle, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';
import { ROLE_META } from '@/lib/constants';
import { classNames, initialFromName } from '@/lib/utils';
import { simulateSensorUpdates } from '@/lib/dataStore';
import type { UserRole } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navByRole: Record<UserRole, NavItem[]> = {
  citizen: [
    { to: '/citizen', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/citizen/report', label: 'Report Waste Issue', icon: PlusCircle },
    { to: '/ai-classifier', label: 'AI Waste Scanner', icon: Cpu },
    { to: '/citizen/history', label: 'My Complaints', icon: History },
    { to: '/schedule', label: 'Village Schedule', icon: Calendar },
    { to: '/impact', label: 'Impact & SDG', icon: Globe },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ],
  collector: [
    { to: '/collector', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/collector/assigned', label: 'Assigned Tasks', icon: ClipboardList },
    { to: '/collector/map', label: 'Navigation Map', icon: Map },
    { to: '/schedule', label: 'Village Schedule', icon: Calendar },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bins', label: 'Smart Bins (IoT)', icon: Trash2 },
    { to: '/routes', label: 'Route Optimization', icon: Navigation },
    { to: '/admin/complaints', label: 'All Complaints', icon: FileText },
    { to: '/vehicles', label: 'Fleet Vehicles', icon: Truck },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports Center', icon: FileText },
    { to: '/impact', label: 'Impact & SDG', icon: Globe },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/map', label: 'Live Map', icon: Map },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ],
};

export function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate: NavigateFunction = useNavigate();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [demoBanner, setDemoBanner] = useState(true);
  const [simulating, setSimulating] = useState(false);

  if (!profile) {
    navigate('/login');
    return null;
  }

  const navItems = navByRole[profile.role] || [];
  const roleMeta = ROLE_META[profile.role];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSimulateIoT = () => {
    setSimulating(true);
    setTimeout(() => {
      simulateSensorUpdates();
      setSimulating(false);
    }, 400);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-sm shadow-emerald-800/30">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-sm text-slate-900 tracking-tight block leading-tight">Smart Waste Tracker</span>
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Village Smart City</span>
        </div>
      </Link>

      {/* User Profile Card in Sidebar */}
      <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs">
            {initialFromName(profile.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{profile.full_name}</p>
            <span
              className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide"
              style={{ color: roleMeta.color, backgroundColor: `${roleMeta.color}15` }}
            >
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Navigation</p>
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileSidebar(false)}
              className={classNames(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                active
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={classNames('h-4 w-4 shrink-0', active ? 'text-emerald-700' : 'text-slate-400')} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setMobileSidebar(false)} />
          <div className="relative w-64 max-w-full z-10 animate-fade-in">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebar(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm hidden sm:inline-block">
                {roleMeta.label} Portal
              </span>
              <span className="text-xs text-slate-400 hidden lg:inline-block">• Panchayat Ward 4, Tirupati</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleSimulateIoT}
              disabled={simulating}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 transition-all shadow-2xs"
              title="Click to simulate live IoT fill updates"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-700 ${simulating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Simulate IoT</span>
            </button>
            <NotificationBell userId={profile.id} />
          </div>
        </header>

        {/* Demo Mode Notice */}
        {demoBanner && (
          <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                <strong>ACADEMIC PROJECT DEMO:</strong> AI Waste Classification, IoT Sensor Telemetry & Google Maps Navigation Active.
              </span>
            </div>
            <button onClick={() => setDemoBanner(false)} className="text-slate-400 hover:text-white font-bold ml-2 text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
