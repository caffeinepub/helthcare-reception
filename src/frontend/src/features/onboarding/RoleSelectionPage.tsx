import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useBackendActor } from '../actor/BackendActorProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Briefcase, Users, AlertCircle } from 'lucide-react';
import { UserRole, Error_ } from '@/backend';
import AppLayout from '@/components/AppLayout';
import { mapBackendError, isErrorResult } from '@/utils/backendErrors';
import AsyncFallbackState from '@/components/AsyncFallbackState';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { actor, isReady, isInitializing, isRetrying, retry } = useBackendActor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);

  const handleRoleSelect = async (role: UserRole) => {
    if (!actor || !isReady) {
      setError('System not ready. Please wait or retry.');
      setIsAuthError(false);
      return;
    }

    setLoading(true);
    setError('');
    setIsAuthError(false);
    try {
      const result = await actor.setUserRole(role);
      
      // Handle Result type properly
      if (isErrorResult(result)) {
        const errorInfo = mapBackendError(result.err);
        setError(errorInfo.message);
        // Check if this is an authorization/session error
        if (result.err === Error_.unauthorized || result.err === Error_.profileNotFound) {
          setIsAuthError(true);
        }
      } else {
        // Success - navigate to location step
        navigate({ to: '/onboarding/location' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set role. Please try again.');
      setIsAuthError(false);
    } finally {
      setLoading(false);
    }
  };

  // Show connecting state while actor is initializing
  if (isInitializing || isRetrying) {
    return (
      <AsyncFallbackState
        state="loading"
        message="Connecting to the system..."
      />
    );
  }

  // Show error state if actor failed to initialize
  if (!actor || !isReady) {
    return (
      <AsyncFallbackState
        state="error"
        title="Connection Failed"
        message="Unable to connect to the system. Please retry or go back to login."
        actions={{
          retry: () => retry(),
          goToLogin: true,
        }}
      />
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Choose Your Role</h1>
            <p className="text-muted-foreground">
              Select your role to get started with Helthcare Reception
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>{error}</p>
                {isAuthError && (
                  <Button
                    onClick={() => navigate({ to: '/login' })}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Go to Login
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            <button
              onClick={() => handleRoleSelect(UserRole.jobSeeker)}
              disabled={loading}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-8 text-left transition-all hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="rounded-full bg-white/20 p-3">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold text-white">Search for reception job</h2>
                  <p className="text-red-100">
                    Create your profile and apply for reception positions in healthcare facilities
                  </p>
                </div>
              </div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => handleRoleSelect(UserRole.recruiter)}
              disabled={loading}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-left transition-all hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="rounded-full bg-white/20 p-3">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold text-white">Search for receptionist</h2>
                  <p className="text-blue-100">
                    Find qualified reception professionals in your area for your healthcare facility
                  </p>
                </div>
              </div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
