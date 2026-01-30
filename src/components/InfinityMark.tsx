import { useId } from 'react';
import { cn } from '@/lib/utils';

type InfinityTone = 'red' | 'pink';

const TONES: Record<InfinityTone, { base: string; glow: string; hi1: string; hi2: string }> = {
  red: {
    base: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.35)',
    hi1: 'rgba(255, 255, 255, 0.85)',
    hi2: 'rgba(239, 68, 68, 0.0)',
  },
  pink: {
    base: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.35)',
    hi1: 'rgba(255, 255, 255, 0.85)',
    hi2: 'rgba(251, 113, 133, 0.0)',
  },
};

export function InfinityMark({
  className,
  tone = 'pink',
}: {
  className?: string;
  tone?: InfinityTone;
}) {
  const id = useId();
  const t = TONES[tone];

  // Simple, thick infinity mark (like the reference image)
  const d =
    'M 20 30 C 20 10 50 10 60 30 C 70 50 100 50 100 30 C 100 10 70 10 60 30 C 50 50 20 50 20 30';

  return (
    <svg
      viewBox="0 0 120 60"
      fill="none"
      role="img"
      aria-label="Infinity"
      className={cn('infinity-mark', className)}
    >
      <defs>
        <linearGradient id={`${id}-chase`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={t.hi2} />
          <stop offset="35%" stopColor={t.hi1} />
          <stop offset="70%" stopColor={t.hi2} />
        </linearGradient>
      </defs>

      {/* Base stroke */}
      <path
        d={d}
        pathLength={100}
        stroke={t.base}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
        style={{ filter: `drop-shadow(0 0 10px ${t.glow})` }}
      />

      {/* Chasing highlight stroke */}
      <path
        d={d}
        pathLength={100}
        className="infinity-chase"
        stroke={`url(#${id}-chase)`}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 12px ${t.glow})` }}
      />
    </svg>
  );
}

