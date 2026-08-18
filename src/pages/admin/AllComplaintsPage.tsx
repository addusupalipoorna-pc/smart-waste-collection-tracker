import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, FileSpreadsheet, ClipboardList, X, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { ComplaintCard } from '@/components/ComplaintCard';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { exportComplaintsPDF, exportComplaintsExcel } from '@/lib/export';
import { updateComplaintInStore, fetchCollectors } from '@/lib/dataStore';
import type { ComplaintStatus, Profile } from '@/types';
import { STATUS_META } from '@/lib/constants';

const statusFilters: (ComplaintStatus | 'all')[] = ['all', 'Pending', 'Assigned', 'In Progress', 'Completed', 'Rejected'];

export function AllComplaintsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [assignModalComplaint, setAssignModalComplaint] = useState<any | null>(null);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [collectors, setCollectors] = useState<Profile[]>(() => {
    return [
      { id: 'demo_collector_id', full_name: 'Rajesh Kumar (Collector)', role: 'collector', phone: '+91 91234 56789', zone: 'Central Zone', avatar_url: null, created_at: '' },
      { id: 'collector_2', full_name: 'Suresh Patel (Collector)', role: 'collector', phone: '+91 98111 22233', zone: 'North Zone', avatar_url: null, created_at: '' },
      { id: 'collector_3', full_name: 'Vikram Singh (Collector)', role: 'collector', phone: '+91 97444 55566', zone: 'South Zone', avatar_url: null, created_at: '' },
    ];
  });

  const { complaints, loading, refetch } = useComplaints({
    query: 'all',
    userId: profile?.id || 'demo_admin_id',
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: complaints.length };
    for (const s of statusFilters) {
      if (s !== 'all') {
        counts[s] = complaints.filter((c) => (c.status || '').toLowerCase().trim() === s.toLowerCase().trim()).length;
      }
    }
    return counts;
  }, [complaints]);

  const handleQuickAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalComplaint || !selectedCollector) return;
    setAssigning(true);
    try {
      await updateComplaintInStore(assignModalComplaint.id, {
        assigned_collector_id: selectedCollector,
        status: 'Assigned',
        admin_notes: 'Assigned by administrator via quick queue.',
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

  if (loading) return <LoadingSpinner label="Loading all complaints repository..." />;

  const unassignedCount = complaints.filter((c) => c.status === 'Pending' || !c.assigned_collector_id).length;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="All Complaints & Assignment Queue"
        subtitle={`${complaints.length} total waste complaints registered. ${unassignedCount} pending assignment.`}
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

      {/* Pending Notice Banner if unassigned items exist */}
      {unassignedCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-900">
              <strong>{unassignedCount} complaint{unassignedCount !== 1 ? 's' : ''} require assignment</strong> to sanitation workers.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('Pending')}
            className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors shrink-0"
          >
            Filter Pending
          </button>
        </div>
      )}

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
