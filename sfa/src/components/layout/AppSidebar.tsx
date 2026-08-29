import React, { useState } from 'react';
import type { Page } from '../../types';
import { navCategories } from '../../navConfig';

interface AppSidebarProps {
  menuOpen: boolean;
  isAdminOrOwner: boolean;
  portalView: 'HR' | 'OPERATIONS';
  setPortalView: (view: 'HR' | 'OPERATIONS') => void;
  page: Page;
  open: (p: Page) => void;
  logout: () => Promise<void>;
  setLogged: (logged: boolean) => void;
  setActiveFolder: (f: string | null) => void;
}

export function AppSidebar({
  menuOpen,
  isAdminOrOwner,
  portalView,
  setPortalView,
  page,
  open,
  logout,
  setLogged,
  setActiveFolder,
}: AppSidebarProps) {
  const [activeSubFolder, setActiveSubFolder] = useState<string | null>(null);

  const categoriesToRender = (isAdminOrOwner && portalView === 'HR')
    ? navCategories.filter((cat) => cat.key === 'hr')
    : navCategories.filter((cat) => cat.key !== 'hr');

  return (
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

        {categoriesToRender.map((cat) => (
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
  );
}
