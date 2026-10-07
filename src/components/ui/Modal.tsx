import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth,
  size,
}) => {
  const effectiveSize = (size || maxWidth || 'lg') as 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm sm:backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog Body / Mobile Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthStyles[effectiveSize] || 'max-w-xl'} bg-white/95 backdrop-blur-md sm:backdrop-blur-xl border-t sm:border border-white/90 rounded-t-3xl sm:rounded-3xl shadow-[0_20px_48px_-10px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden mt-auto sm:my-auto z-10 motion-bottom-sheet-appear sm:motion-glass-appear flex flex-col max-h-[92vh] sm:max-h-[90vh] glass-specular-edge`}
      >
        {/* Mobile Bottom Sheet Grab Handle */}
        <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-black/5 bg-white/80 sm:bg-white/70 backdrop-blur-md">
            <div className="pr-4 sm:pr-6">
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 -mt-1 sm:mr-0 sm:mt-0 rounded-full text-[#86868B] hover:text-[#111111] hover:bg-black/5 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-black/5 bg-[#FBFBFD]/90 sm:bg-[#FBFBFD]/80 backdrop-blur-md flex items-center justify-end gap-2.5 sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
