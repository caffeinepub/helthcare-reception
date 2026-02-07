import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppNav from './AppNav';
import { Heart } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function AppLayout({ children, showNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      {showNav && <AppNav />}
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
