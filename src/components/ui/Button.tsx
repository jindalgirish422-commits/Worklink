import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      icon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles: calm, refined, Apple-inspired pill/rounded corners
    const baseStyles =
      'inline-flex items-center justify-center font-medium select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover-lift active-press motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2';

    // Size variants
    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2.5 rounded-xl gap-2',
      lg: 'text-sm sm:text-base px-6 py-3.5 rounded-2xl gap-2.5 font-semibold',
    };

    // Visual variants
    const variantStyles = {
      primary:
        'bg-[#111111] hover:bg-[#222222] text-white shadow-sm hover:shadow',
      secondary:
        'bg-[#F0F0F2] hover:bg-[#E5E5EA] text-[#111111]',
      accent:
        'bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062C4] text-white shadow-sm hover:shadow',
      outline:
        'bg-transparent hover:bg-black/[0.03] text-[#111111] border border-black/10 hover:border-black/20',
      ghost:
        'bg-transparent hover:bg-black/[0.04] text-[#111111]',
      danger:
        'bg-[#FF3B30] hover:bg-[#E0352A] text-white shadow-sm',
      warning:
        'bg-[#FF9500] hover:bg-[#E08500] text-white shadow-sm',
    };

    const effectiveLeftIcon = leftIcon;
    const effectiveRightIcon = rightIcon || icon;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {effectiveLeftIcon && <span className="shrink-0">{effectiveLeftIcon}</span>}
            <span>{children}</span>
            {effectiveRightIcon && <span className="shrink-0">{effectiveRightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
