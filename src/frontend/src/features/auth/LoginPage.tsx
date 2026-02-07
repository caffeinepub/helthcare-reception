import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from './AuthContext';
import { useBackendActor } from '../actor/BackendActorProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { mapBackendError, isErrorResult } from '@/utils/backendErrors';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor, isReady, isInitializing, isRetrying, retryCount, maxRetries, initError, retry } = useBackendActor();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!actor || !isReady) {
      return;
    }

    setLoading(true);
    try {
      const result = await actor.authenticateUser(email, password);
      
      // Handle Result type properly
      if (isErrorResult(result)) {
        const errorInfo = mapBackendError(result.err);
        setError(errorInfo.message);
      } else {
        // Success - set authenticated state and navigate
        login(email);
        navigate({ to: '/onboarding/role' });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !isReady || !email || !password;

  // Show terminal failure state with retry option
  const showTerminalFailure = initError && !isInitializing && !isRetrying;

  // Show connecting/retrying status
  const showConnectingStatus = (isInitializing || isRetrying) && !showTerminalFailure;

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {showConnectingStatus && (
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRetrying ? (
                      <span>
                        Connecting to the system... (attempt {retryCount} of {maxRetries})
                      </span>
                    ) : (
                      <span>Connecting to the system, please wait...</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {showTerminalFailure && (
                <Alert variant="destructive">
                  <AlertDescription className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{initError}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={retry}
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Connection
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => navigate({ to: '/signup' })}
                >
                  Create new account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
