import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, FileSpreadsheet, ClipboardList, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { ComplaintCard } from '@/components/ComplaintCard';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { exportComplaintsPDF, exportComplaintsExcel } from '@/lib/export';
import type { ComplaintStatus } from '@/types';
import { STATUS_META } from '@/lib/constants';

const statusFilters: (ComplaintStatus | 'all')[] = ['all', 'submitted', 'assigned', 'in_progress', 'resolved', 'rejected'];

export function AllComplaintsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  const { complaints, loading } = useComplaints({
    query: 'all',
    userId: profile?.id || 'demo_admin_id',
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: complaints.length };
    for (const s of statusFilters) {
      if (s !== 'all') counts[s] = complaints.filter((c) => c.status === s).length;
    }
    return counts;
  }, [complaints]);

  if (loading) return <LoadingSpinner label="Loading all complaints repository..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="All Complaints Queue"
        subtitle={`${complaints.length} total waste complaints registered across the village wards.`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportComplaintsPDF(complaints)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-red-600" /> Export PDF
            </button>
            <button
              onClick={() => exportComplaintsExcel(complaints)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" /> Export Excel
            </button>
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-10 text-xs sm:text-sm"
            placeholder="Search by Complaint ID, Category, Landmark, Description or Citizen Name..."
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
          icon={<ClipboardList className="h-8 w-8" />}
          title={search || statusFilter !== 'all' ? 'No matching complaints found' : 'No complaints recorded yet'}
          message={
            search || statusFilter !== 'all'
              ? 'Try modifying your search query or switching status filter.'
              : 'When citizens submit waste complaints, they will appear here.'
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c, i) => (
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
  );
}
