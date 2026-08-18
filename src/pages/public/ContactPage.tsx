import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email Support', value: 'contact@smartwaste.gov', href: 'mailto:contact@smartwaste.gov' },
    { icon: Phone, label: 'Panchayat Helpline', value: '1800-425-XXXX (Toll Free)', href: 'tel:18004250000' },
    { icon: MapPin, label: 'Central Node Office', value: 'Gram Panchayat Office, Ward 1, Tirupati', href: '#' },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 py-12 lg:py-16 border-b border-slate-200/60">
        <div className="container-app px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
            <MessageSquare className="h-3.5 w-3.5" /> Panchayat Assistance
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Contact & Grievance Support
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-600">
            Have questions or feedback regarding village waste collection? Reach out to our panchayat support team.
          </p>
        </div>
      </section>

      <div className="container-app px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid lg:grid-cols-3 gap-4">
          {contactInfo.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="card p-5 text-center border-slate-200/80 bg-white hover:border-emerald-300 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 mx-auto mb-2 border border-emerald-100">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{c.label}</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{c.value}</p>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6 border-slate-200/80 bg-white space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Send an Inquiry Message</h2>
              <p className="text-xs text-slate-500 mt-0.5">We typically respond within 1-2 business days.</p>
            </div>

            {submitted && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <p className="text-xs font-semibold text-emerald-800">Thank you! Your grievance inquiry has been received.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    required
                    className="input text-xs"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    required
                    type="email"
                    className="input text-xs"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="label">Subject</label>
                <input
                  required
                  className="input text-xs"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Inquiry topic"
                />
              </div>

              <div>
                <label className="label">Message</label>
                <textarea
                  required
                  rows={4}
                  className="input resize-none text-xs"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your question..."
                />
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold shadow-2xs flex items-center justify-center gap-2">
                <Send className="h-3.5 w-3.5" /> Submit Inquiry
              </button>
            </form>
          </div>

          <div className="card p-6 bg-gradient-to-br from-emerald-800 to-teal-900 text-white space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">Panchayat Waste Tracking Mission</h3>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Empowering village communities through automated IoT telemetry, high-precision GPS reporting, and transparent civic governance.
              </p>
              <ul className="space-y-3 text-xs text-emerald-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Real-time GPS complaint registration & resolution verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>AI Waste Vision Model classification & urgency dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>IoT Ultrasonic smart bins with 80% threshold overflow alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Optimized truck route calculations reducing fuel consumption</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-emerald-700/60 text-[11px] text-emerald-200">
              Department of AI & Data Science • AITS Tirupati
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
