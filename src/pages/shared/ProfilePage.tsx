import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, LogOut, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/DashboardLayout';
import { ROLE_META } from '@/lib/constants';
import { initialFromName } from '@/lib/utils';

export function ProfilePage() {
  const { profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [zone, setZone] = useState(profile?.zone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) {
      setError('Name is too short.');
      return;
    }
    setSaving(true);
    const { error: err } = await updateProfile({
      full_name: fullName.trim(),
      phone: phone || null,
      zone: zone || null,
    });
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const roleMeta = ROLE_META[profile.role];

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <PageHeader title="My Profile Settings" subtitle="Manage your profile information and session preferences." />

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 border-slate-200/80 bg-white"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white text-lg font-bold shadow-2xs">
            {initialFromName(profile.full_name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.full_name}</h2>
            <span
              className="badge text-xs font-bold mt-1"
              style={{ color: roleMeta.color, backgroundColor: `${roleMeta.color}15` }}
            >
              <Shield className="h-3 w-3" /> {roleMeta.label}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Member registered since {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="card p-6 border-slate-200/80 bg-white space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Account Information</h3>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs font-semibold text-red-700">{error}</p>
          </div>
        )}
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
            <p className="text-xs font-semibold text-emerald-800">Profile updated successfully.</p>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="input pl-10 text-xs sm:text-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-10 text-xs sm:text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div>
              <label className="label">Village / Ward Zone</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-10 text-xs sm:text-sm"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="e.g., Ward 4, Mallaiah Gunta Katta"
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-2xs mt-2">
          {saving ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Save className="h-4 w-4" /> Save Profile Changes</>
          )}
        </button>
      </form>

      {/* Session / Danger Zone */}
      <div className="card p-6 border-slate-200/80 bg-white space-y-2">
        <h3 className="font-bold text-slate-900 text-sm">Account Session</h3>
        <p className="text-xs text-slate-500">Sign out of your account on this device.</p>
        <div className="pt-2">
          <button onClick={handleSignOut} className="btn-ghost text-red-600 hover:bg-red-50 text-xs px-3.5 py-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
