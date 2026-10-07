import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      prefixIcon,
      suffixIcon,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const effectivePrefix = leftIcon || prefixIcon;
    const effectiveSuffix = rightIcon || suffixIcon;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#111111] mb-1.5 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {effectivePrefix && (
            <div className="absolute left-3.5 text-[#86868B] pointer-events-none flex items-center">
              {effectivePrefix}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#FFFFFF] border text-[#111111] text-xs sm:text-sm rounded-xl py-2.5 transition-all duration-200 placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent ${
              effectivePrefix ? 'pl-10' : 'pl-3.5'
            } ${effectiveSuffix ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-[#FF3B30] focus:ring-[#FF3B30]'
                : 'border-black/10 hover:border-black/20'
            } ${className}`}
            {...props}
          />

          {effectiveSuffix && (
            <div className="absolute right-3.5 text-[#86868B] pointer-events-none flex items-center">
              {effectiveSuffix}
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-[#FF3B30] font-medium animate-fade-in">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-[#6E6E73]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
