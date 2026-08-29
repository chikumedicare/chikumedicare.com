import React, { useState, useEffect } from 'react';
import { navCategories } from './navConfig';
import type { Page } from './types';
import { PageContentRouter } from './pages/PageContentRouter';
import { Login } from './pages/shared/auth/Login';
import { useAuthSessionStore } from './store/hr/useAuthSessionStore';
import type { Employee } from './core/domain/hr/employee.types';
import type { SfaUser } from './core/domain/hr/user.types';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca', margin: '40px auto', maxWidth: '600px' }}>
          <h3 style={{ color: '#991b1b', fontSize: '18px', margin: '0 0 10px 0' }}>⚠️ Workspace Display Recovery</h3>
          <p style={{ color: '#7f1d1d', fontSize: '13px', margin: '0 0 20px 0' }}>
            {this.state.error?.message || 'A transient rendering error occurred.'}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            🔄 Reload Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { currentUser, role, loading, verifySession, logout } = useAuthSessionStore();
  const activeFY = '2026-27';
  const isReadOnly = false;
  const user = currentUser;
  const [logged, setLogged] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);

  const isAdminOrOwner = role === 'ADMIN' || role === 'OWNER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'OWNER';

  const [portalView, setPortalView] = useState<'HR' | 'OPERATIONS'>(() => (isAdminOrOwner ? 'HR' : 'OPERATIONS'));

  const [activeFolder, setActiveFolder] = useState<string | null>(() => (isAdminOrOwner ? 'hr' : 'master'));
  const [activeSubFolder, setActiveSubFolder] = useState<string | null>(null);

  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace('#', '') as Page;
    if (hash) return hash;
    const saved = localStorage.getItem('chiku_admin_active_page') as Page;
    if (saved && saved !== 'hr-hub') return saved;
    return isAdminOrOwner ? 'employees' : 'dashboard';
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
        const userRole = (res as any).user?.role || role;
        const isAdm = userRole === 'ADMIN' || userRole === 'OWNER';
        const hash = window.location.hash.replace('#', '') as Page;
        if (!hash || hash === 'hr-hub' || hash === 'hr') {
          const defaultLanding: Page = isAdm ? 'employees' : 'dashboard';
          open(defaultLanding);
          setActiveFolder(isAdm ? 'hr' : 'master');
        }
      }
    };
    initAuth();
  }, [verifySession]);

  const getPageTitle = (p: Page) => {
    for (const cat of navCategories) {
      for (const item of cat.items) {
        if (item.id === p) return item.label;
        if (item.subItems) {
          const sub = item.subItems.find((s) => s.id === p);
          if (sub) return sub.label;
        }
      }
    }
    return 'Admin Dashboard';
  };

  const activeTitle = getPageTitle(page);
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

  const userName = user?.fullName || (user as any)?.name || 'Executive Admin';
  const hqName = user?.hqName || (user as any)?.hq_name || 'Corporate Super HQ';
  const reportingTo = user?.reportingToName || (user as any)?.reportsToName || 'Managing Director';

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
        onLogin={(loggedUser, _rememberMe, _selectedFy) => {
          setLogged(true);
          const userRole = loggedUser?.role || role;
          const isAdm = userRole === 'ADMIN' || userRole === 'OWNER';
          const defaultLanding: Page = isAdm ? 'employees' : 'dashboard';
          open(defaultLanding);
          setActiveFolder(isAdm ? 'hr' : 'transaction');
        }}
      />
    );
  }

  return (
    <div className="admin-app-root">
      {/* 🔝 Top Header Navbar (100% width across top) */}
      <header className="main-top-navbar">
        <div className="nav-left-brand-group">
          <div
            className="brand-header-row"
            onClick={() => open(isAdminOrOwner ? 'employees' : 'dashboard')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            title={isAdminOrOwner ? 'Go to Employee Master' : 'Go to Executive Dashboard'}
          >
            <img
              src="/logo.png"
              alt="Chiku Medicare"
              className="logo-img"
              style={{
                height: '62px',
                width: 'auto',
                maxHeight: '68px',
                objectFit: 'contain',
                filter: 'brightness(1.3) contrast(1.15) drop-shadow(0 3px 12px rgba(16, 185, 129, 0.35))',
              }}
            />
          </div>

          {/* 📂 Menu Toggle Button in Header */}
          <button
            type="button"
            className={`top-menu-dropdown-btn ${menuOpen ? 'active-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              fontWeight: 700,
              letterSpacing: '0.4px',
              borderRadius: '10px',
            }}
          >
            <span style={{ fontSize: '15px' }}>☰</span>
            <span>Menu</span>
            <span className={`chevron-icon ${menuOpen ? 'open' : ''}`}>❯</span>
          </button>

          {/* 🧭 Jump Switcher Button in Header for Admin/Owner */}
          {isAdminOrOwner && (
            <button
              type="button"
              onClick={() => {
                if (portalView === 'HR') {
                  setPortalView('OPERATIONS');
                  open('dashboard');
                  setActiveFolder('master');
                } else {
                  setPortalView('HR');
                  open('employees');
                  setActiveFolder('hr');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: portalView === 'OPERATIONS' ? '#2563eb' : 'rgba(59, 130, 246, 0.15)',
                color: portalView === 'OPERATIONS' ? '#ffffff' : '#60a5fa',
                border: portalView === 'OPERATIONS' ? '1px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.35)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={portalView === 'HR' ? "Jump to Operations Modules (Masters, Transactions, Reports, Approvals)" : "Return to HR & Personnel Screen"}
            >
              <span>{portalView === 'HR' ? '🧭 Jump to Operations Modules' : '👥 Jump to HR & Personnel'}</span>
              <span style={{ fontSize: '12px' }}>➔</span>
            </button>
          )}
        </div>

        {/* Top Header Right Status Badges & Controls */}
        <div className="nav-right-user-group">
          {/* FY Badge */}
          <span className="fy-pill-badge">
            🟢 FY {activeFY} {isReadOnly ? '(Read-Only)' : ''}
          </span>

          {/* Executive User Profile Badge */}
          <div
            className="direct-user-info"
            onClick={() => open('my-profile')}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            title="View & Edit Profile"
          >
            <div className="user-top-row">
              <strong className="user-name-title">{userName}</strong>
              <span className="post-badge">{role}</span>
            </div>
            <div className="user-bottom-row">
              <span className="meta-info">📍 <strong>HQ:</strong> {hqName}</span>
              <span className="meta-divider">•</span>
              <span className="meta-info">👤 <strong>Reporting:</strong> {reportingTo}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 📐 App Body: Side-by-Side (Sidebar Under Logo + Main Workspace) */}
      <div className="app-body-container">
        {/* 👈 Left Sidebar (Sits under the Logo, NOT in front) */}
        <aside className={`app-left-sidebar ${menuOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <div className="sidebar-inner-scroll">
            {/* 🔄 Jump Switcher Button at the top of Menu for Admin/Owner */}
            {isAdminOrOwner && (
              <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <button
                  type="button"
                  className="menu-link-item"
                  style={{
                    fontWeight: 800,
                    fontSize: '12px',
                    background: portalView === 'HR' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                    color: portalView === 'HR' ? '#60a5fa' : '#34d399',
                    border: portalView === 'HR' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                  onClick={() => {
                    if (portalView === 'HR') {
                      setPortalView('OPERATIONS');
                      open('dashboard');
                      setActiveFolder('master');
                    } else {
                      setPortalView('HR');
                      open('employees');
                      setActiveFolder('hr');
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i style={{ fontSize: '15px' }}>{portalView === 'HR' ? '🧭' : '👥'}</i>
                    <span>{portalView === 'HR' ? 'Jump to Operations Modules' : 'Return to HR & Personnel'}</span>
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>➔</span>
                </button>
                <small style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginTop: '4px', paddingLeft: '4px' }}>
                  {portalView === 'HR' ? 'Masters, Transactions, Reports, Approvals' : 'Employees, Users, Hierarchy, Transfers'}
                </small>
              </div>
            )}

            {/* Dashboard Button when in OPERATIONS mode */}
            {portalView === 'OPERATIONS' && (
              <div style={{ marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  className={`menu-link-item ${page === 'dashboard' ? 'active' : ''}`}
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    background: page === 'dashboard' ? '#3b82f6' : 'rgba(59, 130, 246, 0.12)',
                    color: page === 'dashboard' ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  onClick={() => open('dashboard')}
                >
                  <i>📊</i> <span>Field Sales Dashboard</span>
                </button>
              </div>
            )}

            {((isAdminOrOwner && portalView === 'HR')
              ? navCategories.filter((cat) => cat.key === 'hr')
              : navCategories.filter((cat) => cat.key !== 'hr')
            ).map((cat) => (
              <div key={cat.key} className="menu-category-section">
                <div className="menu-category-header-title">
                  <span><i>{cat.icon}</i> {cat.label}</span>
                </div>

                <div className="menu-subitems-container" style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 'none' }}>
                  {cat.items.map((item) => {
                    if (item.subItems) {
                      const isSubOpen = activeSubFolder === item.label;
                      return (
                        <div key={item.key || item.label} className="menu-subfolder-group">
                          <button
                            type="button"
                            className={`menu-subfolder-toggle ${isSubOpen ? 'sub-open' : ''}`}
                            onClick={() => setActiveSubFolder(isSubOpen ? null : item.label)}
                          >
                            <span><i>{item.icon}</i> {item.label}</span>
                            <span>{isSubOpen ? '▲' : '▼'}</span>
                          </button>
                          {isSubOpen && (
                            <div className="menu-nested-subitems">
                              {item.subItems.map((sub) => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  className={`menu-link-item nested ${page === sub.id ? 'active' : ''}`}
                                  onClick={() => open(sub.id)}
                                >
                                  <i>{sub.icon}</i> {sub.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`menu-link-item ${page === item.id ? 'active' : ''}`}
                        onClick={() => {
                          if (item.id) open(item.id);
                        }}
                      >
                        <i>{item.icon}</i> <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 🚪 Sidebar Bottom Sign Out */}
          <div className="sidebar-bottom-signout">
            <button
              type="button"
              className="menu-link-item"
              style={{
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.08)',
                justifyContent: 'center',
                fontWeight: 700,
                padding: '9px 12px',
              }}
              onClick={async () => {
                if (window.confirm('🚪 Are you sure you want to Sign Out?')) {
                  await logout();
                  setLogged(false);
                }
              }}
            >
              <i>🚪</i> Sign Out of Console
            </button>
          </div>
        </aside>

        {/* 💻 Main Workspace Area (Side by side with Sidebar) */}
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
