import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/db/supabase';
import type { Profile } from '@/types/types';

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

type SignUpPayload = {
  fullName?: string;
  businessName?: string;
  phone?: string;
  email: string;
  password: string;
  isDealer?: boolean;
  gstNumber?: string;
  gstVerified?: boolean;
};

type AuthResult = {
  error: Error | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (payload: SignUpPayload) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  saveProfile: (form: ProfileForm) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[Auth] Failed to fetch profile:', error.message);
    return null;
  }

  return data;
}

async function ensureProfile(userOverride?: User | null) {
  const authUser =
    userOverride ??
    (await supabase.auth.getUser()).data.user;

  if (!authUser) return;

  const { error } = await (supabase.from('profiles') as any).upsert(
    {
      user_id: authUser.id,
      email: authUser.email ?? null,
      name:
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        null,
      phone: authUser.user_metadata?.phone ?? null,
    },
    {
      onConflict: 'user_id',
    }
  );

  if (error) {
    console.error('Profile error:', error);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncAuthState = async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (nextSession?.user) {
      await ensureProfile(nextSession.user);
      const profileData = await getProfile(nextSession.user.id);
      setProfile(profileData);
    } else {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      await syncAuthState(currentSession);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncAuthState(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({
    fullName = '',
    businessName = '',
    phone = '',
    email,
    password,
    isDealer = false,
    gstNumber = '',
    gstVerified = false,
  }: SignUpPayload): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
            account_type: isDealer ? 'dealer' : 'customer',
            business_name: businessName.trim() || null,
            gst_number: gstNumber.trim() || null,
            gst_verified: gstVerified,
            minimum_order_quantity: isDealer ? 100 : null,
          },
        },
      });

      if (error) throw error;

      await ensureProfile(data.user);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const normalizedEmail = email.trim();
      const normalizedPassword = password.trim();

      if (!normalizedEmail || !normalizedPassword) {
        throw new Error('Email and password are required');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      return { error: error as Error };
    }
  };

  const loginWithGoogle = async (): Promise<AuthResult> => {
    try {
      const redirectTo = `${window.location.origin}/b2b-dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const saveProfile = async (form: ProfileForm): Promise<AuthResult> => {
    if (!user) {
      return { error: new Error('User not found. Please login again.') };
    }

    try {
      const { error } = await (supabase.from('profiles') as any).upsert(
        {
          user_id: user.id,
          email: user.email ?? null,
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) throw error;

      await refreshProfile();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        login,
        loginWithGoogle,
        forgotPassword,
        updatePassword,
        saveProfile,
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

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
