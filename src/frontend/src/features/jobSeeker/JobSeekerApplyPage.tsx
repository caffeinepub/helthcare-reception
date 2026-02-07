import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '@/hooks/useActor';
import { useOnboardingStatus } from '../onboarding/useOnboardingStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload } from 'lucide-react';
import { ExternalBlob, type Location, type VoidResult } from '@/backend';
import AppLayout from '@/components/AppLayout';
import AsyncFallbackState from '@/components/AsyncFallbackState';
import { isErrorResult, mapBackendError } from '@/utils/backendErrors';

export default function JobSeekerApplyPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { profile, isLoading: profileLoading } = useOnboardingStatus();
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!city || !district || !state || !country) {
      setError('Please fill in all location fields');
      return;
    }

    if (!selectedFile) {
      setError('Please upload a photo');
      return;
    }

    if (!actor) {
      setError('System not ready. Please try again.');
      return;
    }

    if (!profile) {
      setError('Your profile is not loaded. Please refresh the page.');
      return;
    }

    setSubmitting(true);
    try {
      const location: Location = { city, district, state, country };
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const photoBlob = ExternalBlob.fromBytes(bytes);

      const result: VoidResult = await actor.submitJobApplication(location, photoBlob);
      
      // Handle backend Result type
      if (isErrorResult(result)) {
        const errorInfo = mapBackendError(result.err);
        setError(errorInfo.message);
      } else {
        navigate({ to: '/job-seeker/home' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <AppLayout showNav>
        <AsyncFallbackState state="loading" message="Loading your profile..." />
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout showNav>
        <AsyncFallbackState
          state="error"
          title="Profile Not Found"
          message="Your profile could not be loaded. Please log in again."
          actions={{
            goToLogin: true,
          }}
        />
      </AppLayout>
    );
  }

  if (!profile.location) {
    return (
      <AppLayout showNav>
        <AsyncFallbackState
          state="empty"
          title="Location Not Set"
          message="Please complete your onboarding to set your location before applying."
          actions={{
            goToOnboarding: true,
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav>
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Application</CardTitle>
              <CardDescription>
                Fill in your details to apply for healthcare reception positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo *</Label>
                  <div className="flex items-center gap-4">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <Label htmlFor="photo" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                        </div>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileSelect}
                          disabled={submitting}
                        />
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Location Details</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Enter district"
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter state"
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Enter country"
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
