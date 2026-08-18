import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Truck, UserCheck, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';
import { getLocalSchedules } from '@/lib/dataStore';
import type { CollectionScheduleItem } from '@/types';

export function CollectionSchedulePage() {
  const [schedules] = useState<CollectionScheduleItem[]>(() => getLocalSchedules());

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Village Waste Collection Timetable"
        subtitle="Weekly Door-to-Door & Bin Collection Timetable by Village Ward & Area"
      />

      <div className="card p-4 bg-emerald-50/70 border-emerald-200 shadow-2xs flex items-start gap-3">
        <Calendar className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-600">
          <p className="font-bold text-slate-900 text-sm">Timely Door-to-Door & Smart Bin Collection</p>
          <p className="mt-0.5">
            Sanitation trucks collect segregated wet, dry, and recyclable waste according to the schedule below. Please keep your bins ready during your ward's collection window.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {schedules.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="card p-4 space-y-3 border-slate-200/80 bg-white hover:border-emerald-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold mb-1 inline-block">
                  {item.day_of_week}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{item.area}</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {item.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-800">{item.time_window}</span>
              </p>
              <p className="flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                <span>Sanitation Worker: <strong className="text-slate-900">{item.assigned_worker_name}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span>Vehicle: <strong className="text-slate-900">{item.vehicle_code}</strong></span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
