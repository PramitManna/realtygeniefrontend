import React, { ReactNode } from 'react';
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck';

interface OnboardingGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that guards tool access by checking onboarding status
 * Shows loading state while checking, redirects if not completed
 */
export function OnboardingGuard({ children, fallback }: OnboardingGuardProps) {
  const { isCompleted, isLoading } = useOnboardingCheck();

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen w-full bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-gold)] mb-4"></div>
            <p className="text-neutral-400">Checking onboarding status...</p>
          </div>
        </div>
      )
    );
  }

  // If not completed, the hook will have redirected to /onboarding
  // This should never render if not completed
  if (!isCompleted) {
    return null;
  }

  return <>{children}</>;
}
