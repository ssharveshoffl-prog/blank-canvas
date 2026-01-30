import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { InfinityMark } from '@/components/InfinityMark';

interface LandingTransitionProps {
  onComplete: () => void;
}

export function LandingTransition({ onComplete }: LandingTransitionProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    // Enter phase
    const enterTimer = setTimeout(() => setPhase('show'), 100);
    
    // Show phase duration
    const showTimer = setTimeout(() => setPhase('exit'), 3500);
    
    // Complete and transition out
    const exitTimer = setTimeout(() => onComplete(), 4500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
        "transition-all duration-1000 ease-out",
        phase === 'enter' && "opacity-0",
        phase === 'show' && "opacity-100",
        phase === 'exit' && "opacity-0"
      )}
    >
      {/* Title */}
      <h1
        className={cn(
          "font-serif text-4xl md:text-6xl lg:text-7xl font-light text-foreground tracking-wide mb-8",
          "transition-all duration-700 ease-out",
          phase === 'enter' && "opacity-0 translate-y-4",
          phase === 'show' && "opacity-100 translate-y-0",
          phase === 'exit' && "opacity-0 -translate-y-4"
        )}
      >
        Our Little Infinity
      </h1>

      {/* Infinity Symbol Image */}
      <div
        className={cn(
          "transition-all duration-700 ease-out delay-300",
          phase === 'enter' && "opacity-0 scale-95",
          phase === 'show' && "opacity-100 scale-100",
          phase === 'exit' && "opacity-0 scale-95"
        )}
      >
        <InfinityMark className="w-40 h-20 animate-infinity-breathe" tone="pink" />
      </div>

      {/* Subtle tagline */}
      <p
        className={cn(
          "mt-8 text-muted-foreground/60 font-sans text-sm tracking-widest uppercase",
          "transition-all duration-700 ease-out delay-500",
          phase === 'enter' && "opacity-0",
          phase === 'show' && "opacity-100",
          phase === 'exit' && "opacity-0"
        )}
      >
        Forever ours
      </p>
    </div>
  );
}
