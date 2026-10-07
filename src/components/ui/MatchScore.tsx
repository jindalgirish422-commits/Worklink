import React from 'react';

export interface MatchScoreProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Score styling
  const isOptimal = clampedScore >= 90;
  const isStrong = clampedScore >= 75 && clampedScore < 90;

  const scoreColor = isOptimal
    ? 'text-[#0071E3]'
    : isStrong
    ? 'text-[#111111]'
    : 'text-[#6E6E73]';

  const badgeBg = isOptimal
    ? 'bg-[rgba(0,113,227,0.08)] border-[rgba(0,113,227,0.2)]'
    : 'bg-[#F0F0F2] border-black/5';

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${badgeBg} ${scoreColor} ${className}`}
      >
        <span>{clampedScore}%</span>
        {showLabel && <span className="text-[10px] uppercase font-semibold text-[#86868B]">Match</span>}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-end ${className}`}>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            {clampedScore}%
          </span>
          {showLabel && (
            <span className="text-xs uppercase font-bold tracking-wider text-[#0071E3]">
              Match
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#86868B] font-medium">Multi-Factor Fit</span>
      </div>
    );
  }

  // Default 'md'
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${badgeBg} ${className}`}>
      <span className={`text-sm font-extrabold tracking-tight ${scoreColor}`}>
        {clampedScore}%
      </span>
      {showLabel && (
        <span className="text-[10px] uppercase font-bold tracking-wide text-[#6E6E73]">
          Match
        </span>
      )}
    </div>
  );
};
