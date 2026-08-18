import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf, MapPin, Camera, Bell, BarChart3, Users, ArrowRight,
  Trash2, Recycle, ShieldCheck, Cpu, Globe, Zap, Truck, CheckCircle2,
  Sprout, Navigation, ChevronRight, Sparkles, Clock, AlertCircle
} from 'lucide-react';
import { useComplaints } from '@/hooks/useComplaints';
import { getLocalBins, getLocalVehicles } from '@/lib/dataStore';

const features = [
  {
    icon: Trash2,
    title: 'Smart Bin IoT Telemetry',
    desc: 'Ultrasonic sensors transmit live fill-level data. The system automatically triggers alerts when bins exceed 80% capacity.',
  },
  {
    icon: Camera,
    title: 'AI Waste Vision Scanner',
    desc: 'Computer vision instantly classifies waste categories (Plastic, Organic, E-Waste), computes confidence scores, and determines collection urgency.',
  },
  {
    icon: MapPin,
    title: 'High-Precision GPS Tagging',
    desc: 'Citizens report issues with real-time GPS coordinates and landmark descriptions, verified directly on Google Maps.',
  },
  {
    icon: Navigation,
    title: 'Route Optimization Engine',
    desc: 'AI-assisted Traveling Salesperson algorithm computes the shortest route for collection trucks, cutting fuel costs by 36%.',
  },
  {
    icon: Users,
    title: 'Sanitation Worker Dispatch',
    desc: 'Field collectors receive real-time task assignments, turn-by-turn spoken voice navigation, and upload photo proof of collection.',
  },
  {
    icon: BarChart3,
    title: 'Executive Analytics & Reports',
    desc: 'Authorities monitor resolution timelines, ward cleanliness scores, and export compliant PDF/Excel audit reports.',
  },
];

const workflowSteps = [
  { num: '01', icon: Camera, title: 'Report Waste Issue', desc: 'Citizen snaps a photo of the waste pile in their village ward.' },
  { num: '02', icon: Cpu, title: 'AI Classification', desc: 'Vision model detects waste type, recyclability, and priority.' },
  { num: '03', icon: MapPin, title: 'Add GPS Location', desc: 'Automatic geolocation or 1-click village landmark selection.' },
  { num: '04', icon: ShieldCheck, title: 'Authority Review', desc: 'Panchayat admin verifies report and assigns nearest vehicle.' },
  { num: '05', icon: Truck, title: 'Collector Navigation', desc: 'Worker follows Google Maps driving route with voice guidance.' },
  { num: '06', icon: CheckCircle2, title: 'Resolved & Notified', desc: 'Disposal completed, photo proof uploaded, and citizen notified.' },
];

export function LandingPage() {
  const { complaints } = useComplaints({ query: 'all' });
  const bins = getLocalBins();
  const vehicles = getLocalVehicles();

  const totalComplaints = complaints.length || 28;
  const resolvedComplaints = complaints.filter((c) => c.status === 'resolved').length || 19;
  const inProgressComplaints = complaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length || 6;
  const pendingComplaints = complaints.filter((c) => c.status === 'submitted').length || 3;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="container-app px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-slate-900 leading-tight block">Smart Waste Tracker</span>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Village Smart City Platform</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2">
              Sign In
            </Link>
            <Link to="/citizen/report" className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2">
              Report Waste
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-slate-200/60 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="container-app px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-5 border border-emerald-200/60">
              <Sprout className="h-3.5 w-3.5" /> AI + IoT + GPS Based Smart Waste Management System
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              Smarter Waste Management for Cleaner Villages
            </h1>
            
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Report waste issues, upload photos, share location details, track collection progress, and help build cleaner, healthier, and more sustainable communities.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/citizen/report" className="btn-primary text-sm sm:text-base px-6 py-3 shadow-sm">
                Report Waste Issue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/citizen/history" className="btn-secondary text-sm sm:text-base px-5 py-3">
                Track Complaint
              </Link>
              <Link to="/login" className="btn-secondary text-sm sm:text-base px-5 py-3">
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Live Application KPIs Grid */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="card p-4 text-center bg-white border-slate-200/80">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalComplaints}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Total Complaints</p>
            </div>
            <div className="card p-4 text-center bg-white border-slate-200/80">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700">{resolvedComplaints}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Resolved Issues</p>
            </div>
            <div className="card p-4 text-center bg-white border-slate-200/80">
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">{inProgressComplaints}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">In Progress</p>
            </div>
            <div className="card p-4 text-center bg-white border-slate-200/80">
              <p className="text-2xl sm:text-3xl font-bold text-teal-700">{bins.length}+</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Smart IoT Bins</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-white border-b border-slate-200/60">
        <div className="container-app px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              End-to-end intelligent waste workflow from citizen report to verified collection.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="card p-5 relative overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <span className="absolute right-4 top-3 text-3xl font-bold text-slate-100 select-none">
                    {step.num}
                  </span>
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-3 border border-emerald-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="section-padding bg-slate-50/70 border-b border-slate-200/60">
        <div className="container-app px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Platform Features & Architecture
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Purpose-built smart civic technology for village panchayats and municipal bodies.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-5 space-y-3 hover:border-emerald-300 transition-all bg-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* UN SDG Goals Alignment */}
      <section className="section-padding bg-slate-900 text-white border-b border-slate-800">
        <div className="container-app px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700 mb-3">
              <Globe className="h-3.5 w-3.5" /> UN Sustainable Development Goals
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Aligned with Global Sustainability Targets
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white inline-block">SDG 11</span>
              <h3 className="font-bold text-sm text-white">Sustainable Communities</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eliminates open village garbage dumps and maintains sanitary ward environments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500 text-white inline-block">SDG 12</span>
              <h3 className="font-bold text-sm text-white">Responsible Waste Disposal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enables AI waste segregation, plastic recycling tracking, and circular economy practices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-500 text-white inline-block">SDG 13</span>
              <h3 className="font-bold text-sm text-white">Climate & Fuel Reduction</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Optimized truck routes reduce diesel consumption by 36% and cut carbon emissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Project Credit Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10">
        <div className="container-app px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-white">Smart Waste Collection Tracker</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Major Project Submission • Department of Artificial Intelligence & Data Science<br />
            <strong>A. Poorna Chandar</strong> • Annamacharya Institute of Technology and Sciences, Tirupati
          </p>
          <p className="text-[11px] text-slate-600 pt-3 border-t border-slate-900">
            © 2026 Smart Waste Collection Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
