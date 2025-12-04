"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session as SupabaseSession } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

// Extended session type to include socialAccountToken and provider
interface Session extends SupabaseSession {
  socialAccountToken?: string;
  provider?: 'google' | 'twitter' | 'facebook' | 'email';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userId: string | null; // Internal user ID (Supabase user ID)
  isLoading: boolean;
  hasMetaTokens: boolean; // Track if user has connected Meta accounts
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasMetaTokens, setHasMetaTokens] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  // Prevent duplicate API calls
  const checkingTokensRef = useRef(false);
  const syncingProfileRef = useRef(false);

  // Check Meta tokens status with deduplication
  const checkMetaTokens = async (internalUserId: string) => {
    // Prevent duplicate calls
    if (checkingTokensRef.current) {
      console.log('🔄 Skipping duplicate checkMetaTokens call');
      return;
    }
    
    checkingTokensRef.current = true;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL;
      const response = await fetch(`${apiUrl}/api/autopost/user/check-meta-tokens?user_id=${internalUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Meta tokens response:', data);
        const tokenStatus = data.has_tokens || false;
        setHasMetaTokens(tokenStatus);
        console.log('✅ Meta tokens status set to:', tokenStatus);
      } else {
        console.error('Failed to check Meta tokens:', response.status);
        setHasMetaTokens(false);
      }
    } catch (error) {
      console.warn('Could not check Meta tokens:', error);
      setHasMetaTokens(false);
    } finally {
      // Reset flag after a short delay to allow new checks after state changes
      setTimeout(() => {
        checkingTokensRef.current = false;
      }, 1000);
    }
  };

  // Sync user profile to database with deduplication
  const syncUserProfile = async (supabaseSession: Session) => {
    // Prevent duplicate calls
    if (syncingProfileRef.current) {
      console.log('🔄 Skipping duplicate syncUserProfile call');
      return;
    }
    
    syncingProfileRef.current = true;
    try {
      const internalUserId = supabaseSession.user.id;
      
      // Sync to your backend
      const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL;
      await fetch(`${apiUrl}/api/autopost/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: internalUserId,
          email: supabaseSession.user.email,
          userName: supabaseSession.user.user_metadata?.full_name || supabaseSession.user.user_metadata?.name,
          provider: supabaseSession.user.app_metadata?.provider || 'email'
        })
      });
      
      console.log('✅ User profile synced to backend');
    } catch (error) {
      console.warn('Could not sync user profile:', error);
    } finally {
      // Reset flag after a short delay
      setTimeout(() => {
        syncingProfileRef.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession?.user) {
          // Get provider from identities or app_metadata
          const identities = supabaseSession.user.identities || [];
          const identity = identities[0];
          const provider = (identity?.provider as 'google' | 'twitter' | 'facebook' | 'email') || 
                          supabaseSession.user.app_metadata?.provider || 
                          'email';
          
          // Create extended session with socialAccountToken and provider
          const extendedSession: Session = {
            ...supabaseSession,
            socialAccountToken: supabaseSession.provider_token || supabaseSession.user.user_metadata?.socialAccountToken,
            provider: provider
          };
          
          setSession(extendedSession);
          setUser(supabaseSession.user);
          setUserId(supabaseSession.user.id);
          
          console.log('🔐 Initializing auth session:', {
            userId: supabaseSession.user.id,
            email: supabaseSession.user.email,
            provider: provider,
            hasSocialToken: !!extendedSession.socialAccountToken
          });

          // Sync user profile
          // await syncUserProfile(supabaseSession);
          
          // // Check Meta tokens
          // await checkMetaTokens(supabaseSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      console.log('🔄 Auth state changed:', event);
      
      if (supabaseSession?.user) {
        // Get provider from identities or app_metadata
        const identities = supabaseSession.user.identities || [];
        const identity = identities[0];
        const provider = (identity?.provider as 'google' | 'twitter' | 'facebook' | 'email') || 
                        supabaseSession.user.app_metadata?.provider || 
                        'email';
        
        // Create extended session with socialAccountToken and provider
        const extendedSession: Session = {
          ...supabaseSession,
          socialAccountToken: supabaseSession.provider_token || supabaseSession.user.user_metadata?.socialAccountToken,
          provider: provider
        };
        
        setSession(extendedSession);
        setUser(supabaseSession.user);
        setUserId(supabaseSession.user.id);
        
        // Sync user profile
        await syncUserProfile(supabaseSession);
        
        // Check Meta tokens
        await checkMetaTokens(supabaseSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        setUserId(null);
        setHasMetaTokens(false);
      }
      
      setIsLoading(false);
      
      // Refresh the page on auth state change to update server components
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  // Protected routes check (client-side fallback)
  useEffect(() => {
    if (!isLoading && !user) {
      const protectedRoutes = ['/dashboard', '/profile', '/settings', '/onboarding', '/autopost'];
      const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
      
      if (isProtectedRoute && pathname !== '/auth/login' && pathname !== '/auth/signup') {
        router.push(`/auth/login?redirect=${pathname}`);
      }
    }
  }, [user, isLoading, pathname, router]);

  const signOut = async () => {
    try {
      // Clean up Meta tokens from backend if userId exists
      if (userId) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL;
          const response = await fetch(`${apiUrl}/api/autopost/user/cleanup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          
          if (response.ok) {
            console.log('🧹 Cleaned up user tokens from backend');
          }
        } catch (error) {
          console.warn('Could not clean up user tokens:', error);
        }
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setSession(null);
      setUser(null);
      setUserId(null);
      setHasMetaTokens(false);
      
      console.log('✅ User signed out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    const { data: { session: supabaseSession } } = await supabase.auth.refreshSession();
    
    if (supabaseSession) {
      // Get provider from identities or app_metadata
      const identities = supabaseSession.user.identities || [];
      const identity = identities[0];
      const provider = (identity?.provider as 'google' | 'twitter' | 'facebook' | 'email') || 
                      supabaseSession.user.app_metadata?.provider || 
                      'email';
      
      // Create extended session with socialAccountToken and provider
      const extendedSession: Session = {
        ...supabaseSession,
        socialAccountToken: supabaseSession.provider_token || supabaseSession.user.user_metadata?.socialAccountToken,
        provider: provider
      };
      
      setSession(extendedSession);
      setUser(supabaseSession.user);
      setUserId(supabaseSession.user.id);
      
      // Re-check Meta tokens after refresh
      await checkMetaTokens(supabaseSession.user.id);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        userId,
        isLoading, 
        hasMetaTokens,
        signOut, 
        refreshSession,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};