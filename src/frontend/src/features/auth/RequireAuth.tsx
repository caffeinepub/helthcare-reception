import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from './AuthContext';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
