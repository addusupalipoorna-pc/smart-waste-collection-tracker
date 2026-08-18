import type { ComplaintStatus, Urgency, WasteType, UserRole } from '@/types';

export const WASTE_TYPES: { value: WasteType; label: string; icon: string; color: string }[] = [
  { value: 'Plastic', label: 'Plastic Waste', icon: 'Plastic', color: '#2563eb' },
  { value: 'Organic', label: 'Organic / Food Waste', icon: 'Organic', color: '#16a34a' },
  { value: 'Electronic', label: 'Electronic Waste (E-waste)', icon: 'Electronic', color: '#9333ea' },
  { value: 'Hazardous', label: 'Hazardous Waste', icon: 'Hazardous', color: '#dc2626' },
  { value: 'Medical', label: 'Medical Waste', icon: 'Medical', color: '#db2777' },
  { value: 'Construction', label: 'Construction & Demolition', icon: 'Construction', color: '#d97706' },
  { value: 'Mixed', label: 'Mixed Waste', icon: 'Mixed', color: '#64748b' },
];

export const URGENCY_LEVELS: { value: Urgency; label: string; color: string }[] = [
  { value: 'Low', label: 'Low', color: '#16a34a' },
  { value: 'Medium', label: 'Medium', color: '#ca8a04' },
  { value: 'High', label: 'High', color: '#ea580c' },
  { value: 'Critical', label: 'Critical', color: '#dc2626' },
];

export const STATUS_FLOW: ComplaintStatus[] = ['Pending', 'Assigned', 'In Progress', 'Completed'];

export const STATUS_META: Record<ComplaintStatus, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Pending', color: '#ca8a04', bg: 'rgba(202, 138, 4, 0.12)' },
  Assigned: { label: 'Assigned', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
  'In Progress': { label: 'In Progress', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.12)' },
  Completed: { label: 'Completed', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  Rejected: { label: 'Rejected', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
};

export const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  citizen: { label: 'Citizen', color: '#16a34a' },
  collector: { label: 'Collector', color: '#0891b2' },
  admin: { label: 'Administrator', color: '#7c3aed' },
};

// Default map center — a representative village location (India, Madhya Pradesh region)
export const DEFAULT_MAP_CENTER: [number, number] = [22.9734, 78.6569];
export const DEFAULT_MAP_ZOOM = 13;

export const MAX_PHOTO_SIZE_MB = 2;
export const MAX_PHOTOS = 5;
export const COMPLAINTS_PER_PAGE = 10;
