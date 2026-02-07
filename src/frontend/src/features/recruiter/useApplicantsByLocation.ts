import { useQuery } from '@tanstack/react-query';
import { useBackendActor } from '../actor/BackendActorProvider';
import { useOnboardingStatus } from '../onboarding/useOnboardingStatus';
import { useAuth } from '../auth/AuthContext';
import type { JobApplicantProfile } from '@/backend';

export function useApplicantsByLocation() {
  const { actor, isReady, isInitializing } = useBackendActor();
  const { profile } = useOnboardingStatus();
  const { isAuthenticated } = useAuth();

  const query = useQuery<JobApplicantProfile[]>({
    queryKey: ['applicantsByLocation', profile?.location],
    queryFn: async () => {
      if (!actor || !profile?.location) throw new Error('Actor or location not available');
      return actor.searchApplicantsByLocation(profile.location, true);
    },
    enabled: !!actor && isReady && !isInitializing && isAuthenticated && !!profile?.location,
    retry: false,
  });

  return {
    applicants: query.data || [],
    isLoading: isInitializing || query.isLoading,
    location: profile?.location,
  };
}
