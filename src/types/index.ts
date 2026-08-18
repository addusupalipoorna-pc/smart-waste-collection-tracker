export type UserRole = 'citizen' | 'collector' | 'admin';

export type WasteType =
  | 'Plastic'
  | 'Organic'
  | 'Electronic'
  | 'Hazardous'
  | 'Medical'
  | 'Construction'
  | 'Mixed';

export type Urgency = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';

export type NotificationType =
  | 'info'
  | 'assignment'
  | 'status'
  | 'completion'
  | 'system';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  zone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  citizen_id: string;
  waste_type: WasteType;
  description: string;
  urgency: Urgency;
  status: ComplaintStatus;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  photos: string[];
  assigned_collector_id: string | null;
  collection_photos: string[];
  completion_photos: string[];
  admin_notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional — present when selected)
  citizen?: Profile;
  assigned_collector?: Profile | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_complaint_id: string | null;
  read: boolean;
  created_at: string;
}

export interface ComplaintWithRelations extends Complaint {
  citizen?: Profile;
  assigned_collector?: Profile | null;
}

export type BinStatus = 'EMPTY' | 'NORMAL' | 'NEARLY FULL' | 'FULL';

export interface SmartBin {
  id: string;
  bin_code: string;
  location_name: string;
  zone: string;
  latitude: number;
  longitude: number;
  capacity_liters: number;
  fill_level: number; // percentage 0 - 100
  status: BinStatus;
  waste_type: WasteType;
  battery_level: number; // percentage 0 - 100
  sensor_id: string;
  sensor_status: 'online' | 'offline' | 'maintenance';
  temperature_celsius: number;
  last_updated: string;
}

export type VehicleStatus = 'Available' | 'On Route' | 'Maintenance' | 'Offline';

export interface Vehicle {
  id: string;
  vehicle_code: string;
  registration_number: string;
  driver_name: string;
  driver_id: string | null;
  capacity_kg: number;
  current_location: string;
  latitude: number;
  longitude: number;
  status: VehicleStatus;
  fuel_level_percent: number;
  type: 'Compactor Truck' | 'Electric Tipper' | 'Mini Dump Truck';
  last_maintenance: string;
}

export interface AIClassificationResult {
  detected_category: WasteType;
  confidence_percentage: number;
  severity: Urgency;
  recommended_action: string;
  estimated_weight_kg: number;
  recyclable: boolean;
}

export interface RoutePoint {
  id: string;
  type: 'bin' | 'complaint' | 'depot';
  code: string;
  location_name: string;
  latitude: number;
  longitude: number;
  urgency: Urgency;
  fill_level?: number;
}

export interface OptimizedRoute {
  id: string;
  vehicle_id: string;
  vehicle_code: string;
  driver_name: string;
  points: RoutePoint[];
  original_distance_km: number;
  optimized_distance_km: number;
  distance_saved_km: number;
  original_time_minutes: number;
  optimized_time_minutes: number;
  efficiency_improvement_percent: number;
  algorithm_used: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  created_at: string;
}

export interface CollectionScheduleItem {
  id: string;
  area: string;
  day_of_week: string;
  time_window: string;
  assigned_worker_id: string;
  assigned_worker_name: string;
  vehicle_code: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface EnvironmentalImpactMetrics {
  total_waste_collected_kg: number;
  estimated_co2_reduction_kg: number;
  distance_saved_km: number;
  fuel_saved_liters: number;
  recycling_rate_percent: number;
  collection_efficiency_percent: number;
  overflow_events_prevented: number;
}

