import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline' | 'primary';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium tracking-tight',
  };

  const variantStyles = {
    default: 'bg-[#F0F0F2] text-[#111111] border border-black/5',
    accent: 'bg-[rgba(0,113,227,0.08)] text-[#0071E3] border border-[rgba(0,113,227,0.2)]',
    success: 'bg-[rgba(52,199,89,0.1)] text-[#1B8738] border border-[rgba(52,199,89,0.22)]',
    warning: 'bg-[rgba(255,149,0,0.1)] text-[#B25E00] border border-[rgba(255,149,0,0.22)]',
    danger: 'bg-[rgba(255,59,48,0.08)] text-[#D70015] border border-[rgba(255,59,48,0.2)]',
    neutral: 'bg-black/5 text-[#6E6E73]',
    outline: 'bg-transparent text-[#6E6E73] border border-black/10',
    primary: 'bg-[#111111] text-white border border-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
