import React, { useState, useEffect } from 'react';
import './styles.css';
import type { Page } from './types';
import type { Employee } from './domain/hr/employee.types';
import type { SfaUser } from './domain/hr/user.types';
import { navCategories } from './navConfig';
import { Login } from './pages/Login';
import { PageContentRouter } from './pages/PageContentRouter';
import { useAuthSessionStore } from './store/hr/useAuthSessionStore';

export default function App() {
  const { role } = useAuthSessionStore();
  const [logged, setLogged] = useState(() => {
    const isLoggedIn = localStorage.getItem('chiku_admin_logged_in') === 'true';
    if (!isLoggedIn) return false;
    try {
      const saved = localStorage.getItem('chiku_auth_user');
      const user = saved ? JSON.parse(saved) : null;
      if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
        localStorage.removeItem('chiku_admin_logged_in');
        localStorage.removeItem('chiku_auth_user');
        localStorage.removeItem('chiku_access_token');
        localStorage.removeItem('chiku_refresh_token');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  // Persist Page state across Browser Refresh (F5) via URL Hash & LocalStorage
  const getInitialPage = (): Page => {
    const hash = window.location.hash.replace('#', '') as Page;
    if (hash) return hash;
    const saved = localStorage.getItem('chiku_admin_active_page') as Page;
    return saved || 'dashboard';
  };

  const [page, setPage] = useState<Page>(getInitialPage);
  const [collapsed, setCollapsed] = useState(false);

  // Auto-expand folder accordion corresponding to active page
  const getFolderForPage = (p: Page): string | null => {
    if (p === 'dashboard') return 'hr';
    for (const cat of navCategories) {
      if (cat.items.some((item) => item.id === p)) {
        return cat.key;
      }
    }
    return 'hr';
  };

  const [activeFolder, setActiveFolder] = useState<string | null>(() => getFolderForPage(getInitialPage()));

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedUser, setSelectedUser] = useState<SfaUser | null>(null);

  // Sync Hash changes (Browser Back/Forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '') as Page;
      if (currentHash) {
        setPage(currentHash);
        setActiveFolder(getFolderForPage(currentHash));
        localStorage.setItem('chiku_admin_active_page', currentHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const open = (p: Page) => {
    setPage(p);
    localStorage.setItem('chiku_admin_active_page', p);
    window.location.hash = p;
    const folderKey = getFolderForPage(p);
    if (folderKey) setActiveFolder(folderKey);
  };

  if (!logged) {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem('chiku_admin_logged_in', 'true');
          setLogged(true);
        }}
      />
    );
  }

  const handleToggleFolder = (key: string) => {
    setActiveFolder((prev) => (prev === key ? null : key));
  };

  // Find active item label for breadcrumb
  let activeTitle = 'Dashboard';
  if (page !== 'dashboard') {
    for (const cat of navCategories) {
      const found = cat.items.find((item) => item.id === page);
      if (found) {
        activeTitle = found.label;
        break;
      }
    }
  }

  return (
    <div className="app">
      <aside className={'sidebar ' + (collapsed ? 'collapsed' : '')}>
        <div className="brand">
          <div className="logo">C</div>
          {!collapsed && (
            <div>
              <strong>CHIKU MEDICARE</strong>
              <span>Admin Console</span>
            </div>
          )}
        </div>
        <button
          className="collapse"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? '▶' : '◀'}
        </button>

        <div className="nav">
          {/* Main Dashboard */}
          <div className="navgroup">
            {!collapsed && <small>Overview</small>}
            <button
              className={page === 'dashboard' ? 'active' : ''}
              title="Dashboard"
              onClick={() => open('dashboard')}
            >
              <i>📊</i>
              {!collapsed && 'Dashboard'}
            </button>
          </div>

          {/* Smooth Single-Accordion Expandable Folders */}
          <div className="navgroup">
            {!collapsed && <small>Console Modules</small>}
            {navCategories.map((cat) => {
              const isOpen = activeFolder === cat.key;
              const hasActiveChild = cat.items.some((item) => item.id === page);

              return (
                <div key={cat.key} style={{ marginBottom: '4px' }}>
                  {/* Folder Accordion Header */}
                  <button
                    className={`folder-btn ${isOpen ? 'folder-open' : ''} ${
                      hasActiveChild ? 'folder-has-active' : ''
                    }`}
                    onClick={() => handleToggleFolder(cat.key)}
                    title={cat.label}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <i>{cat.icon}</i>
                      {!collapsed && cat.label}
                    </span>
                    {!collapsed && (
                      <span
                        className={`folder-chevron ${
                          isOpen ? 'chevron-open' : ''
                        }`}
                      >
                        ▶
                      </span>
                    )}
                  </button>

                  {/* Smooth Animated Subnav Container */}
                  <div
                    className={`folder-subnav ${
                      isOpen && !collapsed ? 'subnav-open' : ''
                    }`}
                  >
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        className={page === item.id ? 'active' : ''}
                        title={item.label}
                        onClick={() => open(item.id)}
                      >
                        <i>{item.icon}</i>
                        {!collapsed && item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="signout"
          onClick={() => {
            localStorage.removeItem('chiku_admin_logged_in');
            localStorage.removeItem('chiku_auth_user');
            localStorage.removeItem('chiku_access_token');
            localStorage.removeItem('chiku_refresh_token');
            localStorage.removeItem('chiku_admin_active_page');
            window.location.hash = '';
            setLogged(false);
          }}
        >
          🚪 {!collapsed && 'Sign out'}
        </button>
      </aside>

      <main className={'main ' + (collapsed ? 'wide' : '')}>
        <header>
          <div>
            <small>Admin / {activeTitle}</small>
            <h1>{activeTitle}</h1>
          </div>
          <span className="admin">👤 {role}</span>
        </header>

        <div className="content">
          <PageContentRouter
            page={page}
            open={open}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>
      </main>
    </div>
  );
}
