import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { setCartUserId } from "@/lib/cart-storage";
import type { User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  email?: string;
  phone_number?: string;
  full_name?: string;
  address?: string;
};

type UserAuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  requestOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, token: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextValue | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              phone_number: userData.phone_number,
              full_name: userData.full_name,
              address: userData.address,
            });
            setCartUserId(userData.id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              phone_number: userData.phone_number,
              full_name: userData.full_name,
              address: userData.address,
            });
            setCartUserId(userData.id);
          }
        } else {
          setUser(null);
          setCartUserId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const requestOtp = useCallback(async (phoneNumber: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not configured');
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      toast.success('OTP sent successfully!', {
        description: 'Check your SMS for the verification code.',
      });
    } catch (error: any) {
      console.error('OTP request error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }, []);

  const verifyOtp = useCallback(async (phoneNumber: string, token: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not configured');
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: token,
        type: 'sms',
      });

      if (error) throw error;

      if (data.user) {
        // Create or update user profile
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from('users').insert({
            id: data.user.id,
            phone_number: phoneNumber,
          });
        }

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            phone_number: userData.phone_number,
            full_name: userData.full_name,
            address: userData.address,
          });
          setCartUserId(userData.id);
        }

        toast.success('Logged in successfully!', {
          description: 'Welcome back!',
        });
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not configured');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
        });

        toast.success('Account created successfully!', {
          description: 'You can now sign in with your credentials.',
        });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not configured');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            phone_number: userData.phone_number,
            full_name: userData.full_name,
            address: userData.address,
          });
          setCartUserId(userData.id);
        }

        toast.success('Signed in successfully!', {
          description: 'Welcome back!',
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setCartUserId(null);
      toast.info('You have been logged out.');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setCartUserId(null);
      toast.info('You have been logged out.');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  }, []);

  const value = useMemo<UserAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      requestOtp,
      verifyOtp,
      signUp,
      signIn,
      logout,
    }),
    [user, loading, requestOtp, verifyOtp, signUp, signIn, logout],
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
