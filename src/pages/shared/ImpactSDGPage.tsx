import { motion } from 'framer-motion';
import {
  Globe, Leaf, RotateCcw, Zap, Fuel, TrendingUp, Award, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';
import { StatCard } from '@/components/ui';
import { getEnvironmentalImpactMetrics } from '@/lib/dataStore';

export function ImpactSDGPage() {
  const metrics = getEnvironmentalImpactMetrics();

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Environmental Impact & UN SDG Alignment"
        subtitle="Tracking village sustainability contributions, CO₂ reductions, and recycling metrics."
      />

      {/* Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Waste Collected"
          value={`${metrics.total_waste_collected_kg.toLocaleString()} kg`}
          icon={<RotateCcw className="h-5 w-5" />}
          color="#166534"
        />
        <StatCard
          label="Estimated CO₂ Saved"
          value={`${metrics.estimated_co2_reduction_kg.toLocaleString()} kg`}
          icon={<Leaf className="h-5 w-5" />}
          color="#0f766e"
        />
        <StatCard
          label="Route Distance Saved"
          value={`${metrics.distance_saved_km} km`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="#2563eb"
        />
        <StatCard
          label="Diesel Fuel Saved"
          value={`${metrics.fuel_saved_liters} Liters`}
          icon={<Fuel className="h-5 w-5" />}
          color="#d97706"
        />
      </div>

      {/* Sustainability Metrics Detail */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white mx-auto mb-3 shadow-2xs">
            <RotateCcw className="h-5 w-5" />
          </div>
          <p className="font-bold text-2xl text-emerald-950">{metrics.recycling_rate_percent}%</p>
          <p className="text-xs font-bold text-emerald-800 mt-1">Village Recycling Rate</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Segregation at source & dry waste recovery</p>
        </div>

        <div className="card p-5 text-center bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-800 text-white mx-auto mb-3 shadow-2xs">
            <Zap className="h-5 w-5" />
          </div>
          <p className="font-bold text-2xl text-cyan-950">{metrics.collection_efficiency_percent}%</p>
          <p className="text-xs font-bold text-cyan-800 mt-1">Collection Efficiency</p>
          <p className="text-[11px] text-cyan-700 mt-0.5">AI route optimization & timely truck dispatch</p>
        </div>

        <div className="card p-5 text-center bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-800 text-white mx-auto mb-3 shadow-2xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="font-bold text-2xl text-purple-950">{metrics.overflow_events_prevented}</p>
          <p className="text-xs font-bold text-purple-800 mt-1">Overflow Events Prevented</p>
          <p className="text-[11px] text-purple-700 mt-0.5">IoT ultrasonic sensor alerts above 80% threshold</p>
        </div>
      </div>

      {/* UN Sustainable Development Goals Section */}
      <div className="space-y-4">
        <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-800" /> UN Sustainable Development Goals (SDG) Alignment
        </h2>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* SDG 11 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5 border-t-4 border-amber-500 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-sm">
                11
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">SDG 11</h3>
                <p className="text-[11px] text-amber-700 font-bold">Sustainable Communities</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides rural villages with smart-city waste infrastructure, eliminating open dumping grounds, reducing vector-borne disease risks, and creating cleaner habitats.
            </p>
          </motion.div>

          {/* SDG 12 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 border-t-4 border-emerald-600 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
                12
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">SDG 12</h3>
                <p className="text-[11px] text-emerald-700 font-bold">Responsible Consumption</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Encourages source segregation (wet vs dry vs e-waste), boosts recycling rates to 74%, and enforces accountability for proper disposal practices.
            </p>
          </motion.div>

          {/* SDG 13 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5 border-t-4 border-teal-600 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-sm">
                13
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">SDG 13</h3>
                <p className="text-[11px] text-teal-700 font-bold">Climate Action & Fuel Savings</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI-driven collection route optimization reduces diesel fuel usage by 36%, cutting greenhouse gas emissions and vehicle carbon footprints.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
