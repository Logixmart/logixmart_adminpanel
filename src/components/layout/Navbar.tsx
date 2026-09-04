import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { checkServerHealth } from '../../api/admin';
import { CompanyLogo } from '../ui/CompanyLogo';
import { useTheme } from '../../theme';
import { getPageMeta } from '../../config/pageMeta';

interface NavbarProps {
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const { title, description } = getPageMeta(activeTab);

  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkServerHealth();
      setIsOnline(health.success && health.status === 'UP');
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="min-h-[70px] border-b border-brand-border bg-brand-card/70 backdrop-blur-md flex justify-between items-center px-4 sm:px-8 py-3 sticky top-0 z-[90] gap-4 sm:gap-6 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
        <h2 className="text-base sm:text-lg font-bold text-text-primary leading-tight">{title}</h2>
        <p className="text-[11px] sm:text-xs text-text-muted line-clamp-2 sm:line-clamp-1">{description}</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="bg-transparent border-none text-text-secondary cursor-pointer flex items-center justify-center w-9 h-9 rounded-md border border-transparent transition-all duration-200 hover:bg-brand-border hover:text-text-primary relative"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-[1px] h-6 bg-brand-border" />

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-brand-dark border border-brand-border shadow-sm overflow-hidden flex items-center justify-center p-1.5">
            <CompanyLogo className="w-full h-full" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              Admin Portal
              <span
                className={`w-2 h-2 rounded-full inline-block transition-all duration-300 ${
                  isOnline === true
                    ? 'bg-accent-secondary shadow-[0_0_8px_#10b981]'
                    : isOnline === false
                      ? 'bg-accent-danger shadow-[0_0_8px_#ef4444]'
                      : 'bg-text-muted'
                }`}
                title={
                  isOnline === true
                    ? 'Server is online'
                    : isOnline === false
                      ? 'Server is offline'
                      : 'Checking connection...'
                }
              />
            </span>
            <span className="text-[10px] text-text-muted font-medium">Console Operator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
