import { useQuery } from '@tanstack/react-query';
import { useBackendActor } from '../actor/BackendActorProvider';
import { useAuth } from '../auth/AuthContext';
import type { UserProfile } from '@/backend';

export function useOnboardingStatus() {
  const { actor, isReady, isInitializing, isRetrying } = useBackendActor();
  const { isAuthenticated, currentUserEmail } = useAuth();

  const query = useQuery<UserProfile | null>({
    // Key by user email to prevent cross-user cache reuse
    queryKey: ['currentUserProfile', currentUserEmail],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    // Only enable when actor is fully ready and user is authenticated
    enabled: !!actor && isReady && !isInitializing && isAuthenticated,
    // Enable retry with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
    // Prevent refetching while actor is initializing
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Determine if we're in a loading/connecting state
  const isLoadingOrConnecting = isInitializing || isRetrying || query.isLoading || query.isFetching;
  
  // Only consider it fetched if actor is ready and query has completed
  const isTrulyFetched = isReady && !isInitializing && query.isFetched;
  
  // Only show error if retries are exhausted and actor is ready
  const isTerminalError = query.isError && !query.isFetching && isReady && !isInitializing;

  // Distinguish between null profile (not found) and error
  const isProfileNull = isTrulyFetched && query.data === null && !query.isError;

  return {
    profile: query.data,
    isLoading: isLoadingOrConnecting,
    isFetched: isTrulyFetched,
    isError: isTerminalError,
    isProfileNull,
    error: query.error,
    refetch: query.refetch,
    isRetrying: query.isFetching && query.isError,
  };
}
