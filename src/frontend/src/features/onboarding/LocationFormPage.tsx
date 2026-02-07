import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '@/hooks/useActor';
import { useOnboardingStatus } from './useOnboardingStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { Location } from '@/backend';
import AppLayout from '@/components/AppLayout';

export default function LocationFormPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { profile } = useOnboardingStatus();
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!city || !district || !state || !country) {
      setError('Please fill in all location fields');
      return;
    }

    if (!actor) {
      setError('System not ready. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const location: Location = { city, district, state, country };
      await actor.setUserLocation(location);

      if (profile?.role === 'jobSeeker') {
        navigate({ to: '/job-seeker/apply' });
      } else {
        navigate({ to: '/recruiter/browse' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Your Location</CardTitle>
            <CardDescription className="text-center">
              Tell us where you're located to connect with opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="Enter your district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter your state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Enter your country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
