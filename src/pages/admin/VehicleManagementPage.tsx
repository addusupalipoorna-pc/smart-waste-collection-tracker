import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Fuel, Wrench, ShieldCheck, UserCheck, Plus, Search, X } from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';
import { StatCard, EmptyState } from '@/components/ui';
import { getLocalVehicles, saveLocalVehicles, fetchCollectors } from '@/lib/dataStore';
import type { Vehicle, VehicleStatus } from '@/types';

export function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getLocalVehicles());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    vehicle_code: '',
    registration_number: '',
    driver_name: '',
    capacity_kg: 2000,
    current_location: 'Central Depot',
    type: 'Compactor Truck' as Vehicle['type'],
  });

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.vehicle_code.toLowerCase().includes(q) ||
        v.registration_number.toLowerCase().includes(q) ||
        v.driver_name.toLowerCase().includes(q) ||
        v.current_location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: vehicles.length,
    onRoute: vehicles.filter((v) => v.status === 'On Route').length,
    available: vehicles.filter((v) => v.status === 'Available').length,
    maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
  };

  const handleStatusChange = (id: string, newStatus: VehicleStatus) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, status: newStatus } : v));
    setVehicles(updated);
    saveLocalVehicles(updated);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vehicle_code.trim()) return;

    const created: Vehicle = {
      id: 'v-' + Math.random().toString(36).substring(2, 7),
      vehicle_code: newVehicle.vehicle_code.trim(),
      registration_number: newVehicle.registration_number.trim() || 'AP 03 TC ' + Math.floor(1000 + Math.random() * 9000),
      driver_name: newVehicle.driver_name.trim() || 'Unassigned Driver',
      driver_id: null,
      capacity_kg: Number(newVehicle.capacity_kg),
      current_location: newVehicle.current_location.trim(),
      latitude: 22.9734 + (Math.random() - 0.5) * 0.02,
      longitude: 78.6569 + (Math.random() - 0.5) * 0.02,
      status: 'Available',
      fuel_level_percent: 95,
      type: newVehicle.type,
      last_maintenance: new Date().toISOString().split('T')[0],
    };

    const updated = [created, ...vehicles];
    setVehicles(updated);
    saveLocalVehicles(updated);
    setShowAddModal(false);
    setNewVehicle({ vehicle_code: '', registration_number: '', driver_name: '', capacity_kg: 2000, current_location: 'Central Depot', type: 'Compactor Truck' });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Sanitation Vehicle Fleet"
        subtitle="Real-time status tracking for village garbage compactor trucks, tippers, and drivers."
        action={
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
            <Plus className="h-3.5 w-3.5" /> Register Vehicle
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Fleet" value={stats.total} icon={<Truck className="h-5 w-5" />} color="#166534" />
        <StatCard label="On Route" value={stats.onRoute} icon={<UserCheck className="h-5 w-5" />} color="#0f766e" />
        <StatCard label="Available" value={stats.available} icon={<ShieldCheck className="h-5 w-5" />} color="#2563eb" />
        <StatCard label="Maintenance" value={stats.maintenance} icon={<Wrench className="h-5 w-5" />} color="#d97706" />
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-10 text-xs sm:text-sm"
            placeholder="Search by Vehicle Code, Reg Number, Driver Name or Location..."
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
          {(['all', 'Available', 'On Route', 'Maintenance', 'Offline'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-8 w-8" />}
          title="No vehicles match filter"
          message="Try adjusting your search criteria or status filter."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v, i) => {
            const isAvailable = v.status === 'Available';
            const isOnRoute = v.status === 'On Route';
            const statusBg = isOnRoute ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isAvailable ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="card p-4 space-y-3 border-slate-200/80 bg-white hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{v.vehicle_code}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBg}`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{v.registration_number}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {v.type}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span className="font-bold text-slate-700">Driver:</span> {v.driver_name}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-700">Location:</span> {v.current_location}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-amber-500" /> Fuel Level
                    </span>
                    <span className="text-slate-800">{v.fuel_level_percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: `${v.fuel_level_percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Capacity: {v.capacity_kg} kg</span>
                  <select
                    className="text-[11px] font-bold border rounded-lg px-2 py-1 bg-slate-50 border-slate-200 text-slate-700"
                    value={v.status}
                    onChange={(e) => handleStatusChange(v.id, e.target.value as VehicleStatus)}
                  >
                    <option value="Available">Available</option>
                    <option value="On Route">On Route</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900">Register Collection Vehicle</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="label">Vehicle Code</label>
                <input required className="input text-xs" placeholder="e.g. TRK-06" value={newVehicle.vehicle_code} onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_code: e.target.value })} />
              </div>
              <div>
                <label className="label">Registration Number</label>
                <input required className="input text-xs" placeholder="e.g. AP 03 TC 9999" value={newVehicle.registration_number} onChange={(e) => setNewVehicle({ ...newVehicle, registration_number: e.target.value })} />
              </div>
              <div>
                <label className="label">Assigned Driver Full Name</label>
                <input required className="input text-xs" placeholder="Driver name" value={newVehicle.driver_name} onChange={(e) => setNewVehicle({ ...newVehicle, driver_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Vehicle Type</label>
                <select className="input text-xs" value={newVehicle.type} onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as any })}>
                  <option value="Compactor Truck">Compactor Truck</option>
                  <option value="Electric Tipper">Electric Tipper</option>
                  <option value="Mini Dump Truck">Mini Dump Truck</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
                <button type="submit" className="btn-primary text-xs px-4 py-2">Save Vehicle</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
