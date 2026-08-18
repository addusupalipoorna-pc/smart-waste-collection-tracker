import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_META } from '@/lib/constants';
import { isValidEmail } from '@/lib/utils';
import type { UserRole } from '@/types';

export function SignupPage() {
  const { signUp, session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen' as UserRole,
    phone: '',
    zone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && profile) {
      const dest = profile.role === 'admin' ? '/admin' : profile.role === 'collector' ? '/collector' : '/citizen';
      navigate(dest, { replace: true });
    }
  }, [loading, session, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      role: form.role,
      phone: form.phone || undefined,
      zone: form.zone || undefined,
    });
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 max-w-md w-full text-center space-y-4 shadow-xl border-emerald-200"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Account Created!</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your Smart Waste account has been created. You can now sign in to report issues and track village cleanliness.
          </p>
          <Link to="/login" className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2">
            Continue to Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="card p-7 sm:p-8 shadow-sm border-slate-200/80 bg-white">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs">
                <Leaf className="h-6 w-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-500 mt-1">Join the Village Smart Waste Management Initiative</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* Role selection */}
          <div className="mb-4">
            <label className="label">I am registering as...</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ROLE_META) as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    form.role === role
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {ROLE_META[role].label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  className="input pl-10 text-xs sm:text-sm"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="input pl-10 text-xs sm:text-sm"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="label">Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="input pl-10 text-xs sm:text-sm"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Village / Ward Zone <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-10 text-xs sm:text-sm"
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  placeholder="e.g., Ward 4, Mallaiah Gunta Katta"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="input pl-10 text-xs sm:text-sm"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="input pl-10 text-xs sm:text-sm"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 mt-2">
              {submitting ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Register Account <ArrowRight className="h-3.5 w-3.5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-800 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
