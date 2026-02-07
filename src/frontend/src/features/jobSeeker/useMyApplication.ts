import { useQuery } from '@tanstack/react-query';
import { useBackendActor } from '../actor/BackendActorProvider';
import { useAuth } from '../auth/AuthContext';
import type { JobApplicantProfile, JobApplicationResult } from '@/backend';
import { isErrorResult, mapBackendError } from '@/utils/backendErrors';

export function useMyApplication() {
  const { actor, isReady, isInitializing } = useBackendActor();
  const { isAuthenticated } = useAuth();

  const query = useQuery<JobApplicantProfile | null, Error>({
    queryKey: ['myJobApplication'],
    queryFn: async () => {
      if (!actor) throw new Error('System not ready. Please try again.');
      
      const result: JobApplicationResult = await actor.getMyJobApplication();
      
      // Handle backend Result type
      if (isErrorResult(result)) {
        const errorInfo = mapBackendError(result.err);
        // For noApplicationFound, return null instead of throwing
        if (result.err === 'noApplicationFound') {
          return null;
        }
        throw new Error(errorInfo.message);
      }
      
      return result.ok;
    },
    enabled: !!actor && isReady && !isInitializing && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    application: query.data,
    isLoading: isInitializing || query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasApplication: query.data !== null && query.data !== undefined,
  };
}
