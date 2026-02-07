import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMyApplication } from './useMyApplication';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { Gender, ExternalBlob, type Location, type VoidResult } from '@/backend';
import AppLayout from '@/components/AppLayout';
import AsyncFallbackState from '@/components/AsyncFallbackState';
import { isErrorResult, mapBackendError } from '@/utils/backendErrors';

export default function JobSeekerHomePage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { application, isLoading, isError, error, refetch, hasApplication } = useMyApplication();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.male);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (application) {
      setName(application.name);
      setPhone(application.phone);
      setGender(application.gender);
      setCity(application.location.city);
      setDistrict(application.location.district);
      setState(application.location.state);
      setCountry(application.location.country);
      if (application.photo) {
        setPreviewUrl(application.photo.getDirectURL());
      }
    }
  }, [application]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSaveError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSaveError('');
    }
  };

  const handleSave = async () => {
    setSaveError('');
    setSuccess(false);

    if (!name || !phone || !city || !district || !state || !country) {
      setSaveError('Please fill in all fields');
      return;
    }

    if (!actor) {
      setSaveError('System not ready. Please try again.');
      return;
    }

    setSaving(true);
    try {
      const location: Location = { city, district, state, country };
      let photoBlob: ExternalBlob;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        photoBlob = ExternalBlob.fromBytes(bytes);
      } else if (application?.photo) {
        photoBlob = application.photo;
      } else {
        setSaveError('Photo is required');
        setSaving(false);
        return;
      }

      const result: VoidResult = await actor.updateJobApplication(location, photoBlob);
      
      // Handle backend Result type
      if (isErrorResult(result)) {
        const errorInfo = mapBackendError(result.err);
        setSaveError(errorInfo.message);
      } else {
        setSuccess(true);
        setEditing(false);
        await refetch();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout showNav>
        <AsyncFallbackState state="loading" message="Loading your application..." />
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout showNav>
        <AsyncFallbackState
          state="error"
          title="Unable to Load Application"
          message={error?.message || 'An error occurred while loading your application. Please try again.'}
          actions={{
            retry: () => refetch(),
            goToLogin: true,
          }}
        />
      </AppLayout>
    );
  }

  if (!hasApplication || !application) {
    return (
      <AppLayout showNav>
        <AsyncFallbackState
          state="empty"
          title="No Application Found"
          message="You haven't submitted an application yet. Create one to get started."
          actions={{
            customAction: {
              label: 'Create Application',
              onClick: () => navigate({ to: '/job-seeker/apply' }),
            },
            retry: () => refetch(),
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav>
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Application</h1>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Edit Information</Button>
            )}
          </div>

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Application updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {saveError && (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                {editing ? 'Update your information below' : 'Your current application details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {editing ? (
                  <div className="space-y-4 text-center">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="mx-auto h-32 w-32 object-cover rounded-full"
                      />
                    )}
                    <Label htmlFor="photo" className="cursor-pointer">
                      <span className="text-teal-600 hover:text-teal-700 font-semibold">
                        Change Photo
                      </span>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={saving}
                      />
                    </Label>
                  </div>
                ) : (
                  previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="h-32 w-32 object-cover rounded-full"
                    />
                  )
                )}
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  {editing ? (
                    <Input value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
                  ) : (
                    <p className="text-lg">{name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-lg">{application.email}</p>
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  {editing ? (
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={saving} />
                  ) : (
                    <p className="text-lg">{phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  {editing ? (
                    <Select value={gender} onValueChange={(value) => setGender(value as Gender)} disabled={saving}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Gender.male}>Male</SelectItem>
                        <SelectItem value={Gender.female}>Female</SelectItem>
                        <SelectItem value={Gender.other}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-lg capitalize">{gender}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  {editing ? (
                    <div className="grid gap-3">
                      <Input
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={saving}
                      />
                      <Input
                        placeholder="District"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        disabled={saving}
                      />
                      <Input
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        disabled={saving}
                      />
                      <Input
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  ) : (
                    <p className="text-lg">
                      {city}, {district}, {state}, {country}
                    </p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setSaveError('');
                      if (application) {
                        setName(application.name);
                        setPhone(application.phone);
                        setGender(application.gender);
                        setCity(application.location.city);
                        setDistrict(application.location.district);
                        setState(application.location.state);
                        setCountry(application.location.country);
                        if (application.photo) {
                          setPreviewUrl(application.photo.getDirectURL());
                        }
                      }
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
