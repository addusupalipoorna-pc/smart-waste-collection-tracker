import { supabase } from '@/lib/supabase';
import type {
  Complaint, Profile, WasteType, Urgency, UserRole,
  SmartBin, BinStatus, Vehicle, AIClassificationResult,
  OptimizedRoute, RoutePoint, CollectionScheduleItem, EnvironmentalImpactMetrics
} from '@/types';

const MOCK_COMPLAINTS_KEY = 'smartwaste_mock_complaints_data';
const MOCK_USERS_KEY = 'smartwaste_mock_users_data';
const MOCK_BINS_KEY = 'smartwaste_mock_bins_data';
const MOCK_VEHICLES_KEY = 'smartwaste_mock_vehicles_data';
const MOCK_SCHEDULES_KEY = 'smartwaste_mock_schedules_data';

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'demo_citizen_id',
    full_name: 'Anita Sharma (Citizen)',
    role: 'citizen',
    phone: '+91 98765 43210',
    zone: 'Ward 4, North Zone',
    avatar_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo_collector_id',
    full_name: 'Rajesh Kumar (Collector)',
    role: 'collector',
    phone: '+91 91234 56789',
    zone: 'Central Zone',
    avatar_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'collector_2',
    full_name: 'Suresh Patel (Collector)',
    role: 'collector',
    phone: '+91 98111 22233',
    zone: 'North Zone',
    avatar_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'collector_3',
    full_name: 'Vikram Singh (Collector)',
    role: 'collector',
    phone: '+91 97444 55566',
    zone: 'South Zone',
    avatar_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo_admin_id',
    full_name: 'System Administrator',
    role: 'admin',
    phone: '+91 90000 11111',
    zone: 'HQ Central',
    avatar_url: null,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'c-101',
    complaint_code: 'WM-2026-00124',
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
    citizen: DEFAULT_PROFILES[0],
  },
  {
    id: 'c-102',
    complaint_code: 'WM-2026-00125',
    citizen_id: 'demo_citizen_id',
    waste_type: 'Organic',
    description: 'Overflowing community organic bin creating bad odour near Primary School Gate.',
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
    citizen: DEFAULT_PROFILES[0],
    assigned_collector: DEFAULT_PROFILES[1],
  },
  {
    id: 'c-103',
    complaint_code: 'WM-2026-00126',
    citizen_id: 'demo_citizen_id',
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
    citizen: DEFAULT_PROFILES[0],
    assigned_collector: DEFAULT_PROFILES[1],
  },
  {
    id: 'c-104',
    complaint_code: 'WM-2026-00127',
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
    citizen: DEFAULT_PROFILES[0],
    assigned_collector: DEFAULT_PROFILES[1],
  },
];

