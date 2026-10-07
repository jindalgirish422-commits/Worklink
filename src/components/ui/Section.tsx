import React from 'react';

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  badge?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

export const Section: React.FC<SectionProps> = ({
  badge,
  title,
  description,
  actions,
  spacing = 'md',
  children,
  className = '',
  ...props
}) => {
  const spacingStyles = {
    none: 'py-0',
    sm: 'py-6 sm:py-8',
    md: 'py-10 sm:py-14',
    lg: 'py-16 sm:py-24',
  };

  return (
    <section className={`${spacingStyles[spacing]} ${className}`} {...props}>
      {(badge || title || description || actions) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            {badge && <div className="mb-2.5">{badge}</div>}
            {title && (
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#111111] leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[#6E6E73] mt-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
