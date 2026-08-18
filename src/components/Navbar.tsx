import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Leaf, Menu, X, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_META } from '@/lib/constants';
import { classNames, initialFromName } from '@/lib/utils';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Project' },
  { to: '/services', label: 'Platform Services' },
  { to: '/contact', label: 'Panchayat Contact' },
];

export function Navbar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const dashboardPath = profile
    ? profile.role === 'admin'
      ? '/admin'
      : profile.role === 'collector'
        ? '/collector'
        : '/citizen'
    : '/login';

  const handleSignOut = async () => {
    await signOut();
    setUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <nav className="container-app px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs group-hover:scale-105 transition-transform">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-slate-900 leading-tight block">Smart Waste Tracker</span>
              <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wider hidden sm:block">Village Smart City</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={classNames(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                  location.pathname === link.to
                    ? 'text-emerald-900 bg-emerald-50 font-bold border border-emerald-200/60'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {initialFromName(profile.full_name)}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{profile.full_name.split(' ')[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200/80 py-1.5 z-20 animate-fade-in text-xs">
                      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                        <p className="font-bold text-slate-900 truncate">{profile.full_name}</p>
                        <p className="text-[10px] font-semibold text-emerald-700">
                          {ROLE_META[profile.role].label}
                          {profile.zone ? ` • ${profile.zone}` : ''}
                        </p>
                      </div>
                      <Link
                        to={dashboardPath}
                        onClick={() => setUserMenu(false)}
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenu(false)}
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs px-3.5 py-2">
                  Sign In
                </Link>
                <Link to="/citizen/report" className="btn-primary text-xs px-3.5 py-2 shadow-2xs">
                  Report Waste
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 animate-fade-in text-xs">
            <div className="flex flex-col gap-1">
              {publicLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={classNames(
                    'px-3.5 py-2 rounded-lg font-semibold',
                    location.pathname === link.to
                      ? 'text-emerald-900 bg-emerald-50 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {profile ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="px-3.5 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">
                    Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3.5 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">
                    My Profile
                  </Link>
                  <button onClick={handleSignOut} className="text-left px-3.5 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2 flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-xs flex-1 text-center py-2">
                    Sign In
                  </Link>
                  <Link to="/citizen/report" onClick={() => setMobileOpen(false)} className="btn-primary text-xs flex-1 text-center py-2">
                    Report Waste
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
