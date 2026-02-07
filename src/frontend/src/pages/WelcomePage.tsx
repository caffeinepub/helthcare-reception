import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome to helthcare reception.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect healthcare professionals with reception opportunities
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate({ to: '/login' })}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
