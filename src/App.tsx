import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDetails } from './pages/AdminDetails';
import { BlogsManagement } from './pages/BlogsManagement';
import JobsManagement from './pages/Jobs/JobsManagement';
import JobApplicationsManagement from './pages/JobApplications/JobApplicationsManagement';
import { logoutAdmin, displayNameFromEmail, type LoginSession } from './api/admin';
import './App.css';

const DEFAULT_ADMIN_ROLE = 'Global System Administrator';

const emptyAdminInfo = {
  name: '',
  email: '',
  password: '',
  role: DEFAULT_ADMIN_ROLE,
  lastLogin: '',
};

function formatLoginTime() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' - ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('admin-details');
  const [adminInfo, setAdminInfo] = useState(emptyAdminInfo);

  useEffect(() => {
    const token = localStorage.getItem('logixmart_token');
    const email = localStorage.getItem('logixmart_admin_email') || '';
    const lastLogin = localStorage.getItem('logixmart_admin_last_login') || '';
    if (token && email) {
      setIsAuthenticated(true);
      setAdminInfo({
        ...emptyAdminInfo,
        email,
        name: displayNameFromEmail(email),
        lastLogin,
      });
    }
  }, []);

  const handleUpdateAdmin = (updatedInfo: Partial<typeof adminInfo>) => {
    setAdminInfo((prev) => {
      const next = { ...prev, ...updatedInfo };
      if (updatedInfo.email) {
        localStorage.setItem('logixmart_admin_email', updatedInfo.email);
      }
      return next;
    });
  };

  const handleLoginSuccess = ({ email, password, name, role }: LoginSession) => {
    const lastLogin = formatLoginTime();
    localStorage.setItem('logixmart_admin_last_login', lastLogin);
    setAdminInfo({
      name: name || displayNameFromEmail(email),
      email,
      password,
      role: role || DEFAULT_ADMIN_ROLE,
      lastLogin,
    });
    setIsAuthenticated(true);
    setActiveTab('admin-details');
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('logixmart_token');
    localStorage.removeItem('logixmart_admin_email');
    localStorage.removeItem('logixmart_admin_last_login');
    setAdminInfo(emptyAdminInfo);
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
      case 'jobs':
        return <JobsManagement />;
      case 'job-applications':
        return <JobApplicationsManagement />;
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
