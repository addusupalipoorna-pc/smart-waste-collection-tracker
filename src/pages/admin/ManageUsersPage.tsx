import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ShieldCheck, AlertCircle, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/DashboardLayout';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { fetchUsers, saveLocalUsers } from '@/lib/dataStore';
import { ROLE_META } from '@/lib/constants';
import { formatDate, initialFromName, classNames } from '@/lib/utils';
import type { Profile, UserRole } from '@/types';

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export function ManageUsersPage() {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsersList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    try {
      const updatedList = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
      setUsers(updatedList);
      saveLocalUsers(updatedList);
      withTimeout(Promise.resolve(supabase.from('profiles').update({ role: newRole }).eq('id', userId)), 500, null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role.');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.full_name.toLowerCase().includes(q) ||
        (u.phone || '').includes(q) ||
        (u.zone || '').toLowerCase().includes(q);
    }
    return true;
  });

  const roleCounts = {
    all: users.length,
    citizen: users.filter((u) => u.role === 'citizen').length,
    collector: users.filter((u) => u.role === 'collector').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  if (loading) return <LoadingSpinner label="Loading user registry..." />;
  if (error) return <ErrorState message={error} onRetry={fetchUsersList} />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="User & Personnel Management"
        subtitle={`${users.length} registered village citizens, sanitation workers, and panchayat administrators.`}
      />

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-10 text-xs sm:text-sm"
            placeholder="Search by User Name, Phone, or Ward Zone..."
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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'citizen', 'collector', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                roleFilter === r
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r === 'all' ? 'All Roles' : `${r}s`}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${roleFilter === r ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                {roleCounts[r]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No users match filter"
          message={search || roleFilter !== 'all' ? 'Try adjusting your search criteria.' : 'No registered users recorded.'}
        />
      ) : (
        <div className="card overflow-hidden border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">User Profile</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Role / Access</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px] hidden sm:table-cell">Ward Zone</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px] hidden md:table-cell">Contact Phone</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px] hidden lg:table-cell">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u, i) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: i * 0.02 }}
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                            {initialFromName(u.full_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-xs">
                              {u.full_name}
                              {isSelf && <span className="ml-1 text-[10px] text-emerald-700 font-bold">(You)</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 sm:hidden">{u.zone || 'No zone assigned'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="badge text-[10px]" style={{ color: ROLE_META[u.role].color, backgroundColor: `${ROLE_META[u.role].color}15` }}>
                            <ShieldCheck className="h-3 w-3" /> {ROLE_META[u.role].label}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={updating === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className={classNames(
                              'px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 cursor-pointer transition-colors focus:ring-1 focus:ring-emerald-500',
                              updating === u.id && 'opacity-50'
                            )}
                            style={{
                              color: ROLE_META[u.role as UserRole].color,
                              backgroundColor: `${ROLE_META[u.role as UserRole].color}10`,
                            }}
                          >
                            <option value="citizen">Citizen</option>
                            <option value="collector">Collector</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell font-medium">{u.zone || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell font-medium">{u.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] hidden lg:table-cell">{formatDate(u.created_at)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
