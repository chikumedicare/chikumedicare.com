import React, { useState, useEffect } from 'react';
import { useAuthSessionStore } from './store/hr/useAuthSessionStore';
import { useGeographyStore } from './store/hr/useGeographyStore';
import { useHrStore } from './store/hr/useHrStore';
import { PageContentRouter } from './pages/PageContentRouter';
import { Login } from './pages/shared/auth/Login';
import { TopNavbar } from './components/layout/TopNavbar';
import { AppSidebar } from './components/layout/AppSidebar';
import type { Page } from './types';
import type { Employee } from './core/domain/hr/employee.types';
import type { SfaUser } from './core/domain/hr/user.types';
import { navCategories } from './navConfig';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b', margin: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>⚠️ Component Load Error</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Something went wrong while rendering this section.</p>
          <pre style={{ background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '4px', fontSize: '12px', overflowX: 'auto' }}>
            {this.state.error?.message || 'Unknown Error'}
          </pre>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.hash = 'dashboard';
              window.location.reload();
            }}
            style={{ marginTop: '12px', padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { currentUser, role, loading, verifySession, logout, setAuthUser } = useAuthSessionStore();
  const { hqs, refresh: refreshGeo } = useGeographyStore();
  const { users, refresh: refreshHr } = useHrStore();

  const activeFY = '2026-27';
  const isReadOnly = false;
  const user = currentUser;
  const [logged, setLogged] = useState(false);

  // Persist menuOpen live state across refreshes
  const [menuOpen, setMenuOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('chiku_admin_menu_open');
    return saved !== null ? saved === 'true' : true;
  });

  const handleSetMenuOpen = (val: boolean) => {
    setMenuOpen(val);
    localStorage.setItem('chiku_admin_menu_open', String(val));
  };

  const savedAuthUser = (() => {
    try {
      const s = sessionStorage.getItem('chiku_auth_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();
  const effectiveRole = currentUser?.role || role || savedAuthUser?.role || 'ADMIN';
  const isAdminOrOwner = effectiveRole === 'ADMIN' || effectiveRole === 'OWNER';

  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace('#', '') as Page;
    if (hash && hash !== 'hr-hub' && hash !== 'hr') return hash;
    const saved = localStorage.getItem('chiku_admin_active_page') as Page;
    if (saved && saved !== 'hr-hub' && saved !== 'hr') return saved;
    return 'dashboard';
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedUser, setSelectedUser] = useState<SfaUser | null>(null);

  const open = (newPage: Page) => {
    setPage(newPage);
    window.location.hash = newPage;
    localStorage.setItem('chiku_admin_active_page', newPage);
  };

  useEffect(() => {
    const initAuth = async () => {
      const res = await verifySession();
      if (res && (res as any).success) {
        setLogged(true);
        const hash = window.location.hash.replace('#', '') as Page;
        if (!hash || hash === 'hr-hub' || hash === 'hr') {
          open('dashboard');
        }
      }
    };
    initAuth();
  }, [verifySession]);

  useEffect(() => {
    if (logged) {
      refreshGeo(true);
      refreshHr(true);
    }
  }, [logged, refreshGeo, refreshHr]);

  const getModuleHierarchy = (p: Page) => {
    if (p === 'dashboard') return { category: 'Executive Workspace', categoryIcon: '📊', title: 'Dashboard' };
    if (p === 'my-profile') return { category: 'Personal Info', categoryIcon: '👤', title: 'Admin Profile' };
    for (const cat of navCategories) {
      for (const item of cat.items) {
        if (item.id === p) {
          return { category: cat.label, categoryIcon: cat.icon, title: item.label };
        }
        if (item.subItems) {
          const sub = item.subItems.find((s) => s.id === p);
          if (sub) {
            return { category: `${cat.label} › ${item.label}`, categoryIcon: cat.icon, title: sub.label };
          }
        }
      }
    }
    return { category: 'System Master', categoryIcon: '⚙️', title: p.replace(/-/g, ' ').toUpperCase() };
  };

  const moduleInfo = getModuleHierarchy(page);

  const userName = user?.fullName || (user as any)?.name || (effectiveRole === 'OWNER' ? 'Ravishankar Amarghade' : 'Executive User');

  const userHq = hqs.find((h) => h.id === user?.hqId || h.code === user?.hqId);
  const resolvedHqName =
    userHq?.name ||
    user?.hqName ||
    (effectiveRole === 'OWNER' || effectiveRole === 'ADMIN'
      ? 'Head Office (Apex)'
      : user?.hqId
      ? user.hqId
      : 'Unassigned HQ');

  const userManager = users.find((u) => u.id === user?.reportsToId || u.userId === user?.reportsToId);
  const resolvedReportingTo =
    userManager?.fullName
      ? `${userManager.fullName} (${userManager.role})`
      : user?.reportingToName ||
        (effectiveRole === 'OWNER' || effectiveRole === 'ADMIN'
          ? 'Apex Governance Board'
          : 'Apex Board (Owner & Admin)');

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600 }}>Verifying Secure Session</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Connecting to ChikuSFA Security Engine...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!logged) {
    return (
      <Login
        onLogin={(loggedUser) => {
          if (loggedUser) {
            setAuthUser(loggedUser);
            sessionStorage.setItem('chiku_auth_user', JSON.stringify(loggedUser));
          }
          setLogged(true);
          open('dashboard');
        }}
      />
    );
  }

  return (
    <div className="admin-app-root">
      <TopNavbar
        menuOpen={menuOpen}
        setMenuOpen={handleSetMenuOpen}
        open={open}
        activeFY={activeFY}
        isReadOnly={isReadOnly}
        userName={userName}
        role={effectiveRole}
        hqName={resolvedHqName}
        reportingTo={resolvedReportingTo}
      />

      <div className="app-body-container">
        <AppSidebar
          menuOpen={menuOpen}
          isAdminOrOwner={isAdminOrOwner}
          page={page}
          open={open}
          logout={logout}
          setLogged={setLogged}
        />

        <main className="main-workspace-area">
          <div className="compact-breadcrumb-bar">
            <div className="breadcrumb-path">
              <span className="crumb-category">{moduleInfo.categoryIcon} {moduleInfo.category}</span>
              <span className="crumb-divider">›</span>
              <strong className="crumb-active">{moduleInfo.title}</strong>
            </div>
            <div className="breadcrumb-right-meta">
              <span className="crumb-fy">Active Financial Year: <strong>{activeFY}</strong></span>
            </div>
          </div>
          <div className="workspace-content">
            <ErrorBoundary>
              <PageContentRouter
                page={page}
                open={open}
                selectedEmployee={selectedEmployee}
                setSelectedEmployee={setSelectedEmployee}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
