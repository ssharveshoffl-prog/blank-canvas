import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { InfinityMark } from '@/components/InfinityMark';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = login(username.toLowerCase().trim(), password);
    
    if (success) {
      onLoginSuccess();
    } else {
      setError('Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div 
        className={cn(
          "w-full max-w-sm space-y-8",
          "transition-all duration-1000 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Logo */}
        <div className="text-center space-y-4">
          <InfinityMark className="w-24 h-12 mx-auto animate-infinity-breathe" tone="pink" />
          <h1 className="font-serif text-3xl font-light text-foreground tracking-wide">
            Our Little Infinity
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            A private space for us
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                "h-12 text-center font-sans bg-secondary/30 border-border/50",
                "focus:bg-background focus:border-ring",
                "placeholder:text-muted-foreground/50",
                "transition-gentle"
              )}
              disabled={isLoading}
              autoComplete="username"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "h-12 text-center font-sans bg-secondary/30 border-border/50",
                "focus:bg-background focus:border-ring",
                "placeholder:text-muted-foreground/50",
                "transition-gentle"
              )}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-destructive font-sans animate-fade-in">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={!username || !password || isLoading}
            className={cn(
              "w-full h-12 font-sans font-medium",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "shadow-warm hover:shadow-warm-lg",
              "transition-gentle",
              "disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enter'
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-muted-foreground/50 text-xs font-sans">
          A private space for two
        </p>
      </div>
    </div>
  );
}
