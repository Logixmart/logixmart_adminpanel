import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  LogOut,
  FileText,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Star,
} from 'lucide-react';
import { CompanyLogo } from '../ui/CompanyLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  adminName: string;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  adminName,
  onLogout,
  mobileOpen,
  onMobileClose,
}) => {
  const menuItems = [
    { id: 'admin-details', label: 'Admin Profile', icon: <User size={20} /> },
    { id: 'blogs', label: 'Blogs Management', icon: <FileText size={20} /> },
    { id: 'jobs', label: 'Jobs Management', icon: <Briefcase size={20} /> },
    {
      id: 'job-applications',
      label: 'Job Applications',
      icon: <ClipboardList size={20} />,
    },
    { id: 'query', label: 'Query', icon: <MessageSquare size={20} /> },
    {
      id: 'client-reviews',
      label: 'Client Reviews',
      icon: <Star size={20} />,
    },
    { id: 'our-work', label: 'Our Work', icon: <Briefcase size={20} /> },
  ];

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <aside
      className={`h-dvh md:h-screen fixed md:sticky top-0 left-0 bg-brand-sidebar border-r border-brand-border flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100] w-[min(86vw,260px)] md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'md:w-[80px]' : 'md:w-[260px]'}`}
    >
      <div
        className={`h-[70px] flex items-center border-b border-brand-border gap-2.5 overflow-hidden ${
          collapsed ? 'px-0 justify-center' : 'px-4'
        }`}
      >
        <div className="flex items-center justify-center min-w-[32px] w-8 h-8">
          <CompanyLogo className="w-[28px] h-[28px]" />
        </div>
        <span
          className={`text-[15px] font-bold tracking-tight whitespace-nowrap transition-opacity duration-300 text-text-primary ${
            collapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          Logix<span className="text-accent-primary">mart</span> IT Solutions
        </span>
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden ml-auto shrink-0 bg-transparent border border-transparent text-text-muted cursor-pointer flex items-center justify-center w-8 h-8 rounded-md hover:bg-brand-hover hover:text-text-primary"
          aria-label="Close navigation menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              onMobileClose();
            }}
            className={`flex items-center gap-3.5 py-3 rounded-lg text-text-secondary font-medium cursor-pointer transition-all duration-200 border border-transparent whitespace-nowrap hover:text-text-primary hover:bg-white/[0.03] ${
              collapsed ? 'px-0 justify-center' : 'px-4'
            } ${
              activeTab === item.id
                ? 'text-text-primary bg-accent-primary-glow border-accent-primary/15 font-semibold'
                : ''
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span
              className={`flex items-center justify-center min-w-[20px] ${
                activeTab === item.id ? 'text-accent-primary' : ''
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`transition-opacity duration-300 text-[14.5px] ${
                collapsed
                  ? 'opacity-0 w-0 pointer-events-none hidden'
                  : 'opacity-100'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      <div
        className={`p-4 border-t border-brand-border flex flex-col gap-3 items-stretch ${
          collapsed ? 'py-4 px-0 items-center justify-center' : ''
        }`}
      >
        <div
          className={`flex items-center justify-between ${
            collapsed ? 'px-0 justify-center' : 'px-2'
          }`}
        >
          {!collapsed ? (
            <div className="flex flex-col overflow-hidden max-w-[150px]">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Operator
              </span>
              <span className="text-xs font-semibold text-text-secondary truncate">
                {adminName}
              </span>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary text-xs font-bold"
              title={adminName}
            >
              {getInitials(adminName)}
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-brand-border hover:text-text-primary"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-brand-border hover:text-text-primary"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <button
          onClick={onLogout}
          className={`cursor-pointer transition-all duration-200 flex gap-2 items-center text-accent-danger bg-accent-danger/5 border border-accent-danger/10 hover:bg-accent-danger/10 hover:border-accent-danger/20 w-full rounded-md py-2 ${
            collapsed ? 'px-0 justify-center' : 'px-3.5'
          }`}
          title="Exit Session"
        >
          <LogOut size={16} />
          {!collapsed && (
            <span className="text-[13px] font-semibold">Log Out</span>
          )}
        </button>
      </div>
    </aside>
  );
};
