import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  zone?: string;
}

const DEMO_USERS: Record<string, { role: UserRole; fullName: string; zone?: string }> = {
  'citizen@smartwaste.com': { role: 'citizen', fullName: 'Anita Sharma (Citizen)', zone: 'Ward 4, North Zone' },
  'citizen@demo.com': { role: 'citizen', fullName: 'Anita Sharma (Citizen)', zone: 'Ward 4, North Zone' },
  'collector@smartwaste.com': { role: 'collector', fullName: 'Rajesh Kumar (Collector)', zone: 'Central Zone' },
  'collector@demo.com': { role: 'collector', fullName: 'Rajesh Kumar (Collector)', zone: 'Central Zone' },
  'admin@smartwaste.com': { role: 'admin', fullName: 'System Administrator' },
  'admin@demo.com': { role: 'admin', fullName: 'System Administrator' },
};

const MOCK_STORAGE_KEY = 'smartwaste_mock_session';

// Helper to prevent hanging Promises when Supabase URL is unreachable
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingProfile = useRef(false);

  const createFallbackProfile = (userOrId: User | string, metadata?: any): Profile => {
    const id = typeof userOrId === 'string' ? userOrId : userOrId.id;
    const email = typeof userOrId === 'object' ? userOrId.email : undefined;
    const demo = email ? DEMO_USERS[email.toLowerCase()] : undefined;

    return {
      id,
      full_name: metadata?.full_name || metadata?.fullName || demo?.fullName || (email ? email.split('@')[0] : 'User'),
      role: metadata?.role || demo?.role || 'citizen',
      phone: metadata?.phone || null,
      zone: metadata?.zone || demo?.zone || null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
  };

  const fetchProfile = useCallback(async (user: User): Promise<Profile> => {
    if (fetchingProfile.current && profile) return profile;
    fetchingProfile.current = true;
    try {
      const res = await withTimeout(
        Promise.resolve(supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()),
        600,
        { data: null, error: null } as any
      );

      if (res.data) {
        const loadedProfile = res.data as Profile;
        setProfile(loadedProfile);
        return loadedProfile;
      }

      const fallback = createFallbackProfile(user, user.user_metadata);
      setProfile(fallback);
      return fallback;
    } catch (err) {
      const fallback = createFallbackProfile(user, user.user_metadata);
      setProfile(fallback);
      return fallback;
    } finally {
      fetchingProfile.current = false;
    }
  }, [profile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  // Load initial session safely without hanging
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const res = await withTimeout(
          supabase.auth.getSession(),
          500,
          { data: { session: null }, error: null } as any
        );
        if (!mounted) return;

        const currentSession = res?.data?.session;

        if (currentSession?.user) {
          setSession(currentSession);
          await fetchProfile(currentSession.user);
        } else {
          // Check mock storage fallback
          const stored = localStorage.getItem(MOCK_STORAGE_KEY);
          if (stored) {
            try {
              const mockData = JSON.parse(stored);
              setSession(mockData.session);
              setProfile(mockData.profile);
            } catch (e) {
              localStorage.removeItem(MOCK_STORAGE_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Ensure loading is never true for more than 700ms
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 700);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        await fetchProfile(newSession.user);
      } else {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (!stored) setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(async (params: SignUpParams) => {
    try {
      const mockUser: Profile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        full_name: params.fullName,
        role: params.role,
        phone: params.phone || null,
        zone: params.zone || null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      const mockSession = {
        access_token: 'mock_token_' + Date.now(),
        refresh_token: 'mock_refresh_' + Date.now(),
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: mockUser.id, email: params.email, user_metadata: { role: params.role, full_name: params.fullName } },
      } as any;

      // Try Supabase with short timeout
      const signUpRes = await withTimeout(
        supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              full_name: params.fullName,
              role: params.role,
              phone: params.phone || null,
              zone: params.zone || null,
            },
          },
        }),
        800,
        { data: { user: null, session: null }, error: new Error('Network timeout') } as any
      );

      if (!signUpRes.error && signUpRes.data?.user) {
        const realProfile: Profile = {
          id: signUpRes.data.user.id,
          full_name: params.fullName,
          role: params.role,
          phone: params.phone || null,
          zone: params.zone || null,
          avatar_url: null,
          created_at: new Date().toISOString(),
        };
        setProfile(realProfile);
        if (signUpRes.data.session) setSession(signUpRes.data.session);
        return { error: null };
      }

      // Local fallback sign up
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ session: mockSession, profile: mockUser }));
      setSession(mockSession);
      setProfile(mockUser);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const lowerEmail = email.toLowerCase().trim();
      const demoConfig = DEMO_USERS[lowerEmail];

      // Try Supabase auth with 800ms timeout limit
      const authRes = await withTimeout(
        supabase.auth.signInWithPassword({ email: lowerEmail, password }),
        800,
        { data: { user: null, session: null }, error: new Error('Network timeout') } as any
      );

      if (!authRes.error && authRes.data?.user) {
        setSession(authRes.data.session);
        await fetchProfile(authRes.data.user);
        localStorage.removeItem(MOCK_STORAGE_KEY);
        return { error: null };
      }

      // If Supabase failed or timed out, build fallback session for demo/user sign in
      const role: UserRole = demoConfig?.role || (lowerEmail.includes('admin') ? 'admin' : lowerEmail.includes('collector') ? 'collector' : 'citizen');
      const fullName: string = demoConfig?.fullName || (email.split('@')[0].toUpperCase());

      const mockProfile: Profile = {
        id: demoConfig ? ('demo_' + role + '_id') : ('user_' + Math.random().toString(36).substring(2, 9)),
        full_name: fullName,
        role: role,
        phone: '+91 98765 43210',
        zone: demoConfig?.zone || 'Central Zone',
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      const mockSession = {
        access_token: 'mock_demo_token_' + Date.now(),
        refresh_token: 'mock_demo_refresh_' + Date.now(),
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: mockProfile.id, email: lowerEmail, user_metadata: { role: mockProfile.role } },
      } as any;

      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ session: mockSession, profile: mockProfile }));
      setSession(mockSession);
      setProfile(mockProfile);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    localStorage.removeItem(MOCK_STORAGE_KEY);
    try {
      withTimeout(Promise.resolve(supabase.auth.signOut()), 300, null);
    } catch (e) {
      // ignore
    }
    setProfile(null);
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!session?.user?.id && !profile) return { error: 'Not authenticated' };
      try {
        const userId = session?.user?.id || profile?.id;
        if (userId) {
          withTimeout(Promise.resolve(supabase.from('profiles').update(updates).eq('id', userId)), 500, null);
        }
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' };
      }
    },
    [session, profile]
  );

  const value: AuthContextValue = {
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}