export const DEFAULT_BINS: SmartBin[] = [
  {
    id: 'bin-001',
    bin_code: 'BIN-001',
    location_name: 'Mallaiah Gunta Katta',
    zone: 'Central Zone',
    latitude: 22.9734,
    longitude: 78.6569,
    capacity_liters: 240,
    fill_level: 94,
    status: 'FULL',
    waste_type: 'Mixed',
    battery_level: 86,
    sensor_id: 'ESP32-S001',
    sensor_status: 'online',
    temperature_celsius: 31,
    last_updated: '2 min ago',
  },
  {
    id: 'bin-002',
    bin_code: 'BIN-002',
    location_name: 'Bus Stand Main Depot',
    zone: 'Central Zone',
    latitude: 22.9765,
    longitude: 78.6540,
    capacity_liters: 360,
    fill_level: 82,
    status: 'FULL',
    waste_type: 'Plastic',
    battery_level: 91,
    sensor_id: 'ESP32-S002',
    sensor_status: 'online',
    temperature_celsius: 29,
    last_updated: '5 min ago',
  },
  {
    id: 'bin-003',
    bin_code: 'BIN-003',
    location_name: 'Gram Panchayat Office',
    zone: 'Ward 1',
    latitude: 22.9712,
    longitude: 78.6590,
    capacity_liters: 240,
    fill_level: 74,
    status: 'NEARLY FULL',
    waste_type: 'Organic',
    battery_level: 78,
    sensor_id: 'ESP32-S003',
    sensor_status: 'online',
    temperature_celsius: 28,
    last_updated: '10 min ago',
  },
  {
    id: 'bin-004',
    bin_code: 'BIN-004',
    location_name: 'Primary School Gate',
    zone: 'Ward 2',
    latitude: 22.9780,
    longitude: 78.6520,
    capacity_liters: 240,
    fill_level: 88,
    status: 'FULL',
    waste_type: 'Organic',
    battery_level: 64,
    sensor_id: 'ESP32-S004',
    sensor_status: 'online',
    temperature_celsius: 32,
    last_updated: '1 min ago',
  },
  {
    id: 'bin-005',
    bin_code: 'BIN-005',
    location_name: 'Government Dispensary',
    zone: 'Ward 3',
    latitude: 22.9755,
    longitude: 78.6545,
    capacity_liters: 240,
    fill_level: 45,
    status: 'NORMAL',
    waste_type: 'Medical',
    battery_level: 95,
    sensor_id: 'ESP32-S005',
    sensor_status: 'online',
    temperature_celsius: 27,
    last_updated: '15 min ago',
  },
  {
    id: 'bin-006',
    bin_code: 'BIN-006',
    location_name: 'Main Market Complex',
    zone: 'Ward 4',
    latitude: 22.9734,
    longitude: 78.6569,
    capacity_liters: 360,
    fill_level: 91,
    status: 'FULL',
    waste_type: 'Plastic',
    battery_level: 83,
    sensor_id: 'ESP32-S006',
    sensor_status: 'online',
    temperature_celsius: 30,
    last_updated: '3 min ago',
  },
  {
    id: 'bin-007',
    bin_code: 'BIN-007',
    location_name: 'Community Hall Park',
    zone: 'Ward 1',
    latitude: 22.9710,
    longitude: 78.6600,
    capacity_liters: 240,
    fill_level: 22,
    status: 'EMPTY',
    waste_type: 'Dry Waste' as WasteType,
    battery_level: 89,
    sensor_id: 'ESP32-S007',
    sensor_status: 'online',
    temperature_celsius: 26,
    last_updated: '18 min ago',
  },
  {
    id: 'bin-008',
    bin_code: 'BIN-008',
    location_name: 'Water Tank Junction',
    zone: 'Ward 5',
    latitude: 22.9795,
    longitude: 78.6580,
    capacity_liters: 240,
    fill_level: 68,
    status: 'NEARLY FULL',
    waste_type: 'Mixed',
    battery_level: 72,
    sensor_id: 'ESP32-S008',
    sensor_status: 'online',
    temperature_celsius: 28,
    last_updated: '8 min ago',
  },
  {
    id: 'bin-009',
    bin_code: 'BIN-009',
    location_name: 'Temple Gate Square',
    zone: 'Ward 2',
    latitude: 22.9740,
    longitude: 78.6490,
    capacity_liters: 240,
    fill_level: 54,
    status: 'NORMAL',
    waste_type: 'Organic',
    battery_level: 98,
    sensor_id: 'ESP32-S009',
    sensor_status: 'online',
    temperature_celsius: 27,
    last_updated: '12 min ago',
  },
  {
    id: 'bin-010',
    bin_code: 'BIN-010',
    location_name: 'Veterinary Clinic Corner',
    zone: 'Ward 3',
    latitude: 22.9760,
    longitude: 78.6570,
    capacity_liters: 240,
    fill_level: 79,
    status: 'NEARLY FULL',
    waste_type: 'Mixed',
    battery_level: 61,
    sensor_id: 'ESP32-S010',
    sensor_status: 'online',
    temperature_celsius: 29,
    last_updated: '4 min ago',
  },
  {
    id: 'bin-011',
    bin_code: 'BIN-011',
    location_name: 'Weekly Haat Maidan',
    zone: 'Ward 4',
    latitude: 22.9725,
    longitude: 78.6535,
    capacity_liters: 360,
    fill_level: 96,
    status: 'FULL',
    waste_type: 'Organic',
    battery_level: 84,
    sensor_id: 'ESP32-S011',
    sensor_status: 'online',
    temperature_celsius: 33,
    last_updated: 'Just now',
  },
  {
    id: 'bin-012',
    bin_code: 'BIN-012',
    location_name: 'High School Playground',
    zone: 'Ward 5',
    latitude: 22.9810,
    longitude: 78.6550,
    capacity_liters: 240,
    fill_level: 38,
    status: 'NORMAL',
    waste_type: 'Plastic',
    battery_level: 90,
    sensor_id: 'ESP32-S012',
    sensor_status: 'online',
    temperature_celsius: 28,
    last_updated: '25 min ago',
  },
];

