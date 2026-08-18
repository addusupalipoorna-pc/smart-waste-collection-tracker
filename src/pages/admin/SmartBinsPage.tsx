import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2, RefreshCw, Cpu, Battery, AlertTriangle,
  Search, Filter, Plus, MapPin, Thermometer, Radio, CheckCircle2
} from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';
import { StatCard, EmptyState } from '@/components/ui';
import { getLocalBins, simulateSensorUpdates, saveLocalBins } from '@/lib/dataStore';
import type { SmartBin, BinStatus, WasteType } from '@/types';
import { WASTE_TYPES } from '@/lib/constants';

export function SmartBinsPage() {
  const [bins, setBins] = useState<SmartBin[]>(() => getLocalBins());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BinStatus | 'all'>('all');
  const [simulating, setSimulating] = useState(false);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newBin, setNewBin] = useState({
    location_name: '',
    zone: 'Central Zone',
    capacity_liters: 240,
    waste_type: 'Plastic' as WasteType,
  });

  const filteredBins = useMemo(() => {
    return bins.filter((bin) => {
      if (statusFilter !== 'all' && bin.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          bin.bin_code.toLowerCase().includes(q) ||
          bin.location_name.toLowerCase().includes(q) ||
          bin.zone.toLowerCase().includes(q) ||
          bin.sensor_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bins, search, statusFilter]);

  const stats = useMemo(() => {
    const total = bins.length;
    const full = bins.filter((b) => b.status === 'FULL').length;
    const nearlyFull = bins.filter((b) => b.status === 'NEARLY FULL').length;
    const normal = bins.filter((b) => b.status === 'NORMAL' || b.status === 'EMPTY').length;
    const avgFill = Math.round(bins.reduce((acc, b) => acc + b.fill_level, 0) / (total || 1));
    return { total, full, nearlyFull, normal, avgFill };
  }, [bins]);

  const handleSimulateUpdate = () => {
    setSimulating(true);
    setTimeout(() => {
      const { updatedBins, alertsTriggered } = simulateSensorUpdates();
      setBins(updatedBins);
      if (alertsTriggered.length > 0) {
        setAlertMessages(alertsTriggered);
      } else {
        setAlertMessages(['✅ Simulated IoT telemetry update complete. Sensor fill metrics refreshed.']);
      }
      setSimulating(false);
    }, 500);
  };

  const handleAddBinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBin.location_name.trim()) return;

    const newId = `bin-${String(bins.length + 1).padStart(3, '0')}`;
    const newCode = `BIN-${String(bins.length + 1).padStart(3, '0')}`;
    const sensorCode = `ESP32-S${String(bins.length + 1).padStart(3, '0')}`;

    const created: SmartBin = {
      id: newId,
      bin_code: newCode,
      location_name: newBin.location_name.trim(),
      zone: newBin.zone,
      latitude: 22.9734 + (Math.random() - 0.5) * 0.02,
      longitude: 78.6569 + (Math.random() - 0.5) * 0.02,
      capacity_liters: Number(newBin.capacity_liters),
      fill_level: 20,
      status: 'NORMAL',
      waste_type: newBin.waste_type,
      battery_level: 100,
      sensor_id: sensorCode,
      sensor_status: 'online',
      temperature_celsius: 27,
      last_updated: 'Just now',
    };

    const updatedList = [created, ...bins];
    setBins(updatedList);
    saveLocalBins(updatedList);
    setShowAddModal(false);
    setNewBin({ location_name: '', zone: 'Central Zone', capacity_liters: 240, waste_type: 'Plastic' });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Smart Bin IoT Telemetry"
        subtitle="Ultrasonic Sensor Live Fill-Level Monitoring & Automatic Overflow Alerts"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateUpdate}
              disabled={simulating}
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-2 shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${simulating ? 'animate-spin' : ''}`} />
              Simulate Sensor Update
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Bin
            </button>
          </div>
        }
      />

      {/* Demo Telemetry Badge */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-700 animate-pulse" />
          <span>
            <strong>ESP32 IoT Network Status:</strong> 24 Connected Nodes • 433MHz LoRa / MQTT Telemetry Simulator Active
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
          Demo Telemetry
        </span>
      </div>

      {/* Telemetry Alert Box */}
      {alertMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-50 border border-amber-200"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">IoT Sensor Telemetry Updates</h4>
          </div>
          <div className="space-y-1">
            {alertMessages.map((msg, i) => (
              <p key={i} className="text-xs text-amber-800 font-medium">
                {msg}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Bins" value={stats.total} icon={<Trash2 className="h-5 w-5" />} color="#166534" />
        <StatCard label="Full (>=80%)" value={stats.full} icon={<AlertTriangle className="h-5 w-5" />} color="#dc2626" />
        <StatCard label="Nearly Full (60-79%)" value={stats.nearlyFull} icon={<RefreshCw className="h-5 w-5" />} color="#d97706" />
        <StatCard label="Average Fill" value={`${stats.avgFill}%`} icon={<Cpu className="h-5 w-5" />} color="#0f766e" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-10 text-xs sm:text-sm"
            placeholder="Search by Bin Code, Location, Ward, or Sensor ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
          {(['all', 'EMPTY', 'NORMAL', 'NEARLY FULL', 'FULL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
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

      {/* Bins Grid */}
      {filteredBins.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="h-8 w-8" />}
          title="No smart bins match filter"
          message="Try changing the search query or status filter."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBins.map((bin, i) => {
            const isFull = bin.fill_level >= 80;
            const isNearlyFull = bin.fill_level >= 60 && bin.fill_level < 80;
            const statusColor = isFull ? '#dc2626' : isNearlyFull ? '#d97706' : '#166534';

            return (
              <motion.div
                key={bin.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`card p-4 space-y-3 border transition-all hover:border-emerald-300 hover:shadow-xs ${
                  isFull ? 'border-red-200 bg-red-50/20' : isNearlyFull ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/80 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{bin.bin_code}</h3>
                      <span
                        className="badge text-[10px] font-bold px-2 py-0.5"
                        style={{ color: statusColor, backgroundColor: `${statusColor}15` }}
                      >
                        {bin.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {bin.location_name} ({bin.zone})
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                    {bin.waste_type}
                  </span>
                </div>

                {/* Fill Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 font-semibold text-[11px]">Fill Level</span>
                    <span style={{ color: statusColor }}>{bin.fill_level}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ width: `${bin.fill_level}%`, backgroundColor: statusColor }}
                    />
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-slate-400" />
                    <span className="truncate">{bin.sensor_id}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Battery className="h-3 w-3 text-emerald-700" />
                    <span>{bin.battery_level}%</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Thermometer className="h-3 w-3 text-amber-600" />
                    <span>{bin.temperature_celsius}°C</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 max-w-md w-full space-y-4 shadow-xl"
          >
            <h3 className="font-bold text-base text-slate-900">Register New Smart Bin Node</h3>
            <form onSubmit={handleAddBinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="label">Location Name / Landmark</label>
                <input
                  required
                  className="input text-xs"
                  placeholder="e.g. Bus Stand Main Gate"
                  value={newBin.location_name}
                  onChange={(e) => setNewBin({ ...newBin, location_name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Village Ward / Zone</label>
                <select
                  className="input text-xs"
                  value={newBin.zone}
                  onChange={(e) => setNewBin({ ...newBin, zone: e.target.value })}
                >
                  <option value="Central Zone">Central Zone</option>
                  <option value="Ward 1">Ward 1</option>
                  <option value="Ward 2">Ward 2</option>
                  <option value="Ward 3">Ward 3</option>
                  <option value="Ward 4">Ward 4</option>
                  <option value="Ward 5">Ward 5</option>
                </select>
              </div>

              <div>
                <label className="label">Waste Type Category</label>
                <select
                  className="input text-xs"
                  value={newBin.waste_type}
                  onChange={(e) => setNewBin({ ...newBin, waste_type: e.target.value as WasteType })}
                >
                  {WASTE_TYPES.map((w) => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Capacity (Liters)</label>
                <input
                  type="number"
                  required
                  className="input text-xs"
                  value={newBin.capacity_liters}
                  onChange={(e) => setNewBin({ ...newBin, capacity_liters: Number(e.target.value) })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-4 py-2">
                  Register Bin
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
