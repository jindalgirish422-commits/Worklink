import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`card-premium p-10 sm:p-14 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#F0F0F2] text-[#6E6E73] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 max-w-md leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
