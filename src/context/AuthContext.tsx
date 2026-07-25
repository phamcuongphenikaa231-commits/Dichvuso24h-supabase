'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthUser } from '@/types/auth';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  role: 'user' | 'admin';
  status: 'active' | 'locked';
  email?: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  role: 'user' | 'admin' | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: AuthUser; error?: unknown }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: AuthUser; error?: unknown }>;
  signOut: () => Promise<{ success: boolean; error?: unknown }>;
  refreshProfile: (userId: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return null;
      }
      const mappedProfile: UserProfile = {
        id: data.id,
        role: data.role || 'user',
        status: data.status || 'active',
        email: data.email || undefined,
        created_at: data.created_at || undefined,
      };
      setProfile(mappedProfile);
      return mappedProfile;
    } catch (err) {
      console.error('Error in refreshProfile:', err);
      setProfile(null);
      return null;
    }
  }, [supabase]);

  // Hàm map raw session sang AuthUser tương thích ngược
  const mapSessionUser = useCallback((sessionUser: User, userProfile: UserProfile | null): AuthUser => {
    const email = sessionUser.email || '';
    const username = email ? email.split('@')[0] : 'User';
    return {
      id: sessionUser.id,
      username,
      phone: '',
      fullName: username,
      role: userProfile?.role || 'user',
      status: userProfile?.status || 'active',
      createdAt: sessionUser.created_at,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await refreshProfile(session.user.id);
          if (isMounted) {
            setUser(mapSessionUser(session.user, userProfile));
          }
        } else {
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userProfile = await refreshProfile(session.user.id);
        if (isMounted) {
          setUser(mapSessionUser(session.user, userProfile));
        }
      } else {
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, refreshProfile, mapSessionUser]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message, error };
      }

      if (!data.user) {
        return { success: false, message: 'Đăng ký thành công nhưng không tìm thấy thông tin người dùng.' };
      }

      // Đợi trigger DB tạo profile (retry tối đa 3 lần, cách nhau 300ms)
      let userProfile: UserProfile | null = null;
      for (let i = 0; i < 3; i++) {
        userProfile = await refreshProfile(data.user.id);
        if (userProfile) break;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const formatted = mapSessionUser(data.user, userProfile);
      setUser(formatted);

      return {
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        user: formatted,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
      return { success: false, message: errMsg, error: err };
    }
  }, [supabase, refreshProfile, mapSessionUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message, error };
      }

      if (!data.user) {
        return { success: false, message: 'Đăng nhập thành công nhưng không tìm thấy thông tin người dùng.' };
      }

      // Đọc profile tương ứng
      const userProfile = await refreshProfile(data.user.id);

      // Kiểm tra status
      if (userProfile?.status === 'locked') {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        return {
          success: false,
          message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ 24/7.',
        };
      }

      const formatted = mapSessionUser(data.user, userProfile);
      setUser(formatted);

      return {
        success: true,
        message: 'Đăng nhập thành công!',
        user: formatted,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
      return { success: false, message: errMsg, error: err };
    }
  }, [supabase, refreshProfile, mapSessionUser]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return { success: !error, error };
    } catch (err: unknown) {
      setUser(null);
      setProfile(null);
      return { success: false, error: err };
    }
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        isAdmin: profile?.role === 'admin',
        isAuthenticated: !!user,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
