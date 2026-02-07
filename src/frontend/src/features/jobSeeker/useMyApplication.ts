import { useQuery } from '@tanstack/react-query';
import { useBackendActor } from '../actor/BackendActorProvider';
import { useAuth } from '../auth/AuthContext';
import type { JobApplicantProfile } from '@/backend';

export function useMyApplication() {
  const { actor, isReady, isInitializing } = useBackendActor();
  const { isAuthenticated } = useAuth();

  const query = useQuery<JobApplicantProfile | null>({
    queryKey: ['myJobApplication'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyJobApplication();
    },
    enabled: !!actor && isReady && !isInitializing && isAuthenticated,
    retry: false,
  });

  return {
    application: query.data,
    isLoading: isInitializing || query.isLoading,
    refetch: query.refetch,
  };
}
