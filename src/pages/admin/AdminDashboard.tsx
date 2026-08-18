import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, Clock, CheckCircle2, AlertCircle, FileText,
  FileSpreadsheet, Users, Map as MapIcon, TrendingUp, Award, ArrowRight,
  Trash2, Navigation, Truck, Sparkles, UserCheck, X
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
import { getLocalBins, updateComplaintInStore } from '@/lib/dataStore';
import type { Profile } from '@/types';

export function AdminDashboard() {
  const { profile } = useAuth();
  const [assignModalComplaint, setAssignModalComplaint] = useState<any | null>(null);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [assigning, setAssigning] = useState(false);
  const collectors: Profile[] = [
    { id: 'demo_collector_id', full_name: 'Rajesh Kumar (Collector)', role: 'collector', phone: '+91 91234 56789', zone: 'Central Zone', avatar_url: null, created_at: '' },
    { id: 'collector_2', full_name: 'Suresh Patel (Collector)', role: 'collector', phone: '+91 98111 22233', zone: 'North Zone', avatar_url: null, created_at: '' },
    { id: 'collector_3', full_name: 'Vikram Singh (Collector)', role: 'collector', phone: '+91 97444 55566', zone: 'South Zone', avatar_url: null, created_at: '' },
  ];

  const { complaints, loading, refetch } = useComplaints({
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

  const geoComplaints = complaints.filter((c) => c.latitude != null && c.longitude != null);
  const recentComplaints = complaints.slice(0, 6);

  const handleQuickAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalComplaint || !selectedCollector) return;
    setAssigning(true);
    try {
      await updateComplaintInStore(assignModalComplaint.id, {
        assigned_collector_id: selectedCollector,
        status: 'Assigned',
        admin_notes: 'Assigned by administrator via quick dashboard queue.',
      });
      setAssignModalComplaint(null);
      setSelectedCollector('');
      refetch();
    } catch {
      // ignore
    } finally {
      setAssigning(false);
    }
  };

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Reports"
          value={stats.total}
          icon={<ClipboardList className="h-5 w-5" />}
          color="#166534"
          subtitle="All village wards"
        />
        <StatCard
          label="Pending Assignment"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
          color="#d97706"
          subtitle="Requires dispatch"
        />
        <StatCard
          label="Active Collection"
          value={stats.assigned + stats.inProgress}
          icon={<Truck className="h-5 w-5" />}
          color="#0f766e"
          subtitle="En route / In progress"
        />
        <StatCard
          label="Resolved Issues"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="#166534"
          subtitle="Photo-verified clean"
        />
      </div>

      {/* IoT & Operations Secondary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link to="/bins" className="card p-4 hover:border-emerald-300 transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IoT Smart Bins</p>
            <p className="font-bold text-lg text-slate-900 mt-0.5">{bins.length} Active Nodes</p>
            <p className="text-[11px] text-red-600 font-semibold">{fullBins} Over 80% Full</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Trash2 className="h-4 w-4" />
          </div>
        </Link>

        <Link to="/routes" className="card p-4 hover:border-emerald-300 transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Route AI</p>
            <p className="font-bold text-lg text-slate-900 mt-0.5">36% Fuel Saved</p>
            <p className="text-[11px] text-emerald-700 font-semibold">TSP Optimization</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Navigation className="h-4 w-4" />
          </div>
        </Link>

        <Link to="/vehicles" className="card p-4 hover:border-emerald-300 transition-all flex items-center justify-between group">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fleet Vehicles</p>
            <p className="font-bold text-lg text-slate-900 mt-0.5">5 Trucks Active</p>
            <p className="text-[11px] text-blue-700 font-semibold">Live GPS Status</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Truck className="h-4 w-4" />
          </div>
        </Link>

        <div className="card p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Cleanliness Score</p>
            <p className="font-bold text-2xl text-emerald-950 mt-0.5">{score}<span className="text-sm text-slate-400 font-normal">/100</span></p>
            <p className="text-[11px] text-emerald-700 font-semibold">Village Index</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="card p-5 lg:col-span-2 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-700" /> Weekly Collection vs Resolution Trend
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
                className="space-y-2"
              >
                <ComplaintCard complaint={c} to={`/complaints/${c.id}`} showCitizen showCollector />
                {(c.status === 'Pending' || !c.assigned_collector_id) && (
                  <button
                    onClick={() => setAssignModalComplaint(c)}
                    className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Assign Sanitation Worker
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Assign Modal */}
      {assignModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 max-w-md w-full space-y-4 shadow-xl border-emerald-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Assign Worker to Complaint</h3>
              <button onClick={() => setAssignModalComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{assignModalComplaint.complaint_code} ({assignModalComplaint.waste_type} Waste)</p>
              <p className="text-slate-500 truncate">{assignModalComplaint.address}</p>
              <p className="text-slate-600 line-clamp-2 mt-1">{assignModalComplaint.description}</p>
            </div>

            <form onSubmit={handleQuickAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="label">Select Field Worker</label>
                <select
                  required
                  className="input text-xs"
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                >
                  <option value="">Choose a worker...</option>
                  {collectors.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.full_name} ({col.zone || 'Central Zone'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAssignModalComplaint(null)} className="btn-secondary text-xs px-3.5 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={!selectedCollector || assigning} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
