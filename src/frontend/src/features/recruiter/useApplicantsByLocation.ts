import { useQuery } from '@tanstack/react-query';
import { useBackendActor } from '../actor/BackendActorProvider';
import { useOnboardingStatus } from '../onboarding/useOnboardingStatus';
import { useAuth } from '../auth/AuthContext';
import type { JobApplicantProfile, JobApplicationsResult } from '@/backend';
import { isErrorResult, unwrapResult, mapBackendError } from '@/utils/backendErrors';

export function useApplicantsByLocation() {
  const { actor, isReady, isInitializing } = useBackendActor();
  const { profile } = useOnboardingStatus();
  const { isAuthenticated } = useAuth();

  const query = useQuery<JobApplicantProfile[], Error>({
    queryKey: ['applicantsByLocation', profile?.location],
    queryFn: async () => {
      if (!actor) throw new Error('System not ready. Please try again.');
      if (!profile?.location) {
        throw new Error('Your location is not set. Please complete your profile setup.');
      }
      
      const result: JobApplicationsResult = await actor.searchApplicantsByLocation(profile.location, true);
      
      // Handle backend Result type
      if (isErrorResult(result)) {
        const errorInfo = mapBackendError(result.err);
        throw new Error(errorInfo.message);
      }
      
      return result.ok;
    },
    enabled: !!actor && isReady && !isInitializing && isAuthenticated && !!profile?.location,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    applicants: query.data || [],
    isLoading: isInitializing || query.isLoading,
    isError: query.isError,
    error: query.error,
    location: profile?.location,
    refetch: query.refetch,
    hasLocation: !!profile?.location,
  };
}
