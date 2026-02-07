import { useAuth } from '@/features/auth/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function AppHeader() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-teal-600">Helthcare Reception</h1>
        {isAuthenticated && (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
