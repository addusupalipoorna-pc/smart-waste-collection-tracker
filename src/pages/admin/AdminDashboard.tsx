import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, Clock, CheckCircle2, AlertCircle, FileText,
  FileSpreadsheet, Users, Map as MapIcon, TrendingUp, Award, ArrowRight,
  Trash2, Navigation, Truck, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, AreaChart,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { StatCard, EmptyState, LoadingSpinner } from '@/components/ui';
import { ComplaintCard } from '@/components/ComplaintCard';
import { MapView } from '@/components/MapView';
import { getComplaintStats, getCleanlinessScore } from '@/lib/utils';
import { WASTE_TYPES } from '@/lib/constants';
import { exportComplaintsPDF, exportComplaintsExcel } from '@/lib/export';
import { format, subDays, isSameDay } from 'date-fns';
import { getLocalBins } from '@/lib/dataStore';

export function AdminDashboard() {
  const { profile } = useAuth();
  const { complaints, loading } = useComplaints({
    query: 'all',
    userId: profile?.id || 'demo_admin_id',
    limit: 100,
  });

  const bins = getLocalBins();
  const fullBins = bins.filter((b) => b.fill_level >= 80).length;

  if (loading) return <LoadingSpinner label="Loading administrative telemetry..." />;

  const stats = getComplaintStats(complaints);
  const score = getCleanlinessScore(complaints);

  // Waste type distribution
  const wasteTypeData = WASTE_TYPES.map((wt) => ({
    name: wt.value,
    value: complaints.filter((c) => c.waste_type === wt.value).length,
    color: wt.color,
  })).filter((d) => d.value > 0);

  // Complaint trends (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayComplaints = complaints.filter((c) => isSameDay(new Date(c.created_at), date));
    const completed = complaints.filter((c) => c.completed_at && isSameDay(new Date(c.completed_at), date));
    return {
      date: format(date, 'EEE'),
      reported: dayComplaints.length,
      completed: completed.length,
    };
  });

  // Status distribution
  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#d97706' },
    { name: 'Assigned', value: stats.assigned, color: '#2563eb' },
    { name: 'In Progress', value: stats.inProgress, color: '#0f766e' },
    { name: 'Resolved', value: stats.completed, color: '#166534' },
    { name: 'Rejected', value: stats.rejected, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  const geoComplaints = complaints.filter((c) => c.latitude != null && c.longitude != null);
  const recentComplaints = complaints.slice(0, 6);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Admin Control Center"
        subtitle="Real-time village waste monitoring, IoT telemetry, and collection logistics."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportComplaintsPDF(complaints)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
              title="Export formatted PDF report"
            >
              <FileText className="h-3.5 w-3.5 text-red-600" /> Export PDF
            </button>
            <button
              onClick={() => exportComplaintsExcel(complaints)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
              title="Export Excel spreadsheet"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" /> Export Excel
            </button>
          </div>
        }
      />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/bins" className="card p-3.5 hover:border-emerald-300 transition-all bg-white flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <Trash2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Smart Bins</p>
            <p className="text-[10px] text-slate-500">{fullBins} Require Attention</p>
          </div>
        </Link>

        <Link to="/routes" className="card p-3.5 hover:border-cyan-300 transition-all bg-white flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Route Engine</p>
            <p className="text-[10px] text-slate-500">AI TSP Optimizer</p>
          </div>
        </Link>

        <Link to="/vehicles" className="card p-3.5 hover:border-purple-300 transition-all bg-white flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-800">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Fleet Vehicles</p>
            <p className="text-[10px] text-slate-500">5 Active Trucks</p>
          </div>
        </Link>

        <Link to="/reports" className="card p-3.5 hover:border-amber-300 transition-all bg-white flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Reports Center</p>
            <p className="text-[10px] text-slate-500">Daily/Weekly Audits</p>
          </div>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Complaints" value={stats.total} icon={<ClipboardList className="h-5 w-5" />} color="#166534" />
        <StatCard label="Pending Review" value={stats.pending} icon={<Clock className="h-5 w-5" />} color="#d97706" />
        <StatCard label="Assigned / Active" value={stats.assigned + stats.inProgress} icon={<AlertCircle className="h-5 w-5" />} color="#2563eb" />
        <StatCard label="Resolved Issues" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} color="#15803d" />
      </div>

      {/* Village Cleanliness Score Banner */}
      <div className="card p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-2xs border-emerald-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Village Cleanliness Performance Index</p>
              <p className="text-3xl font-bold tracking-tight">{score}<span className="text-lg font-normal text-emerald-200">/100</span></p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs inline-block mb-1">
              {score >= 80 ? 'Excellent Status' : score >= 60 ? 'Good' : 'Needs Action'}
            </span>
            <p className="text-xs text-emerald-200">{stats.completed} of {stats.total} complaints resolved</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-700" /> Weekly Activity Trends
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166534" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="reported" name="Reported" stroke="#166534" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
              <Area type="monotone" dataKey="completed" name="Resolved" stroke="#0f766e" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Type Pie */}
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-emerald-700" /> Waste Category Distribution
          </h3>
          {wasteTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={wasteTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={42}>
                  {wasteTypeData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">No category data recorded</div>
          )}
        </div>
      </div>

      {/* Google Maps Live Map Preview */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapIcon className="h-4 w-4 text-emerald-700" /> Live Interactive Google Maps View
          </h3>
          <Link to="/admin/map" className="text-xs font-bold text-emerald-800 hover:underline">
            Fullscreen Map ➔
          </Link>
        </div>
        {geoComplaints.length > 0 ? (
          <MapView complaints={geoComplaints} height="360px" zoom={14} />
        ) : (
          <div className="h-[360px] flex items-center justify-center text-xs text-slate-400">
            No complaints with GPS coordinates
          </div>
        )}
      </div>

      {/* Recent Complaints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Recent Complaints Queue</h3>
          <Link to="/admin/complaints" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
            Manage All ({complaints.length}) <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-8 w-8" />}
            title="No complaints in queue"
            message="When citizens report village waste, issues appear here for assignment."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComplaints.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <ComplaintCard complaint={c} to={`/complaints/${c.id}`} showCitizen showCollector />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