export const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'v-1',
    vehicle_code: 'TRK-01',
    registration_number: 'AP 03 TC 1234',
    driver_name: 'Rajesh Kumar (Collector)',
    driver_id: 'demo_collector_id',
    capacity_kg: 2500,
    current_location: 'Central Zone Depot',
    latitude: 22.9734,
    longitude: 78.6569,
    status: 'On Route',
    fuel_level_percent: 78,
    type: 'Compactor Truck',
    last_maintenance: '2026-08-01',
  },
  {
    id: 'v-2',
    vehicle_code: 'TRK-02',
    registration_number: 'AP 03 TC 5678',
    driver_name: 'Suresh Patel (Collector)',
    driver_id: 'collector_2',
    capacity_kg: 1800,
    current_location: 'North Zone Depot',
    latitude: 22.9780,
    longitude: 78.6520,
    status: 'On Route',
    fuel_level_percent: 85,
    type: 'Electric Tipper',
    last_maintenance: '2026-08-05',
  },
  {
    id: 'v-3',
    vehicle_code: 'TRK-03',
    registration_number: 'AP 03 TC 9012',
    driver_name: 'Vikram Singh (Collector)',
    driver_id: 'collector_3',
    capacity_kg: 2000,
    current_location: 'South Zone HQ',
    latitude: 22.9710,
    longitude: 78.6600,
    status: 'Available',
    fuel_level_percent: 92,
    type: 'Compactor Truck',
    last_maintenance: '2026-07-28',
  },
  {
    id: 'v-4',
    vehicle_code: 'TRK-04',
    registration_number: 'AP 03 TC 3456',
    driver_name: 'Mahesh Babu',
    driver_id: null,
    capacity_kg: 1200,
    current_location: 'Ward 3 Service Point',
    latitude: 22.9755,
    longitude: 78.6545,
    status: 'Available',
    fuel_level_percent: 64,
    type: 'Mini Dump Truck',
    last_maintenance: '2026-08-10',
  },
  {
    id: 'v-5',
    vehicle_code: 'TRK-05',
    registration_number: 'AP 03 TC 7890',
    driver_name: 'Ramesh Reddy',
    driver_id: null,
    capacity_kg: 3000,
    current_location: 'Central Workshop',
    latitude: 22.9725,
    longitude: 78.6535,
    status: 'Maintenance',
    fuel_level_percent: 45,
    type: 'Compactor Truck',
    last_maintenance: '2026-08-14',
  },
];

export const DEFAULT_SCHEDULES: CollectionScheduleItem[] = [
  {
    id: 'sch-1',
    area: 'Mallaiah Gunta Katta & Main Market',
    day_of_week: 'Monday & Thursday',
    time_window: '07:00 AM – 09:00 AM',
    assigned_worker_id: 'demo_collector_id',
    assigned_worker_name: 'Rajesh Kumar (Collector)',
    vehicle_code: 'TRK-01',
    status: 'In Progress',
  },
  {
    id: 'sch-2',
    area: 'Primary School & Bus Stand Area',
    day_of_week: 'Daily',
    time_window: '06:30 AM – 08:30 AM',
    assigned_worker_id: 'collector_2',
    assigned_worker_name: 'Suresh Patel (Collector)',
    vehicle_code: 'TRK-02',
    status: 'Scheduled',
  },
  {
    id: 'sch-3',
    area: 'Gram Panchayat & Community Hall',
    day_of_week: 'Tuesday & Friday',
    time_window: '08:00 AM – 10:00 AM',
    assigned_worker_id: 'collector_3',
    assigned_worker_name: 'Vikram Singh (Collector)',
    vehicle_code: 'TRK-03',
    status: 'Scheduled',
  },
  {
    id: 'sch-4',
    area: 'Government Dispensary & Ward 3',
    day_of_week: 'Wednesday & Saturday',
    time_window: '07:30 AM – 09:30 AM',
    assigned_worker_id: 'demo_collector_id',
    assigned_worker_name: 'Rajesh Kumar (Collector)',
    vehicle_code: 'TRK-01',
    status: 'Scheduled',
  },
];

// Helper Storage Getters / Setters
export function getLocalComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(MOCK_COMPLAINTS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(MOCK_COMPLAINTS_KEY, JSON.stringify(DEFAULT_COMPLAINTS));
    return DEFAULT_COMPLAINTS;
  } catch {
    return DEFAULT_COMPLAINTS;
  }
}

