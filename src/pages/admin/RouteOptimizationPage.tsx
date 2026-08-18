import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation, Cpu, Truck, Clock, MapPin, CheckCircle2,
  TrendingDown, Zap, ArrowRight, RotateCcw
} from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';
import { MapView } from '@/components/MapView';
import { StatCard } from '@/components/ui';
import { getLocalBins, getLocalVehicles, calculateOptimizedRoute } from '@/lib/dataStore';
import type { OptimizedRoute } from '@/types';

export function RouteOptimizationPage() {
  const bins = useMemo(() => getLocalBins(), []);
  const vehicles = useMemo(() => getLocalVehicles(), []);

  const fullBins = useMemo(() => bins.filter((b) => b.fill_level >= 60), [bins]);
  const [selectedBinIds, setSelectedBinIds] = useState<string[]>(() => fullBins.slice(0, 5).map((b) => b.id));
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => vehicles[0]?.id || 'v-1');

  const [route, setRoute] = useState<OptimizedRoute | null>(() =>
    calculateOptimizedRoute(selectedBinIds, selectedVehicleId)
  );

  const toggleBinSelection = (id: string) => {
    setSelectedBinIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOptimize = () => {
    const newRoute = calculateOptimizedRoute(selectedBinIds, selectedVehicleId);
    setRoute(newRoute);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const mapMarkers = useMemo(() => {
    if (!route) return [];
    return route.points.map((p, index) => ({
      lat: p.latitude,
      lng: p.longitude,
      label: `${index === 0 ? 'START' : index === route.points.length - 1 ? 'END' : `#${index}`}: ${p.code} (${p.location_name})`,
      color: p.type === 'depot' ? '#166534' : p.urgency === 'Critical' ? '#dc2626' : p.urgency === 'High' ? '#d97706' : '#0f766e',
    }));
  }, [route]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="AI-Assisted Route Optimization"
        subtitle="Traveling Salesperson Problem (TSP) Nearest-Neighbor Algorithm for Truck Route Fuel Savings."
      />

      {/* Metric Comparison Banner */}
      {route && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Original Path Distance"
            value={`${route.original_distance_km} km`}
            icon={<Navigation className="h-5 w-5" />}
            color="#64748b"
          />
          <StatCard
            label="Optimized Path"
            value={`${route.optimized_distance_km} km`}
            icon={<Zap className="h-5 w-5" />}
            color="#166534"
          />
          <StatCard
            label="Distance Saved"
            value={`-${route.distance_saved_km} km`}
            icon={<TrendingDown className="h-5 w-5" />}
            color="#0f766e"
          />
          <StatCard
            label="Efficiency Gain"
            value={`+${route.efficiency_improvement_percent}%`}
            icon={<Cpu className="h-5 w-5" />}
            color="#166534"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls & Selection */}
        <div className="space-y-4">
          <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-800" /> Select Dispatch Vehicle
            </h3>
            <select
              className="input text-xs"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_code} — {v.driver_name} ({v.type})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              Capacity: {selectedVehicle?.capacity_kg} kg • Fuel Tank: {selectedVehicle?.fuel_level_percent}%
            </p>
          </div>

          <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-800" /> Collection Bins ({selectedBinIds.length})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBinIds(bins.map((b) => b.id))}
                className="text-[11px] text-emerald-800 hover:underline font-bold"
              >
                Select All
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {bins.map((bin) => {
                const isSelected = selectedBinIds.includes(bin.id);
                return (
                  <button
                    key={bin.id}
                    type="button"
                    onClick={() => toggleBinSelection(bin.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all text-xs ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold truncate">{bin.bin_code} — {bin.location_name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{bin.zone}</p>
                    </div>
                    <span className={`text-[11px] font-bold shrink-0 ${bin.fill_level >= 80 ? 'text-red-600' : 'text-amber-600'}`}>
                      {bin.fill_level}%
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleOptimize}
              disabled={selectedBinIds.length === 0}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold shadow-2xs mt-2"
            >
              <Cpu className="h-4 w-4" /> Compute Route Optimization
            </button>
          </div>
        </div>

        {/* Map & Sequence View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-emerald-800" /> Google Maps Route Waypoints
            </h3>
            <MapView height="320px" customMarkers={mapMarkers} zoom={13} />
          </div>

          {route && (
            <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Waypoint Dispatch Sequence ({route.points.length} stops)
              </h3>
              <div className="space-y-1.5">
                {route.points.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-white font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{p.code} — {p.location_name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{p.type}</p>
                      </div>
                    </div>
                    {p.fill_level !== undefined && (
                      <span className="font-bold text-slate-700 text-[11px]">{p.fill_level}% Fill</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
