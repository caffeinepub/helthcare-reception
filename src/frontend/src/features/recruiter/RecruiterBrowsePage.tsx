import { useApplicantsByLocation } from './useApplicantsByLocation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, MapPin, User } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

export default function RecruiterBrowsePage() {
  const { applicants, isLoading, location } = useApplicantsByLocation();

  if (isLoading) {
    return (
      <AppLayout showNav>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav>
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Available Receptionists</h1>
            {location && (
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {location.city}, {location.district}, {location.state}, {location.country}
              </p>
            )}
          </div>

          {applicants.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-lg text-muted-foreground">
                    No applicants found in your area yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new applications.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {applicants.map((applicant) => (
                <Card key={applicant.userId.toString()} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      {applicant.photo ? (
                        <img
                          src={applicant.photo.getDirectURL()}
                          alt={applicant.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{applicant.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {applicant.gender}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{applicant.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {applicant.location.city}, {applicant.location.district}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
