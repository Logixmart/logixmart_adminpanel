import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDetails } from './pages/AdminDetails';
import { BlogsManagement } from './pages/BlogsManagement';
import { logoutAdmin } from './api/admin';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('admin-details');

  // Global Admin details state (synced across views)
  const [adminInfo, setAdminInfo] = useState({
    name: 'Logixmart Admin',
    email: 'admin@logixmart.com',
    password: 'LogixmartAdmin2026!',
    role: 'Global System Administrator',
    terminal: 'HQ Developer Core Node core-01',
    lastLogin: 'Aug 21, 2026 - 13:12 PM'
  });

  useEffect(() => {
    const token = localStorage.getItem('logixmart_token');
    const email = localStorage.getItem('logixmart_admin_email') || 'admin@logixmart.com';
    if (token) {
      setIsAuthenticated(true);
      setAdminInfo((prev) => ({
        ...prev,
        email: email,
      }));
    }
  }, []);

  const handleUpdateAdmin = (updatedInfo: Partial<typeof adminInfo>) => {
    setAdminInfo((prev) => ({
      ...prev,
      ...updatedInfo
    }));
  };

  const handleLoginSuccess = () => {
    // Record current login timestamp
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' - ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const email = localStorage.getItem('logixmart_admin_email') || 'admin@logixmart.com';

    setAdminInfo(prev => ({
      ...prev,
      email: email,
      lastLogin: formattedDate
    }));
    setIsAuthenticated(true);
    setActiveTab('admin-details'); // default active tab requested by user
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('logixmart_token');
    localStorage.removeItem('logixmart_admin_email');
    setIsAuthenticated(false);
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'admin-details':
        return (
          <AdminDetails
            adminInfo={adminInfo}
            onUpdateAdmin={handleUpdateAdmin}
          />
        );
      case 'blogs':
        return <BlogsManagement />;
      default:
        return (
          <AdminDetails
            adminInfo={adminInfo}
            onUpdateAdmin={handleUpdateAdmin}
          />
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      adminName={adminInfo.name}
      onLogout={handleLogout}
    >
      {renderActiveContent()}
    </DashboardLayout>
  );
}

export default App;
