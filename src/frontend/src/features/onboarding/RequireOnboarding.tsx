import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStatus } from './useOnboardingStatus';
import { useBackendActor } from '../actor/BackendActorProvider';
import AsyncFallbackState from '@/components/AsyncFallbackState';

interface RequireOnboardingProps {
  children: ReactNode;
  step: 'role' | 'location' | 'complete';
}

export default function RequireOnboarding({ children, step }: RequireOnboardingProps) {
  const navigate = useNavigate();
  const { profile, isLoading, isFetched, isError, refetch, isProfileNull } = useOnboardingStatus();
  const { isInitializing, isRetrying: actorRetrying } = useBackendActor();

  useEffect(() => {
    if (!isLoading && isFetched && profile) {
      if (step === 'role') {
        if (profile.role) {
          navigate({ to: '/onboarding/location' });
        }
      } else if (step === 'location') {
        if (!profile.role) {
          navigate({ to: '/onboarding/role' });
        } else if (profile.location && profile.onboardingCompleted) {
          if (profile.role === 'jobSeeker') {
            navigate({ to: '/job-seeker/apply' });
          } else {
            navigate({ to: '/recruiter/browse' });
          }
        }
      } else if (step === 'complete') {
        if (!profile.role) {
          navigate({ to: '/onboarding/role' });
        } else if (!profile.location || !profile.onboardingCompleted) {
          navigate({ to: '/onboarding/location' });
        }
      }
    }
  }, [profile, isLoading, isFetched, step, navigate]);

  // Show stable loading state during actor initialization, retries, or profile loading
  if (isLoading || isInitializing || actorRetrying) {
    return (
      <AsyncFallbackState
        state="loading"
        message={isInitializing || actorRetrying ? 'Connecting to the system...' : 'Loading your account...'}
      />
    );
  }

  // Handle profile not found (null) - distinct from error
  if (isFetched && isProfileNull && !isError) {
    return (
      <AsyncFallbackState
        state="error"
        title="Profile Not Found"
        message="Your profile could not be found. Please log in again to continue."
        actions={{
          retry: () => refetch(),
          goToLogin: true,
        }}
      />
    );
  }

  // Handle terminal error after all retries exhausted
  if (isError && !isLoading && !isInitializing && !actorRetrying) {
    return (
      <AsyncFallbackState
        state="error"
        title="Unable to Load Your Account"
        message="An unexpected error occurred while loading your profile. Please try again or log in."
        actions={{
          retry: () => refetch(),
          goToLogin: true,
        }}
      />
    );
  }

  return <>{children}</>;
}
