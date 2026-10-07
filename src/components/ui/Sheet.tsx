import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  position?: 'right' | 'bottom';
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'right',
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 right-0 max-w-full flex ${position === 'bottom' ? 'items-end' : ''}`}>
        <div
          role="dialog"
          aria-modal="true"
          className={`w-screen max-w-md bg-[#FFFFFF] shadow-2xl border-l border-black/10 flex flex-col z-10 animate-slide-up ${
            position === 'bottom'
              ? 'h-[85vh] rounded-t-3xl border-t border-l-0'
              : 'h-full'
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-black/5 flex items-start justify-between bg-[#FFFFFF]">
            <div>
              {title && (
                <h3 className="text-base font-bold text-[#111111] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#86868B] hover:text-[#111111] hover:bg-black/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
