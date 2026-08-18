import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Clock, CheckCircle2, AlertCircle, Trash2, History, Cpu, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { StatCard, EmptyState, LoadingSpinner } from '@/components/ui';
import { ComplaintCard } from '@/components/ComplaintCard';
import { getComplaintStats } from '@/lib/utils';
import { deleteComplaintFromStore } from '@/lib/dataStore';

export function CitizenDashboard() {
  const { profile } = useAuth();
  const { complaints, loading, refetch } = useComplaints({
    query: 'own',
    userId: profile?.id || 'demo_citizen_id',
    limit: 6,
  });

  const stats = getComplaintStats(complaints);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this complaint report?')) return;
    await deleteComplaintFromStore(id);
    refetch();
  };

  if (loading) return <LoadingSpinner label="Loading dashboard reports..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Welcome, ${(profile?.full_name || 'Citizen').split(' ')[0]}`}
        subtitle="Monitor your reported waste issues and village sanitation progress."
        action={
          <div className="flex items-center gap-2">
            <Link to="/citizen/report" className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
              <PlusCircle className="h-4 w-4" /> Report Waste Issue
            </Link>
          </div>
        }
      />

      {/* Quick Action Banner */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link
          to="/citizen/report"
          className="card p-4 hover:border-emerald-300 hover:shadow-xs transition-all bg-gradient-to-br from-emerald-50/80 to-white flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">New Waste Report</p>
              <p className="text-[11px] text-slate-500">Photo + AI + GPS Tagging</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-800 transition-colors" />
        </Link>

        <Link
          to="/ai-classifier"
          className="card p-4 hover:border-purple-300 hover:shadow-xs transition-all bg-gradient-to-br from-purple-50/80 to-white flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-800 text-white shadow-2xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">AI Waste Vision</p>
              <p className="text-[11px] text-slate-500">Scan & Classify Type</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-800 transition-colors" />
        </Link>

        <Link
          to="/schedule"
          className="card p-4 hover:border-teal-300 hover:shadow-xs transition-all bg-gradient-to-br from-teal-50/80 to-white flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white shadow-2xs">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Village Timetable</p>
              <p className="text-[11px] text-slate-500">Collection Truck Schedule</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-800 transition-colors" />
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Reported" value={stats.total} icon={<History className="h-5 w-5" />} color="#166534" />
        <StatCard label="Pending Review" value={stats.pending} icon={<Clock className="h-5 w-5" />} color="#d97706" />
        <StatCard label="In Progress" value={stats.assigned + stats.inProgress} icon={<AlertCircle className="h-5 w-5" />} color="#0f766e" />
        <StatCard label="Resolved Issues" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} color="#15803d" />
      </div>

      {/* Recent Complaints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Your Recent Complaint Reports</h3>
          {complaints.length > 0 && (
            <Link to="/citizen/history" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
              View All Complaints <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            icon={<Trash2 className="h-8 w-8" />}
            title="No complaints submitted yet"
            message="When you report a village waste pile, it will appear here. Tap below to start."
            action={
              <Link to="/citizen/report" className="btn-primary text-xs px-4 py-2.5">
                <PlusCircle className="h-4 w-4" /> Report Your First Issue
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {complaints.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <ComplaintCard complaint={c} to={`/complaints/${c.id}`} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