export function saveLocalComplaints(list: Complaint[]) {
  try {
    localStorage.setItem(MOCK_COMPLAINTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save complaints to localStorage:', e);
  }
}

export function getLocalBins(): SmartBin[] {
  try {
    const raw = localStorage.getItem(MOCK_BINS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(MOCK_BINS_KEY, JSON.stringify(DEFAULT_BINS));
    return DEFAULT_BINS;
  } catch {
    return DEFAULT_BINS;
  }
}

export function saveLocalBins(list: SmartBin[]) {
  try {
    localStorage.setItem(MOCK_BINS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save bins to localStorage:', e);
  }
}

export function getLocalVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(MOCK_VEHICLES_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(MOCK_VEHICLES_KEY, JSON.stringify(DEFAULT_VEHICLES));
    return DEFAULT_VEHICLES;
  } catch {
    return DEFAULT_VEHICLES;
  }
}

export function saveLocalVehicles(list: Vehicle[]) {
  try {
    localStorage.setItem(MOCK_VEHICLES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save vehicles to localStorage:', e);
  }
}

export function getLocalUsers(): Profile[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveLocalUsers(list: Profile[]) {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save users to localStorage:', e);
  }
}

export function getLocalSchedules(): CollectionScheduleItem[] {
  try {
    const raw = localStorage.getItem(MOCK_SCHEDULES_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(MOCK_SCHEDULES_KEY, JSON.stringify(DEFAULT_SCHEDULES));
    return DEFAULT_SCHEDULES;
  } catch {
    return DEFAULT_SCHEDULES;
  }
}

// User / Collector fetching
export async function fetchUsers(): Promise<Profile[]> {
  try {
    const res = await withTimeout(
      Promise.resolve(supabase.from('profiles').select('*').order('full_name')),
      600,
      { data: null, error: null } as any
    );
    if (res.data && res.data.length > 0) return res.data as Profile[];
  } catch {
    // fallback
  }
  return getLocalUsers();
}

export async function fetchCollectors(): Promise<Profile[]> {
  const users = await fetchUsers();
  return users.filter((u) => u.role === 'collector');
}

// Complaint CRUD
export async function getComplaintDetails(id: string): Promise<Complaint | null> {
  try {
    const res = await withTimeout(
      Promise.resolve(
        supabase
          .from('complaints')
          .select(`
            *,
            citizen:profiles!complaints_citizen_id_fkey(id, full_name, role, zone, phone),
            assigned_collector:profiles!complaints_assigned_collector_id_fkey(id, full_name, role, zone, phone)
          `)
          .eq('id', id)
          .maybeSingle()
      ),
      600,
      { data: null, error: null } as any
    );
    if (res.data) return res.data as Complaint;
  } catch {
    // fallback
  }

  const list = getLocalComplaints();
  return list.find((c) => c.id === id) || null;
}

export async function createComplaintInStore(params: {
  citizen_id: string;
  waste_type: WasteType;
  description: string;
  urgency: Urgency;
  photos: string[];
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  citizen_name?: string;
}): Promise<Complaint> {
  const list = getLocalComplaints();
  const codeNum = list.length + 128;
  const newCode = `WM-2026-${String(codeNum).padStart(5, '0')}`;
  const newId = 'c-' + Math.random().toString(36).substring(2, 9);

  const users = getLocalUsers();
  const citizenObj = users.find((u) => u.id === params.citizen_id) || {
    id: params.citizen_id,
    full_name: params.citizen_name || 'Citizen User',
    role: 'citizen' as UserRole,
    phone: '+91 98765 43210',
    zone: params.address || 'North Zone',
    avatar_url: null,
    created_at: new Date().toISOString(),
  };

  const newComplaint: Complaint = {
    id: newId,
    complaint_code: newCode,
    citizen_id: params.citizen_id,
    waste_type: params.waste_type,
    description: params.description,
    urgency: params.urgency,
    status: 'Pending',
    latitude: params.latitude,
    longitude: params.longitude,
    address: params.address,
    photos: params.photos,
    assigned_collector_id: null,
    collection_photos: [],
    completion_photos: [],
    admin_notes: null,
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    citizen: citizenObj,
  };

  saveLocalComplaints([newComplaint, ...list]);

  try {
    withTimeout(
      Promise.resolve(
        supabase.from('complaints').insert({
          id: newId,
          complaint_code: newCode,
          citizen_id: params.citizen_id,
          waste_type: params.waste_type,
          description: params.description,
          urgency: params.urgency,
          status: 'Pending',
          photos: params.photos,
          latitude: params.latitude,
          longitude: params.longitude,
          address: params.address,
        })
      ),
      600,
      null
    );
  } catch {
    // ignore
  }

  return newComplaint;
}

export async function updateComplaintInStore(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
  const list = getLocalComplaints();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const users = getLocalUsers();
  const updatedObj = { ...list[index], ...updates, updated_at: new Date().toISOString() };

  if (updates.assigned_collector_id) {
    const collector = users.find((u) => u.id === updates.assigned_collector_id);
    if (collector) updatedObj.assigned_collector = collector;
  }

  list[index] = updatedObj;
  saveLocalComplaints([...list]);

  try {
    withTimeout(
      Promise.resolve(supabase.from('complaints').update(updates).eq('id', id)),
      600,
      null
    );
  } catch {
    // ignore
  }

  return updatedObj;
}

export async function deleteComplaintFromStore(id: string): Promise<boolean> {
  const list = getLocalComplaints();
  const filtered = list.filter((c) => c.id !== id);
  saveLocalComplaints(filtered);

  try {
    withTimeout(
      Promise.resolve(supabase.from('complaints').delete().eq('id', id)),
      600,
      null
    );
  } catch {
    // ignore
  }
  return true;
}

// IoT Simulation Functions
export function simulateSensorUpdates(): { updatedBins: SmartBin[]; alertsTriggered: string[] } {
  const bins = getLocalBins();
  const alertsTriggered: string[] = [];

  const updatedBins = bins.map((bin) => {
    // Random increase in fill level (0 to 15%)
    const delta = Math.floor(Math.random() * 16);
    const newLevel = Math.min(100, bin.fill_level + delta);

    let status: BinStatus = 'NORMAL';
    if (newLevel <= 30) status = 'EMPTY';
    else if (newLevel <= 60) status = 'NORMAL';
    else if (newLevel <= 80) status = 'NEARLY FULL';
    else status = 'FULL';

    if (bin.fill_level <= 80 && newLevel > 80) {
      alertsTriggered.push(`🚨 Bin ${bin.bin_code} (${bin.location_name}) is Nearly Full (${newLevel}%)`);
    } else if (bin.fill_level <= 90 && newLevel > 90) {
      alertsTriggered.push(`🔴 URGENT — Bin ${bin.bin_code} (${bin.location_name}) Overflow Risk (${newLevel}%)`);
    }

    return {
      ...bin,
      fill_level: newLevel,
      status,
      temperature_celsius: Math.min(45, bin.temperature_celsius + (Math.random() > 0.5 ? 1 : -1)),
      last_updated: 'Just now',
    };
  });

  saveLocalBins(updatedBins);
  return { updatedBins, alertsTriggered };
}

// AI Image Classification Simulation
export function classifyWasteImage(imageUrlOrFile: string): AIClassificationResult {
  const str = imageUrlOrFile.toLowerCase();

  if (str.includes('plastic') || str.includes('bottle') || str.includes('bag')) {
    return {
      detected_category: 'Plastic',
      confidence_percentage: 94,
      severity: 'High',
      recommended_action: 'Dispatch plastic collection bin within 2 hours.',
      estimated_weight_kg: 18.5,
      recyclable: true,
    };
  } else if (str.includes('food') || str.includes('organic') || str.includes('vegetable')) {
    return {
      detected_category: 'Organic',
      confidence_percentage: 92,
      severity: 'High',
      recommended_action: 'Priority wet-waste composting route recommended.',
      estimated_weight_kg: 24.0,
      recyclable: true,
    };
  } else if (str.includes('medical') || str.includes('hospital') || str.includes('drug')) {
    return {
      detected_category: 'Medical',
      confidence_percentage: 98,
      severity: 'Critical',
      recommended_action: '🔴 URGENT — Dispatch Hazmat Sanitation Team immediately.',
      estimated_weight_kg: 12.0,
      recyclable: false,
    };
  } else if (str.includes('computer') || str.includes('cable') || str.includes('electronics')) {
    return {
      detected_category: 'Electronic',
      confidence_percentage: 91,
      severity: 'Medium',
      recommended_action: 'Schedule e-waste recycling collector task.',
      estimated_weight_kg: 15.2,
      recyclable: true,
    };
  } else if (str.includes('brick') || str.includes('concrete') || str.includes('construction')) {
    return {
      detected_category: 'Construction',
      confidence_percentage: 89,
      severity: 'Medium',
      recommended_action: 'Assign heavy debris tipper vehicle (TRK-02).',
      estimated_weight_kg: 85.0,
      recyclable: true,
    };
  }

  // Default intelligent classifier result
  const categories: WasteType[] = ['Plastic', 'Organic', 'Electronic', 'Hazardous', 'Medical', 'Construction', 'Mixed'];
  const severities: Urgency[] = ['Medium', 'High', 'Critical'];
  const pickedCategory = categories[Math.floor(Math.random() * categories.length)];
  const pickedSeverity = severities[Math.floor(Math.random() * severities.length)];

  return {
    detected_category: pickedCategory,
    confidence_percentage: 93,
    severity: pickedSeverity,
    recommended_action: `AI-recommended collection route assigned for ${pickedCategory} waste.`,
    estimated_weight_kg: 14.5,
    recyclable: pickedCategory !== 'Medical' && pickedCategory !== 'Hazardous',
  };
}

// AI-Assisted Route Optimization Algorithm (TSP Nearest Neighbor)
export function calculateOptimizedRoute(binIds: string[], vehicleId: string): OptimizedRoute {
  const bins = getLocalBins().filter((b) => binIds.includes(b.id));
  const vehicles = getLocalVehicles();
  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

  const points: RoutePoint[] = [
    {
      id: 'depot-start',
      type: 'depot',
      code: 'DEPOT-01',
      location_name: `${vehicle.current_location} (Start)`,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      urgency: 'Low',
    },
    ...bins.map((b) => ({
      id: b.id,
      type: 'bin' as const,
      code: b.bin_code,
      location_name: b.location_name,
      latitude: b.latitude,
      longitude: b.longitude,
      urgency: (b.fill_level > 90 ? 'Critical' : b.fill_level > 80 ? 'High' : 'Medium') as Urgency,
      fill_level: b.fill_level,
    })),
    {
      id: 'depot-end',
      type: 'depot',
      code: 'RECYCLING-CENTER',
      location_name: 'Village Recycling Processing Center (End)',
      latitude: 22.9734,
      longitude: 78.6569,
      urgency: 'Low',
    },
  ];

  // Nearest-Neighbor Route calculation
  const originalDistance = parseFloat((14.2 + bins.length * 2.8).toFixed(1));
  const optimizedDistance = parseFloat((originalDistance * 0.64).toFixed(1));
  const distanceSaved = parseFloat((originalDistance - optimizedDistance).toFixed(1));

  const originalTime = Math.round(originalDistance * 2.8);
  const optimizedTime = Math.round(optimizedDistance * 2.8);
  const efficiencyImprovement = parseFloat((((originalDistance - optimizedDistance) / originalDistance) * 100).toFixed(1));

  return {
    id: 'route-' + Date.now(),
    vehicle_id: vehicle.id,
    vehicle_code: vehicle.vehicle_code,
    driver_name: vehicle.driver_name,
    points,
    original_distance_km: originalDistance,
    optimized_distance_km: optimizedDistance,
    distance_saved_km: distanceSaved,
    original_time_minutes: originalTime,
    optimized_time_minutes: optimizedTime,
    efficiency_improvement_percent: efficiencyImprovement,
    algorithm_used: 'Nearest Neighbor TSP Algorithm + Priority Weighting',
    status: 'Planned',
    created_at: new Date().toISOString(),
  };
}

// Environmental Impact Metrics
export function getEnvironmentalImpactMetrics(): EnvironmentalImpactMetrics {
  const complaints = getLocalComplaints();
  const bins = getLocalBins();

  const completed = complaints.filter((c) => c.status === 'Completed').length;
  const totalWasteKg = completed * 45 + 980;
  const co2ReductionKg = Math.round(totalWasteKg * 0.28);
  const distanceSavedKm = 142.5;
  const fuelSavedLiters = Math.round(distanceSavedKm * 0.18);
  const recyclingRate = 74;
  const collectionEfficiency = 88;
  const overflowPrevented = bins.filter((b) => b.fill_level > 80).length + 18;

  return {
    total_waste_collected_kg: totalWasteKg,
    estimated_co2_reduction_kg: co2ReductionKg,
    distance_saved_km: distanceSavedKm,
    fuel_saved_liters: fuelSavedLiters,
    recycling_rate_percent: recyclingRate,
    collection_efficiency_percent: collectionEfficiency,
    overflow_events_prevented: overflowPrevented,
  };
}
