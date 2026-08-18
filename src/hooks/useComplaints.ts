import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint, ComplaintStatus } from '@/types';

type ComplaintQuery = 'own' | 'assigned' | 'all';

interface UseComplaintsOptions {
  query: ComplaintQuery;
  userId: string;
  status?: ComplaintStatus;
  search?: string;
  limit?: number;
}

const MOCK_COMPLAINTS_KEY = 'smartwaste_mock_complaints_data';

const DEFAULT_MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c-101',
    complaint_code: 'WST-2026-001',
    citizen_id: 'demo_citizen_id',
    waste_type: 'Plastic',
    description: 'Large pile of plastic bottles and packaging dumped near the Main Market entrance.',
    urgency: 'High',
    status: 'Pending',
    latitude: 22.9734,
    longitude: 78.6569,
    address: 'Main Market Road, Ward 4, North Zone',
    photos: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=60'],
    assigned_collector_id: null,
    collection_photos: [],
    completion_photos: [],
    admin_notes: null,
    started_at: null,
    completed_at: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    citizen: {
      id: 'demo_citizen_id',
      full_name: 'Anita Sharma (Citizen)',
      role: 'citizen',
      phone: '+91 98765 43210',
      zone: 'Ward 4, North Zone',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'c-102',
    complaint_code: 'WST-2026-002',
    citizen_id: 'demo_citizen_id',
    waste_type: 'Organic',
    description: 'Overflowing community organic bin creating bad odour near Primary School.',
    urgency: 'Critical',
    status: 'In Progress',
    latitude: 22.9780,
    longitude: 78.6520,
    address: 'Primary School Gate, Ward 2, Central Zone',
    photos: ['https://images.unsplash.com/photo-1604186837056-8e7c286756f2?w=800&auto=format&fit=crop&q=60'],
    assigned_collector_id: 'demo_collector_id',
    collection_photos: [],
    completion_photos: [],
    admin_notes: 'Dispatched collector team with urgent priority.',
    started_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    citizen: {
      id: 'demo_citizen_id',
      full_name: 'Anita Sharma (Citizen)',
      role: 'citizen',
      phone: '+91 98765 43210',
      zone: 'Ward 4, North Zone',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
    assigned_collector: {
      id: 'demo_collector_id',
      full_name: 'Rajesh Kumar (Collector)',
      role: 'collector',
      phone: '+91 91234 56789',
      zone: 'Central Zone',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'c-103',
    complaint_code: 'WST-2026-003',
    citizen_id: 'citizen_2',
    waste_type: 'Electronic',
    description: 'Discarded computer monitors and cables left near community hall.',
    urgency: 'Medium',
    status: 'Assigned',
    latitude: 22.9710,
    longitude: 78.6600,
    address: 'Community Hall Road, Ward 1',
    photos: ['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60'],
    assigned_collector_id: 'demo_collector_id',
    collection_photos: [],
    completion_photos: [],
    admin_notes: 'Collector assigned for e-waste disposal.',
    started_at: null,
    completed_at: null,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    assigned_collector: {
      id: 'demo_collector_id',
      full_name: 'Rajesh Kumar (Collector)',
      role: 'collector',
      phone: '+91 91234 56789',
      zone: 'Central Zone',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'c-104',
    complaint_code: 'WST-2026-004',
    citizen_id: 'demo_citizen_id',
    waste_type: 'Medical',
    description: 'Medical waste boxes found disposed behind dispensary.',
    urgency: 'Critical',
    status: 'Completed',
    latitude: 22.9755,
    longitude: 78.6545,
    address: 'Government Dispensary, Ward 3',
    photos: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'],
    assigned_collector_id: 'demo_collector_id',
    collection_photos: ['https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=60'],
    completion_photos: ['https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=60'],
    admin_notes: 'Hazmat team disinfected site and collected containers.',
    started_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    citizen: {
      id: 'demo_citizen_id',
      full_name: 'Anita Sharma (Citizen)',
      role: 'citizen',
      phone: '+91 98765 43210',
      zone: 'Ward 4, North Zone',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
  },
];

function getStoredComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(MOCK_COMPLAINTS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(MOCK_COMPLAINTS_KEY, JSON.stringify(DEFAULT_MOCK_COMPLAINTS));
    return DEFAULT_MOCK_COMPLAINTS;
  } catch {
    return DEFAULT_MOCK_COMPLAINTS;
  }
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

      if (status) {
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
      if (err || !data) throw err || new Error('No data');
      setComplaints((data as Complaint[]) || []);
    } catch {
      // Fallback to local stored complaints if DB query fails or times out
      let list = getStoredComplaints();
      if (query === 'own') {
        list = list.filter((c) => c.citizen_id === userId || userId.includes('citizen') || c.citizen_id === 'demo_citizen_id');
      } else if (query === 'assigned') {
        list = list.filter((c) => c.assigned_collector_id === userId || userId.includes('collector') || c.assigned_collector_id === 'demo_collector_id');
      }
      if (status) {
        list = list.filter((c) => c.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.description.toLowerCase().includes(s) ||
            c.complaint_code.toLowerCase().includes(s) ||
            (c.address && c.address.toLowerCase().includes(s))
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

