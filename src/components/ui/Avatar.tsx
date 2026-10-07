import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  isVerified = false,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeDimensions = {
    xs: 'w-6 h-6 text-[10px] rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-11 h-11 text-sm rounded-xl',
    lg: 'w-14 h-14 text-base rounded-2xl',
    xl: 'w-20 h-20 text-lg rounded-2xl',
  };

  const badgeDimensions = {
    xs: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    sm: 'w-3 h-3 -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 -bottom-1 -right-1',
    lg: 'w-4.5 h-4.5 -bottom-1 -right-1',
    xl: 'w-5 h-5 -bottom-1.5 -right-1.5',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={`relative inline-block shrink-0 ${sizeDimensions[size]} ${className}`}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover border border-black/10 ${sizeDimensions[size]}`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-semibold bg-[#F0F0F2] text-[#6E6E73] border border-black/10 ${sizeDimensions[size]}`}
        >
          {getInitials(alt || 'WL')}
        </div>
      )}

      {isVerified && (
        <div
          className={`absolute flex items-center justify-center bg-[#0071E3] text-white rounded-full ring-2 ring-white shadow-xs ${badgeDimensions[size]}`}
          title="Verified Pro"
        >
          <ShieldCheck className="w-3/4 h-3/4" />
        </div>
      )}
    </div>
  );
};
