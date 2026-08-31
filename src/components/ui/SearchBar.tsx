import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  children,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 bg-brand-card/50 border border-brand-border rounded-xl p-4">
      <div className="flex-1 relative flex items-center">
        <Search
          className="absolute left-3 text-text-muted pointer-events-none"
          size={16}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-2 px-9 bg-brand-dark/50 border border-brand-border rounded-lg outline-none text-xs text-text-primary transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/85"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer flex items-center"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default SearchBar;
