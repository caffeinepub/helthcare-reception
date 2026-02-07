import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

interface AsyncFallbackStateProps {
  state: 'loading' | 'error' | 'empty';
  title?: string;
  message: string;
  actions?: {
    retry?: () => void;
    goToLogin?: boolean;
    goToOnboarding?: boolean;
    customAction?: { label: string; onClick: () => void };
  };
  children?: ReactNode;
}

/**
 * Reusable fallback UI component for async operations
 * Handles loading, error, and empty states with consistent English messaging
 */
export default function AsyncFallbackState({
  state,
  title,
  message,
  actions,
  children,
}: AsyncFallbackStateProps) {
  const navigate = useNavigate();

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{message}</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            {actions?.retry && (
              <Button onClick={actions.retry} className="flex-1" variant="default">
                Retry
              </Button>
            )}
            {actions?.goToLogin && (
              <Button
                onClick={() => navigate({ to: '/login' })}
                className="flex-1"
                variant="outline"
              >
                Go to Login
              </Button>
            )}
            {actions?.goToOnboarding && (
              <Button
                onClick={() => navigate({ to: '/onboarding/role' })}
                className="flex-1"
                variant="outline"
              >
                Complete Onboarding
              </Button>
            )}
            {actions?.customAction && (
              <Button
                onClick={actions.customAction.onClick}
                className="flex-1"
                variant="outline"
              >
                {actions.customAction.label}
              </Button>
            )}
          </div>
          {children}
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <Info className="h-12 w-12 text-muted-foreground mx-auto" />
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              <p className="text-muted-foreground">{message}</p>
            </div>
            {(actions?.retry || actions?.goToLogin || actions?.customAction) && (
              <div className="flex gap-2">
                {actions?.retry && (
                  <Button onClick={actions.retry} className="flex-1">
                    Retry
                  </Button>
                )}
                {actions?.goToLogin && (
                  <Button
                    onClick={() => navigate({ to: '/login' })}
                    className="flex-1"
                    variant="outline"
                  >
                    Go to Login
                  </Button>
                )}
                {actions?.customAction && (
                  <Button
                    onClick={actions.customAction.onClick}
                    className="flex-1"
                    variant="default"
                  >
                    {actions.customAction.label}
                  </Button>
                )}
              </div>
            )}
            {children}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
