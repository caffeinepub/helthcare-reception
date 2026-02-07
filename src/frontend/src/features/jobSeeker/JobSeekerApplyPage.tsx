import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '@/hooks/useActor';
import { useOnboardingStatus } from '../onboarding/useOnboardingStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { ExternalBlob } from '@/backend';
import AppLayout from '@/components/AppLayout';

export default function JobSeekerApplyPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { profile } = useOnboardingStatus();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setSuccess(false);

    if (!selectedFile) {
      setError('Please select a photo to upload');
      return;
    }

    if (!actor || !profile?.location) {
      setError('System not ready. Please try again.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await actor.submitJobApplication(profile.location, blob);
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: '/job-seeker/home' });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Your application applied.</h2>
                <p className="text-muted-foreground">Redirecting to your profile...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Submit Your Application</CardTitle>
            <CardDescription className="text-center">
              Upload your photo to complete your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label>Your Photo</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-4">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mx-auto h-48 w-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        disabled={loading}
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div>
                        <Label htmlFor="photo" className="cursor-pointer">
                          <span className="text-teal-600 hover:text-teal-700 font-semibold">
                            Choose a photo
                          </span>
                          <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={loading}
                          />
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !selectedFile}>
                {loading ? (
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
    </AppLayout>
  );
}
