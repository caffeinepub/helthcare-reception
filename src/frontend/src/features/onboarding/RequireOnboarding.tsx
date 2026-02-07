import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStatus } from './useOnboardingStatus';
import { useBackendActor } from '../actor/BackendActorProvider';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RequireOnboardingProps {
  children: ReactNode;
  step: 'role' | 'location' | 'complete';
}

export default function RequireOnboarding({ children, step }: RequireOnboardingProps) {
  const navigate = useNavigate();
  const { profile, isLoading, isFetched, isError, refetch, isRetrying } = useOnboardingStatus();
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
  if (isLoading || isInitializing || actorRetrying || isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {isInitializing || actorRetrying ? 'Connecting to the system...' : 'Loading your account...'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we set things up
          </p>
        </div>
      </div>
    );
  }

  // Only show destructive error after all retries are exhausted
  if (isError && !isLoading && !isInitializing && !actorRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load your account</AlertTitle>
            <AlertDescription>
              An unexpected error occurred while loading your profile. Please try again.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => refetch()} 
            className="w-full"
            variant="default"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
