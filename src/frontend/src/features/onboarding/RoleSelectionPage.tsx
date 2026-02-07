import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Briefcase, Users } from 'lucide-react';
import { UserRole } from '@/backend';
import AppLayout from '@/components/AppLayout';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = async (role: UserRole) => {
    if (!actor) {
      setError('System not ready. Please try again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await actor.setUserRole(role);
      navigate({ to: '/onboarding/location' });
    } catch (err: any) {
      setError(err.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Choose Your Path</h1>
            <p className="text-muted-foreground">Select how you'd like to use Helthcare Reception</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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
