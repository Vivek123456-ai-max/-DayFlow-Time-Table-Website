import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserStats } from '../types/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userStats: UserStats | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshUserStats: () => Promise<void>;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_ID = 'demo-user-0000-0000-0000-000000000001';

const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  full_name: 'Vivek Kumar',
  avatar_url: null,
  timezone: 'Asia/Kolkata',
  focus_areas: [],
  daily_goal_hours: 6,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_STATS: UserStats = {
  user_id: DEMO_USER_ID,
  current_streak: 0,
  longest_streak: 0,
  total_xp: 0,
  level: 1,
  total_completed_tasks: 0,
  last_active_date: null,
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  const fetchProfileAndStats = useCallback(async (userId: string, defaultName?: string) => {
    try {
      const [profRes, statsRes] = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      if (profRes.status === 'fulfilled') {
        if (profRes.value.data) {
          setProfile(profRes.value.data as Profile);
        } else {
          const newProf: Profile = {
            id: userId,
            full_name: defaultName || 'Vivek Kumar',
            avatar_url: null,
            timezone: 'Asia/Kolkata',
            focus_areas: [],
            daily_goal_hours: 6,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await supabase.from('profiles').insert(newProf);
          setProfile(newProf);
        }
      }

      if (statsRes.status === 'fulfilled') {
        if (statsRes.value.data) {
          setUserStats(statsRes.value.data as UserStats);
        } else {
          const newStats: UserStats = {
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            total_xp: 0,
            level: 1,
            total_completed_tasks: 0,
            last_active_date: null,
            updated_at: new Date().toISOString(),
          };
          await supabase.from('user_stats').insert(newStats);
          setUserStats(newStats);
        }
      }
    } catch (e) {
      console.warn('Profile fetch notice:', e);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndStats(session.user.id, session.user.user_metadata?.full_name);
      } else {
        const demoActive = localStorage.getItem('dayflow_demo_active') === 'true';
        if (demoActive) {
          setIsDemoUser(true);
          setProfile(DEMO_PROFILE);
          setUserStats(DEMO_STATS);
        }
      }
      setLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsDemoUser(false);
        localStorage.removeItem('dayflow_demo_active');
        fetchProfileAndStats(session.user.id, session.user.user_metadata?.full_name);
      } else {
        setProfile(null);
        setUserStats(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndStats]);

  // Realtime subscription for Profile & Stats changes across devices
  useEffect(() => {
    if (!user?.id || isDemoUser) return;

    const channel = supabase
      .channel(`realtime_auth_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setUserStats(payload.new as UserStats);
          }
        }
      )
      .subscribe();

    const handleReconnect = () => {
      if (user?.id && !isDemoUser) {
        fetchProfileAndStats(user.id);
      }
    };

    window.addEventListener('focus', handleReconnect);
    window.addEventListener('online', handleReconnect);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReconnect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleReconnect);
      window.removeEventListener('online', handleReconnect);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, isDemoUser, fetchProfileAndStats]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error: error as Error | null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          timezone: 'Asia/Kolkata',
        },
      },
    });

    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        timezone: 'Asia/Kolkata',
        focus_areas: [],
        daily_goal_hours: 6,
      });
      await supabase.from('user_stats').upsert({
        user_id: data.user.id,
        current_streak: 0,
        longest_streak: 0,
        total_xp: 0,
        level: 1,
        total_completed_tasks: 0,
        last_active_date: null,
      });
    }

    setLoading(false);
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    setIsDemoUser(false);
    localStorage.removeItem('dayflow_demo_active');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserStats(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (isDemoUser) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    }

    if (!user) return { error: new Error('User not logged in') };

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }

    return { error: error as Error | null };
  }, [user, isDemoUser]);

  const updatePassword = useCallback(async (password: string) => {
    if (isDemoUser) return { error: null };
    if (!user) return { error: new Error('User not logged in') };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  }, [user, isDemoUser]);

  const refreshUserStats = useCallback(async () => {
    if (isDemoUser || !user) return;
    try {
      const { data } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setUserStats(data as UserStats);
      }
    } catch {
      // ignore
    }
  }, [user, isDemoUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userStats,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePassword,
        refreshUserStats,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
