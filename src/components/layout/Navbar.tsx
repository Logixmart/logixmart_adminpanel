import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { checkServerHealth } from '../../api/admin';
import { CompanyLogo } from '../ui/CompanyLogo';
import { useTheme } from '../../theme';

interface NavbarProps {
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkServerHealth();
      setIsOnline(health.success && health.status === 'UP');
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'admin-details':
        return 'Admin Profile';
      case 'blogs':
        return 'Blogs Management Portal';
      case 'jobs':
        return 'Jobs Management Portal';
      case 'job-applications':
        return 'Job Applications';
      case 'query':
        return 'Query Portal';
      case 'client-reviews':
        return 'Client Reviews';
      case 'our-work':
        return 'Our Work';
      default:
        return 'Console Gateway';
    }
  };

  return (
    <header className="h-[70px] border-b border-brand-border bg-brand-card/70 backdrop-blur-md flex justify-between items-center px-8 sticky top-0 z-[90]">
      <h2 className="text-lg font-bold text-text-primary capitalize">{getPageTitle()}</h2>

      <div className="flex items-center relative max-w-[320px] w-full">
        <Search className="absolute left-3 text-text-muted pointer-events-none" size={16} />
        <input
          type="text"
          placeholder="Search repositories, deployments, APIs..."
          className="w-full py-2 pl-9 pr-4 bg-brand-dark/50 border border-brand-border rounded-md outline-none text-[13px] text-text-primary transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/80 focus:ring-2 focus:ring-accent-primary-glow"
        />
      </div>

      <div className="flex items-center gap-5">
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
          <div className="flex flex-col">
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
