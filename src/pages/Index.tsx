import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/LoginPage';
import { LandingTransition } from '@/components/LandingTransition';
import { MainPage } from '@/components/MainPage';
import { InfinityMark } from '@/components/InfinityMark';

type AppState = 'loading' | 'login' | 'transition' | 'main';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Already logged in, go directly to main
        setAppState('main');
      } else {
        setAppState('login');
      }
    }
  }, [isLoading, user]);

  const handleLoginSuccess = () => {
    setAppState('transition');
  };

  const handleTransitionComplete = () => {
    setAppState('main');
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <InfinityMark className="w-16 h-8 animate-pulse" tone="pink" />
      </div>
    );
  }

  if (appState === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (appState === 'transition') {
    return <LandingTransition onComplete={handleTransitionComplete} />;
  }

  return <MainPage />;
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
