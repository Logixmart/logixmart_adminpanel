import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminName: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  setActiveTab,
  adminName,
  onLogout,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-dark w-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        adminName={adminName}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[95] bg-black/45 md:hidden cursor-default"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
      )}
      <div className="flex flex-col flex-1 min-h-screen min-w-0 w-full">
        <Navbar activeTab={activeTab} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-8 overflow-y-auto overflow-x-hidden bg-brand-dark flex flex-col min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
