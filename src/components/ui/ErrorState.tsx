import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Zone Calculation Notice',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-6 bg-[rgba(255,59,48,0.04)] border border-[rgba(255,59,48,0.18)] rounded-3xl max-w-xl mx-auto my-6 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[rgba(255,59,48,0.1)] text-[#FF3B30] flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-bold text-[#111111] tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-[#6E6E73] mt-1 max-w-md leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
