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
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xl transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog Body */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthStyles[maxWidth]} glass-surface-strong bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] overflow-hidden my-auto z-10 animate-slide-up flex flex-col max-h-[90vh] glass-specular-edge ring-1 ring-black/5`}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-black/5 bg-white/70 backdrop-blur-md">
            <div className="pr-6">
              {title && (
                <h3 className="text-lg font-bold text-[#111111] tracking-tight">
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
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#111111] hover:bg-black/5 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-black/5 bg-[#FBFBFD]/80 backdrop-blur-md flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
