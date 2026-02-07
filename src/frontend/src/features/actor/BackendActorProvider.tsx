import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type backendInterface } from '@/backend';
import { createActorWithConfig } from '@/config';
import { getSecretParameter } from '@/utils/urlParams';
import { useAuth } from '../auth/AuthContext';
import { RetryPolicy } from './actorInitRetry';

interface BackendActorContextType {
  actor: backendInterface | null;
  isReady: boolean;
  isInitializing: boolean;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  initError: string | null;
  retry: () => void;
}

const BackendActorContext = createContext<BackendActorContextType | undefined>(undefined);

export function BackendActorProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);
  const { isAuthenticated, currentUserEmail } = useAuth();
  const queryClient = useQueryClient();

  const initializeActor = useCallback(async (retryPolicy: RetryPolicy) => {
    setIsInitializing(true);
    setIsReady(false);
    setInitError(null);
    setRetryCount(0);
    setIsRetrying(false);

    // Cancel and reset stale profile query state using predicate to match all variations
    queryClient.cancelQueries({
      predicate: (query) => query.queryKey[0] === 'currentUserProfile'
    });
    queryClient.resetQueries({
      predicate: (query) => query.queryKey[0] === 'currentUserProfile'
    });

    try {
      await retryPolicy.execute(
        async () => {
          // Create actor (anonymous for now, since we use email/password auth)
          const newActor = await createActorWithConfig();

          // Initialize access control with secret
          const adminToken = getSecretParameter('caffeineAdminToken') || '';
          await newActor._initializeAccessControlWithSecret(adminToken);

          setActor(newActor);
          setIsReady(true);
          setIsRetrying(false);

          // Only invalidate specific actor-dependent queries after actor is ready
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'currentUserProfile'
          });
          queryClient.invalidateQueries({ queryKey: ['myJobApplication'] });
          queryClient.invalidateQueries({ queryKey: ['applicantsByLocation'] });
        },
        (state) => {
          // On retry callback
          setIsRetrying(true);
          setRetryCount(state.attempt);
        }
      );
    } catch (error) {
      console.error('Failed to initialize backend actor after retries:', error);
      setActor(null);
      setIsReady(false);
      setIsRetrying(false);
      setInitError('Unable to connect to the backend system. Please check your connection and try again.');
    } finally {
      setIsInitializing(false);
    }
  }, [queryClient]);

  const retry = useCallback(() => {
    const retryPolicy = new RetryPolicy();
    initializeActor(retryPolicy);
  }, [initializeActor]);

  useEffect(() => {
    const retryPolicy = new RetryPolicy();
    initializeActor(retryPolicy);

    return () => {
      retryPolicy.cancel();
    };
  }, [isAuthenticated, initializeActor]);

  return (
    <BackendActorContext.Provider
      value={{
        actor,
        isReady,
        isInitializing,
        isRetrying,
        retryCount,
        maxRetries: 5,
        initError,
        retry,
      }}
    >
      {children}
    </BackendActorContext.Provider>
  );
}

export function useBackendActor() {
  const context = useContext(BackendActorContext);
  if (context === undefined) {
    throw new Error('useBackendActor must be used within a BackendActorProvider');
  }
  return context;
}
