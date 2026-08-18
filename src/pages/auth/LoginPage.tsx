import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, UserCheck, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { signIn, session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string })?.from;

  useEffect(() => {
    if (!loading && session && profile) {
      const dest = from || (profile.role === 'admin' ? '/admin' : profile.role === 'collector' ? '/collector' : '/citizen');
      navigate(dest, { replace: true });
    }
  }, [loading, session, profile, navigate, from]);

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(loginEmail, loginPass);
    setSubmitting(false);
    if (err) {
      setError(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demoUser123!');
    handleLogin(demoEmail, 'demoUser123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card p-7 sm:p-8 shadow-sm border-slate-200/80 bg-white">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs">
                <Leaf className="h-6 w-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-xs text-slate-500 mt-1">Smart Waste Management & Collection Tracker</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="input pl-10 text-xs sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pl-10 pr-10 text-xs sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 text-xs font-bold shadow-2xs flex items-center justify-center gap-2">
              {submitting ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In to Portal <ArrowRight className="h-3.5 w-3.5" /></>
              )}
            </button>
          </form>

          {/* Quick Demo Sign In */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] text-center font-bold text-slate-400 mb-3 uppercase tracking-wider">
              Quick 1-Click Presentation Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('citizen@smartwaste.com')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-700"
              >
                <UserCheck className="h-4 w-4 mb-1 text-emerald-700" />
                <span className="text-[11px] font-bold">Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('collector@smartwaste.com')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all text-slate-700"
              >
                <Truck className="h-4 w-4 mb-1 text-cyan-700" />
                <span className="text-[11px] font-bold">Worker</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@smartwaste.com')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-slate-700"
              >
                <ShieldCheck className="h-4 w-4 mb-1 text-purple-700" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-800 font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
