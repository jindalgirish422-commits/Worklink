import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  shortcutBadge?: string;
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search skilled workers, trades, or locations...',
      shortcutBadge = '⌘K',
      className = '',
      ...props
    },
    ref
  ) => {
    const hasValue = Boolean(value);

    return (
      <div className="relative w-full flex items-center">
        <div className="absolute left-3.5 text-[#86868B] pointer-events-none flex items-center">
          <SearchIcon className="w-4 h-4" />
        </div>

        <input
          type="text"
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-[#FFFFFF] border border-black/10 hover:border-black/20 text-[#111111] text-xs sm:text-sm rounded-xl py-2.5 pl-10 pr-16 transition-all duration-200 placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent ${className}`}
          {...props}
        />

        <div className="absolute right-3 flex items-center space-x-1.5">
          {hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-md text-[#86868B] hover:text-[#111111] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : shortcutBadge ? (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#86868B] bg-[#F5F5F7] border border-black/5 rounded">
              {shortcutBadge}
            </kbd>
          ) : null}
        </div>
      </div>
    );
  }
);

Search.displayName = 'Search';
