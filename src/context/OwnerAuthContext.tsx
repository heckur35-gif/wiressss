import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkIsOwner } from "@/lib/db-services";
import type { User } from "@supabase/supabase-js";

interface OwnerAuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  owner: { id: string; phone?: string } | null;
  requestOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const OwnerAuthContext = createContext<OwnerAuthContextValue | undefined>(undefined);

export const OwnerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [owner, setOwner] = useState<{ id: string; phone?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const initializeOwnerAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isOwner = await checkIsOwner(session.user.id);
          if (isOwner) {
            setOwner({ id: session.user.id, phone: session.user.phone });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error initializing owner auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeOwnerAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const isOwner = await checkIsOwner(session.user.id);
          if (isOwner) {
            setOwner({ id: session.user.id, phone: session.user.phone });
            setIsAuthenticated(true);
          } else {
            setOwner(null);
            setIsAuthenticated(false);
          }
        } else {
          setOwner(null);
          setIsAuthenticated(false);
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
        const isOwner = await checkIsOwner(data.user.id);
        if (!isOwner) {
          toast.error('You do not have owner access');
          await supabase.auth.signOut();
          return;
        }

        setOwner({ id: data.user.id, phone: phoneNumber });
        setIsAuthenticated(true);

        toast.success('Owner logged in successfully!', {
          description: 'Welcome to the dashboard!',
        });
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setOwner(null);
      setIsAuthenticated(false);
      toast.info('You have been logged out.');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setOwner(null);
      setIsAuthenticated(false);
      toast.info('You have been logged out.');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  }, []);

  const value = useMemo<OwnerAuthContextValue>(
    () => ({
      isAuthenticated,
      loading,
      owner,
      requestOtp,
      verifyOtp,
      logout,
    }),
    [isAuthenticated, loading, owner, requestOtp, verifyOtp, logout],
  );

  return <OwnerAuthContext.Provider value={value}>{children}</OwnerAuthContext.Provider>;
};

export const useOwnerAuth = () => {
  const context = useContext(OwnerAuthContext);

  if (!context) {
    throw new Error("useOwnerAuth must be used within an OwnerAuthProvider");
  }

  return context;
};
