import { useState, useEffect } from 'react';
import { useMyApplication } from './useMyApplication';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Save } from 'lucide-react';
import { Gender, ExternalBlob, type Location } from '@/backend';
import AppLayout from '@/components/AppLayout';

export default function JobSeekerHomePage() {
  const { actor } = useActor();
  const { application, isLoading, refetch } = useMyApplication();
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
  const [error, setError] = useState('');
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
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    if (!name || !phone || !city || !district || !state || !country) {
      setError('Please fill in all fields');
      return;
    }

    if (!actor) {
      setError('System not ready. Please try again.');
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
        setError('Photo is required');
        setSaving(false);
        return;
      }

      await actor.updateJobApplication(location, photoBlob);
      setSuccess(true);
      setEditing(false);
      await refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout showNav>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return (
      <AppLayout showNav>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No application found</p>
            </CardContent>
          </Card>
        </div>
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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
                  <Label>City</Label>
                  {editing ? (
                    <Input value={city} onChange={(e) => setCity(e.target.value)} disabled={saving} />
                  ) : (
                    <p className="text-lg">{city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>District</Label>
                  {editing ? (
                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} disabled={saving} />
                  ) : (
                    <p className="text-lg">{district}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  {editing ? (
                    <Input value={state} onChange={(e) => setState(e.target.value)} disabled={saving} />
                  ) : (
                    <p className="text-lg">{state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  {editing ? (
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} disabled={saving} />
                  ) : (
                    <p className="text-lg">{country}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex gap-4">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                      setError('');
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
