import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDetails } from './pages/AdminDetails';
import { BlogsManagement } from './pages/Blogs/BlogsManagement';
import JobsManagement from './pages/Jobs/JobsManagement';
import JobApplicationsManagement from './pages/JobApplications/JobApplicationsManagement';
import QueryManagement from './pages/Query/QueryManagement';
import WorkManagement from './pages/Ourwork/WorkManagement';
import ClientReviewsManagement from './pages/ClientReviews/ClientReviewsManagement';
import { logoutAdmin, displayNameFromEmail, type LoginSession } from './api/admin';
import {
  ensureValidSession,
  setSessionExpiredHandler,
} from './api/authInterceptor';
import {
  ADMIN_NAME_STORAGE_KEY,
  ADMIN_ROLE_STORAGE_KEY,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  isSuperAdmin,
  roleLabel,
} from './utils/auth';
import './App.css';

const emptyAdminInfo = {
  name: '',
  email: '',
  password: '',
  role: '',
  lastLogin: '',
};

function formatLoginTime() {
  const now = new Date();
  return (
    now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' - ' +
    now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('admin-details');
  const [adminInfo, setAdminInfo] = useState(emptyAdminInfo);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setAdminInfo(emptyAdminInfo);
      setIsAuthenticated(false);
    });

    const restoreSession = async () => {
      const email = localStorage.getItem('logixmart_admin_email') || '';
      const lastLogin = localStorage.getItem('logixmart_admin_last_login') || '';
      const role = localStorage.getItem(ADMIN_ROLE_STORAGE_KEY) || '';
      const storedName = localStorage.getItem(ADMIN_NAME_STORAGE_KEY) || '';
      const hasRefreshToken = Boolean(getRefreshToken());
      const hasAccessToken = Boolean(getAccessToken());

      if (!email || (!hasAccessToken && !hasRefreshToken)) {
        return;
      }

      if (hasRefreshToken) {
        const valid = await ensureValidSession();
        if (!valid) {
          clearAuthSession();
          return;
        }
      }

      setIsAuthenticated(true);
      setAdminInfo({
        ...emptyAdminInfo,
        email,
        name: storedName || displayNameFromEmail(email),
        role,
        lastLogin,
      });
    };

    restoreSession();
  }, []);

  const handleUpdateAdmin = (updatedInfo: Partial<typeof adminInfo>) => {
    setAdminInfo((prev) => {
      const next = { ...prev, ...updatedInfo };
      if (updatedInfo.email) {
        localStorage.setItem('logixmart_admin_email', updatedInfo.email);
      }
      if (updatedInfo.name) {
        localStorage.setItem(ADMIN_NAME_STORAGE_KEY, updatedInfo.name);
      }
      return next;
    });
  };

  const handleLoginSuccess = ({ email, password, name, role }: LoginSession) => {
    const lastLogin = formatLoginTime();
    const resolvedName = name || displayNameFromEmail(email);
    const resolvedRole = role || 'ADMIN';
    localStorage.setItem('logixmart_admin_last_login', lastLogin);
    localStorage.setItem(ADMIN_ROLE_STORAGE_KEY, resolvedRole);
    localStorage.setItem(ADMIN_NAME_STORAGE_KEY, resolvedName);
    setAdminInfo({
      name: resolvedName,
      email,
      password,
      role: resolvedRole,
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
      clearAuthSession();
    }
    setAdminInfo(emptyAdminInfo);
    setIsAuthenticated(false);
  };

  const renderAdminPage = () => (
    <AdminDetails
      adminInfo={{
        ...adminInfo,
        role: roleLabel(adminInfo.role),
      }}
      onUpdateAdmin={handleUpdateAdmin}
      canManageAdmins={isSuperAdmin(adminInfo.role)}
    />
  );

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'admin-details':
      case 'admins':
        return renderAdminPage();
      case 'blogs':
        return <BlogsManagement />;
      case 'jobs':
        return <JobsManagement />;
      case 'job-applications':
        return <JobApplicationsManagement />;
      case 'query':
        return <QueryManagement />;
      case 'client-reviews':
        return <ClientReviewsManagement />;
      case 'our-work':
        return <WorkManagement />;
      default:
        return renderAdminPage();
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
