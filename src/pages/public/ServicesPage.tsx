import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Camera, MapPin, Bell, BarChart3, Users, FileText, ShieldCheck, Recycle, ArrowRight,
  Cpu, Navigation, Truck
} from 'lucide-react';

const services = [
  {
    icon: Camera,
    title: 'AI-Assisted Waste Reporting',
    desc: 'Citizens report garbage piles with photos, automatic AI classification, priority marking, and exact landmark descriptions.',
    features: ['Photo upload with preview', 'AI Vision category detection', 'Urgency marking', 'Google Maps coordinate capture'],
  },
  {
    icon: MapPin,
    title: 'GPS Geotagging & Turn Navigation',
    desc: 'Every complaint is geo-tagged and displayed on an interactive Google Map with driving navigation and voice guidance.',
    features: ['Google Maps Embed display', 'Turn-by-turn driving directions', 'Spoken voice guidance', 'Village landmark presets'],
  },
  {
    icon: Cpu,
    title: 'IoT Smart Bin Monitoring',
    desc: 'Ultrasonic sensors transmit live telemetry. The system flags fill levels above 80% to avoid overflow in public areas.',
    features: ['Ultrasonic fill telemetry', 'ESP32 IoT sensor simulator', 'Critical overflow alerts', 'Ward-level battery tracking'],
  },
  {
    icon: Navigation,
    title: 'Route Optimization Engine',
    desc: 'AI-assisted TSP algorithm computes shortest collection truck routes across villages, reducing diesel fuel consumption by 36%.',
    features: ['Nearest-neighbor TSP solver', 'Waypoints dispatch sequence', 'Fuel & distance savings calculator', 'Fleet truck management'],
  },
  {
    icon: ShieldCheck,
    title: 'Panchayat Admin Governance',
    desc: 'Administrators monitor live village cleanliness scores, assign tasks to workers, and export official PDF/Excel reports.',
    features: ['Village cleanliness index (0-100)', 'Task dispatching to workers', 'Audit PDF/Excel exports', 'User role management'],
  },
  {
    icon: Truck,
    title: 'Sanitation Worker Dispatch',
    desc: 'Sanitation workers receive mobile route assignments, navigate to locations, upload after-cleaning photos, and log completions.',
    features: ['Assigned task queue', 'Real-time status updates', 'Before & after photo proof', 'Spoken route directions'],
  },
];

const roles = [
  { icon: Users, title: 'For Citizens', desc: 'Report waste piles, test AI vision scanner, track complaints, and view village collection timetables.', to: '/signup' },
  { icon: Truck, title: 'For Sanitation Workers', desc: 'Receive assigned routes, navigate using Google Maps voice guidance, and upload verified proof.', to: '/signup' },
  { icon: ShieldCheck, title: 'For Panchayat Admins', desc: 'Monitor telemetry, assign collectors, optimize truck routes, and download audit reports.', to: '/signup' },
];

export function ServicesPage() {
  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 py-12 lg:py-16 border-b border-slate-200/60">
        <div className="container-app px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
            <FileText className="h-3.5 w-3.5" /> Platform Capabilities
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Integrated Civic Technology for Clean Villages
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            From citizen photo reporting to AI vision analysis, IoT ultrasonic smart bins, route optimization, and executive audits.
          </p>
        </div>
      </section>

      <section className="container-app px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="card p-5 space-y-3 border-slate-200/80 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mb-3 border border-emerald-100">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.desc}</p>
              </div>

              <ul className="space-y-1 pt-2 border-t border-slate-100">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="h-1 w-1 rounded-full bg-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-app px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="mt-1 text-xs text-slate-500">Dedicated workflows for citizens, field sanitation workers, and panchayat administrators.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card p-5 text-center group border-slate-200/80 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 mx-auto mb-3 border border-emerald-100 group-hover:scale-105 transition-transform">
                  <r.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{r.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{r.desc}</p>
              </div>
              <Link to={r.to} className="btn-primary text-xs py-2 px-3 inline-flex items-center justify-center gap-1">
                Get Started <ArrowRight className="h-3 w-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
