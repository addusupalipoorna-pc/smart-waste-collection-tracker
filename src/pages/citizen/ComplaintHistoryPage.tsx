import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { History, Search, PlusCircle, Filter, Trash2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { ComplaintCard } from '@/components/ComplaintCard';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { deleteComplaintFromStore } from '@/lib/dataStore';
import type { ComplaintStatus } from '@/types';
import { STATUS_META } from '@/lib/constants';

const statusFilters: (ComplaintStatus | 'all')[] = ['all', 'Pending', 'Assigned', 'In Progress', 'Completed'];

export function ComplaintHistoryPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  const { complaints, loading, refetch } = useComplaints({
    query: 'own',
    userId: profile?.id || 'demo_citizen_id',
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this complaint report?')) return;
    await deleteComplaintFromStore(id);
    refetch();
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: complaints.length };
    for (const s of statusFilters) {
      if (s !== 'all') {
        counts[s] = complaints.filter((c) => (c.status || '').toLowerCase().trim() === s.toLowerCase().trim()).length;
      }
    }
    return counts;
  }, [complaints]);

  if (loading) return <LoadingSpinner label="Loading complaint history..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="My Complaint History"
        subtitle="Track and review all village waste reports submitted by your account."
        action={
          <Link to="/citizen/report" className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
            <PlusCircle className="h-4 w-4" /> Report New Issue
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-10 text-xs sm:text-sm"
            placeholder="Search by Complaint ID, Category, Landmark or Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                statusFilter === s
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_META[s as ComplaintStatus]?.label || s}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === s ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                {statusCounts[s] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {complaints.length === 0 ? (
        <EmptyState
          icon={<History className="h-8 w-8" />}
          title={search || statusFilter !== 'all' ? 'No matching complaints found' : 'No complaints recorded yet'}
          message={
            search || statusFilter !== 'all'
              ? 'Try modifying your search keywords or switching status filter.'
              : 'Submit your first waste issue report to start tracking resolution progress.'
          }
          action={
            !search && statusFilter === 'all' ? (
              <Link to="/citizen/report" className="btn-primary text-xs px-4 py-2.5">
                <PlusCircle className="h-4 w-4" /> Report Waste Issue
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {complaints.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
            >
              <ComplaintCard complaint={c} to={`/complaints/${c.id}`} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
