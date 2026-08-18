import { motion } from 'framer-motion';
import { Leaf, Award, Cpu, Globe, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';

export function AboutPage() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="About Smart Waste Collection Tracker"
        subtitle="AI + IoT + GPS Based Smart Waste Management System for Rural & Semi-Urban Areas"
      />

      {/* College & Project Information */}
      <div className="card p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border-emerald-200 space-y-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white font-bold shadow-2xs">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">College Major Project Submission</h3>
            <p className="text-xs text-slate-600">Department of Artificial Intelligence & Data Science</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-emerald-200/80">
          <div>
            <span className="text-slate-500 block">Lead Student Developer:</span>
            <strong className="text-slate-900 text-sm">A. Poorna Chandar</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Institution:</span>
            <strong className="text-slate-900 text-sm">Annamacharya Institute of Technology and Sciences, Tirupati</strong>
          </div>
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="card p-5 space-y-2 border-slate-200/80 bg-white">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            ⚠️ Problem Statement
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Improper waste management in villages causes environmental pollution, health hazards, vector-borne disease outbreaks, and unhygienic living conditions due to irregular garbage collection schedules, unmonitored overflow of community bins, and lack of complaint resolution tracking.
          </p>
        </div>

        <div className="card p-5 space-y-2 border-slate-200/80 bg-white">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            💡 Intelligent Solution
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            A comprehensive web & mobile platform powered by IoT ultrasonic bin fill sensors, AI vision image waste classification, automatic urgency priority engines, AI-assisted TSP route optimization, and multi-role dashboards for Citizens, Sanitation Workers, and Admins.
          </p>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-800" /> Technology Architecture & Stack
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-bold text-[10px] uppercase">Frontend Core</span>
            <strong className="text-slate-900 text-xs">React 18 + TypeScript + Vite</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-bold text-[10px] uppercase">Design System</span>
            <strong className="text-slate-900 text-xs">Tailwind CSS + Lucide Icons</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-bold text-[10px] uppercase">Database & Storage</span>
            <strong className="text-slate-900 text-xs">Supabase + LocalStore Engine</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-bold text-[10px] uppercase">Maps & Navigation</span>
            <strong className="text-slate-900 text-xs">Google Maps + Web Speech API</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
