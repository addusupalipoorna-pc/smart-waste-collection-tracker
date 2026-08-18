import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="container-app px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-white">Smart Waste Collection Tracker</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              An intelligent waste management system empowering village panchayats through IoT ultrasonic telemetry, AI vision classification, GPS geotagging, and route optimization.
            </p>
            <p className="text-[11px] text-slate-500">
              Department of Artificial Intelligence & Data Science • AITS Tirupati
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Navigation</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Project</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition-colors">Capabilities</Link></li>
              <li><Link to="/schedule" className="hover:text-emerald-400 transition-colors">Village Schedule</Link></li>
              <li><Link to="/impact" className="hover:text-emerald-400 transition-colors">Environmental Impact</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Helpline & Office</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-emerald-400" /> support@smartwaste.gov</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-emerald-400" /> 1800-425-XXXX (Toll Free)</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-emerald-400" /> Gram Panchayat Ward 1, Tirupati</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <p>© 2026 Smart Waste Collection Tracker. All rights reserved.</p>
          <p>Author: <strong>A. Poorna Chandar</strong></p>
        </div>
      </div>
    </footer>
  );
}
