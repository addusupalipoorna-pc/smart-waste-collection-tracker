import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, PlayCircle, CheckCircle2, Navigation, Truck, Map, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { StatCard, EmptyState, LoadingSpinner } from '@/components/ui';
import { ComplaintCard } from '@/components/ComplaintCard';
import { getComplaintStats } from '@/lib/utils';

export function CollectorDashboard() {
  const { profile } = useAuth();
  const { complaints, loading } = useComplaints({
    query: 'assigned',
    userId: profile?.id || 'demo_collector_id',
    limit: 6,
  });

  const stats = getComplaintStats(complaints);
  const activeTasks = complaints.filter((c) => c.status === 'assigned' || c.status === 'in_progress');

  if (loading) return <LoadingSpinner label="Loading assigned task schedule..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Welcome, ${(profile?.full_name || 'Worker').split(' ')[0]}`}
        subtitle="Field Collection Tasks, Driving Navigation & Verification Proof Queue"
        action={
          <div className="flex items-center gap-2">
            <Link to="/collector/map" className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
              <Navigation className="h-4 w-4" /> Navigation Route Map
            </Link>
          </div>
        }
      />

      {/* Active Tasks Banner */}
      {activeTasks.length > 0 && (
        <div className="card p-4 bg-emerald-50/70 border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900">
                You have {activeTasks.length} active collection {activeTasks.length === 1 ? 'task' : 'tasks'} assigned
              </p>
              <p className="text-xs text-slate-500">Open navigation to get Google Maps driving directions & voice guidance.</p>
            </div>
          </div>
          <Link to="/collector/map" className="btn-primary text-xs px-4 py-2 shrink-0 self-start sm:self-auto">
            <Map className="h-3.5 w-3.5" /> Open Route Map
          </Link>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Assigned" value={stats.total} icon={<ClipboardList className="h-5 w-5" />} color="#166534" />
        <StatCard label="New Queue" value={stats.assigned} icon={<Clock className="h-5 w-5" />} color="#d97706" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<PlayCircle className="h-5 w-5" />} color="#0f766e" />
        <StatCard label="Completed Tasks" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} color="#15803d" />
      </div>

      {/* Recent Assigned Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Assigned Collection Tasks</h3>
          {complaints.length > 0 && (
            <Link to="/collector/assigned" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
              View All Tasks ({complaints.length}) <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-8 w-8" />}
            title="No tasks currently assigned"
            message="When village administrators dispatch waste complaints, they will appear here."
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
                <ComplaintCard complaint={c} to={`/complaints/${c.id}`} showCitizen />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
