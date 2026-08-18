import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getLocalComplaints } from '@/lib/dataStore';
import type { Complaint, ComplaintStatus } from '@/types';

type ComplaintQuery = 'own' | 'assigned' | 'all';

interface UseComplaintsOptions {
  query: ComplaintQuery;
  userId: string;
  status?: ComplaintStatus | string;
  search?: string;
  limit?: number;
}

function normalizeStatus(st: string): string {
  if (!st) return '';
  const s = st.toLowerCase().replace('_', ' ').trim();
  if (s === 'submitted') return 'pending';
  if (s === 'resolved' || s === 'collected') return 'completed';
  return s;
}

export function useComplaints({ query, userId, status, search, limit }: UseComplaintsOptions) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let dbQuery = supabase.from('complaints').select(`
        *,
        citizen:profiles!complaints_citizen_id_fkey(id, full_name, role, zone),
        assigned_collector:profiles!complaints_assigned_collector_id_fkey(id, full_name, role, zone)
      `);

      if (query === 'own') {
        dbQuery = dbQuery.eq('citizen_id', userId);
      } else if (query === 'assigned') {
        dbQuery = dbQuery.eq('assigned_collector_id', userId);
      }

      if (status && status !== 'all') {
        dbQuery = dbQuery.eq('status', status);
      }

      if (search) {
        dbQuery = dbQuery.or(`description.ilike.%${search}%,complaint_code.ilike.%${search}%,address.ilike.%${search}%`);
      }

      dbQuery = dbQuery.order('created_at', { ascending: false });
      if (limit) dbQuery = dbQuery.limit(limit);

      // 600ms timeout race to handle unreachable Supabase domain
      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Network timeout') }), 600)
      );

      const { data, error: err } = await Promise.race([dbQuery, timeoutPromise]);
      if (err || !data || data.length === 0) throw err || new Error('Fallback to local store');
      setComplaints((data as Complaint[]) || []);
    } catch {
      // Fallback to local stored complaints from dataStore (which contains new citizen reports)
      let list = getLocalComplaints();

      if (query === 'own') {
        list = list.filter(
          (c) =>
            c.citizen_id === userId ||
            userId.includes('citizen') ||
            c.citizen_id === 'demo_citizen_id'
        );
      } else if (query === 'assigned') {
        list = list.filter(
          (c) =>
            c.assigned_collector_id === userId ||
            (userId.includes('collector') && (c.assigned_collector_id === 'demo_collector_id' || c.status === 'Assigned' || c.status === 'In Progress'))
        );
      }

      if (status && status !== 'all') {
        const targetNorm = normalizeStatus(status);
        list = list.filter((c) => normalizeStatus(c.status) === targetNorm);
      }

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.description.toLowerCase().includes(s) ||
            c.complaint_code.toLowerCase().includes(s) ||
            (c.address && c.address.toLowerCase().includes(s)) ||
            (c.citizen?.full_name && c.citizen.full_name.toLowerCase().includes(s))
        );
      }

      if (limit) list = list.slice(0, limit);
      setComplaints(list);
    } finally {
      setLoading(false);
    }
  }, [query, userId, status, search, limit]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return { complaints, loading, error, refetch: fetchComplaints };
}
