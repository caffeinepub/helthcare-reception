import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStatus } from '@/features/onboarding/useOnboardingStatus';
import { Button } from '@/components/ui/button';
import { Home, Users } from 'lucide-react';

export default function AppNav() {
  const navigate = useNavigate();
  const { profile } = useOnboardingStatus();

  if (!profile?.role) return null;

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex gap-2">
          {profile.role === 'jobSeeker' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/job-seeker/home' })}
            >
              <Home className="h-4 w-4 mr-2" />
              My Application
            </Button>
          )}
          {profile.role === 'recruiter' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/recruiter/browse' })}
            >
              <Users className="h-4 w-4 mr-2" />
              Browse Applicants
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
