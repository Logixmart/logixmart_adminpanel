import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PageLoading } from './components/ui';
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
import {
  clearActiveTab,
  getInitialActiveTab,
  persistActiveTab,
} from './utils/activeTab';

const AdminDetails = lazy(() =>
  import('./pages/AdminDetails').then((m) => ({ default: m.AdminDetails }))
);
const BlogsManagement = lazy(() =>
  import('./pages/Blogs/BlogsManagement').then((m) => ({
    default: m.BlogsManagement,
  }))
);
const JobsManagement = lazy(() => import('./pages/Jobs/JobsManagement'));
const JobApplicationsManagement = lazy(
  () => import('./pages/JobApplications/JobApplicationsManagement')
);
const QueryManagement = lazy(() => import('./pages/Query/QueryManagement'));
const WorkManagement = lazy(() => import('./pages/Ourwork/WorkManagement'));
const ClientReviewsManagement = lazy(
  () => import('./pages/ClientReviews/ClientReviewsManagement')
);

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
    `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} - ${now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  );
}

function readStoredAdminInfo() {
  const email = localStorage.getItem('logixmart_admin_email') || '';
  if (!email || !(getAccessToken() || getRefreshToken())) return null;

  return {
    ...emptyAdminInfo,
    email,
    name:
      localStorage.getItem(ADMIN_NAME_STORAGE_KEY) ||
      displayNameFromEmail(email),
    role: localStorage.getItem(ADMIN_ROLE_STORAGE_KEY) || '',
    lastLogin: localStorage.getItem('logixmart_admin_last_login') || '',
  };
}

function App() {
  const [activeTab, setActiveTabState] = useState(getInitialActiveTab);
  const [adminInfo, setAdminInfo] = useState(
    () => readStoredAdminInfo() ?? emptyAdminInfo
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(
      localStorage.getItem('logixmart_admin_email') &&
        (getAccessToken() || getRefreshToken())
    )
  );

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    persistActiveTab(tab);
  }, []);

  const resetSession = useCallback(() => {
    setAdminInfo(emptyAdminInfo);
    setIsAuthenticated(false);
    clearActiveTab();
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getInitialActiveTab());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [setActiveTab]);

  useEffect(() => {
    setSessionExpiredHandler(resetSession);

    const restoreSession = async () => {
      const stored = readStoredAdminInfo();
      if (!stored) {
        setIsAuthenticated(false);
        return;
      }

      setAdminInfo(stored);
      setIsAuthenticated(true);
      persistActiveTab(getInitialActiveTab());

      if (!(await ensureValidSession())) {
        clearAuthSession();
        resetSession();
      }
    };

    void restoreSession();
  }, [resetSession]);

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
    resetSession();
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'admin-details':
      case 'admins':
        return (
          <AdminDetails
            adminInfo={{ ...adminInfo, role: roleLabel(adminInfo.role) }}
            onUpdateAdmin={handleUpdateAdmin}
            canManageAdmins={isSuperAdmin(adminInfo.role)}
          />
        );
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
        return (
          <AdminDetails
            adminInfo={{ ...adminInfo, role: roleLabel(adminInfo.role) }}
            onUpdateAdmin={handleUpdateAdmin}
            canManageAdmins={isSuperAdmin(adminInfo.role)}
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
      <Suspense fallback={<PageLoading message="Loading..." />}>
        {renderActiveContent()}
      </Suspense>
    </DashboardLayout>
  );
}

export default App;
