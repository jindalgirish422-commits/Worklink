import React from 'react';

export interface LoadingStateProps {
  type?: 'card' | 'list' | 'spinner';
  message?: string;
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'card',
  message = 'Scanning eligible workers in 10 km service zone...',
  count = 3,
  className = '',
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
        <div className="w-8 h-8 rounded-full border-2 border-black/10 border-t-[#0071E3] animate-spin mb-4" />
        <p className="text-xs font-medium text-[#6E6E73]">{message}</p>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-[#FFFFFF] border border-black/5 rounded-2xl animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-black/5 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3.5 w-32 bg-black/5 rounded" />
                <div className="h-2.5 w-24 bg-black/5 rounded" />
              </div>
            </div>
            <div className="h-8 w-20 bg-black/5 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // Card skeleton
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-[#FFFFFF] border border-black/5 rounded-3xl animate-pulse space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-black/5 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 w-36 bg-black/5 rounded" />
                <div className="h-3 w-48 bg-black/5 rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-black/5 rounded-full" />
          </div>
          <div className="h-3 w-full bg-black/5 rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-black/5 rounded-full" />
            <div className="h-6 w-20 bg-black/5 rounded-full" />
            <div className="h-6 w-24 bg-black/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
