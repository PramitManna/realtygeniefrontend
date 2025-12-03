import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

/**
 * Hook to check if user has completed onboarding before accessing tools
 * Caches result in localStorage to avoid repeated backend calls
 * 
 * Usage:
 * ```
 * const { isCompleted, isLoading, error } = useOnboardingCheck();
 * 
 * if (isLoading) return <Loading />;
 * if (!isCompleted) return <Redirect to onboarding>;
 * ```
 */
export function useOnboardingCheck() {
  const router = useRouter();
  const supabase = createClient();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkOnboardingStatus = async () => {
      try {
        // Get current user
        let { data: { user } } = await supabase.auth.getUser();

        // If no user yet, wait a bit and try again
        if (!user) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const result = await supabase.auth.getUser();
          user = result.data?.user || null;
        }

        if (!isMounted) return;

        if (!user) {
          // Not logged in, redirect to login
          router.push('/auth/login');
          return;
        }

        // Check localStorage cache first
        const cacheKey = `onboarding_completed_${user.id}`;
        const cachedStatus = localStorage.getItem(cacheKey);

        if (cachedStatus !== null) {
          const cached = cachedStatus === 'true';
          setIsCompleted(cached);
          setIsLoading(false);

          // If not completed, redirect to onboarding
          if (!cached) {
            router.push('/onboarding');
          }
          return;
        }

        // If not in cache, check backend
        const response = await fetch(`/api/onboarding/check-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });

        if (!response.ok) {
          throw new Error('Failed to check onboarding status');
        }

        const data = await response.json();
        const completed = data.completed || false;

        if (!isMounted) return;

        // Cache the result in localStorage
        localStorage.setItem(cacheKey, String(completed));

        setIsCompleted(completed);

        // If not completed, redirect to onboarding
        if (!completed) {
          router.push('/onboarding');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsCompleted(false);
        // On error, assume not completed and redirect to onboarding
        if (isMounted) {
          router.push('/onboarding');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, [supabase, router]);

  return { isCompleted, isLoading, error };
}

/**
 * Function to update onboarding cache after completion
 * Call this after user completes onboarding
 */
export function setOnboardingCached(userId: string, completed: boolean) {
  const cacheKey = `onboarding_completed_${userId}`;
  localStorage.setItem(cacheKey, String(completed));
}

/**
 * Function to clear onboarding cache (e.g., on logout)
 */
export function clearOnboardingCache(userId?: string) {
  if (userId) {
    const cacheKey = `onboarding_completed_${userId}`;
    localStorage.removeItem(cacheKey);
  } else {
    // Clear all onboarding caches
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('onboarding_completed_')) {
        localStorage.removeItem(key);
      }
    });
  }
}
