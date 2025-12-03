/**
 * Helper function to navigate to a tool with onboarding check
 * If user is not logged in, redirects to login
 * If user is logged in, checks onboarding status via backend
 * If not completed, redirects to onboarding before tool
 */
export async function navigateToToolWithOnboardingCheck(
  toolPath: string,
  user: any,
  router: any,
  supabase: any
) {
  try {
    // If not logged in, redirect to login
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(toolPath)}`);
      return;
    }

    // Check localStorage cache first
    const cacheKey = `onboarding_completed_${user.id}`;
    const cachedStatus = localStorage.getItem(cacheKey);

    if (cachedStatus === 'true') {
      // Already completed, go directly to tool
      router.push(toolPath);
      return;
    }

    // If not in cache or cache says not completed, check backend
    try {
      const response = await fetch('/api/onboarding/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (!response.ok) {
        throw new Error('Failed to check onboarding status');
      }

      const data = await response.json();

      // Cache the result
      localStorage.setItem(cacheKey, String(data.completed));

      if (data.completed) {
        // Onboarding is completed, go directly to tool
        router.push(toolPath);
      } else {
        // Not completed, redirect to onboarding first
        // After onboarding, user will be redirected to the tool
        router.push(`/onboarding?redirect=${encodeURIComponent(toolPath)}`);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // On error, assume not completed and redirect to onboarding for safety
      router.push(`/onboarding?redirect=${encodeURIComponent(toolPath)}`);
    }
  } catch (error) {
    console.error('Error navigating to tool:', error);
  }
}
