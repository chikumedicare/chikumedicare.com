import React, { useState, useEffect } from 'react';
import type { Page } from '../../types';
import { navCategories } from '../../navConfig';

interface AppSidebarProps {
  menuOpen: boolean;
  isAdminOrOwner: boolean;
  page: Page;
  open: (p: Page) => void;
  logout: () => Promise<void>;
  setLogged: (logged: boolean) => void;
}

export function AppSidebar({
  menuOpen,
  isAdminOrOwner,
  page,
  open,
  logout,
  setLogged,
}: AppSidebarProps) {
  const [activeSubFolder, setActiveSubFolder] = useState<string | null>(null);

  const categoriesToRender = isAdminOrOwner
    ? navCategories
    : navCategories.filter((cat) => cat.key !== 'hr' && cat.key !== 'settings-menu');

  // Find which category contains the current page
  const findCategoryForPage = (targetPage: Page): string | null => {
    for (const cat of navCategories) {
      for (const item of cat.items) {
        if (item.id === targetPage) return cat.key;
        if (item.subItems?.some((sub) => sub.id === targetPage)) return cat.key;
      }
    }
    return null;
  };

  // State to track which categories are open in accordion (only active category open by default)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const activeCat = findCategoryForPage(page);
    if (activeCat) {
      initial[activeCat] = true;
    }
    return initial;
  });

  // When page changes, ensure that category is open
  useEffect(() => {
    const activeCat = findCategoryForPage(page);
    if (activeCat) {
      setOpenCategories((prev) => ({ ...prev, [activeCat]: true }));
    }
  }, [page]);

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  return (
    <aside className={`app-left-sidebar ${menuOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <div className="sidebar-inner-scroll">
        {/* 📊 Persistent Executive Dashboard at Top */}
        <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            type="button"
            className={`menu-link-item ${page === 'dashboard' ? 'active' : ''}`}
            style={{
              fontWeight: 700,
              fontSize: '13px',
              background: page === 'dashboard' ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
              color: page === 'dashboard' ? '#ffffff' : '#f8fafc',
              borderRadius: '8px',
              padding: '9px 12px',
              boxShadow: page === 'dashboard' ? '0 3px 10px rgba(16, 185, 129, 0.35)' : 'none',
            }}
            onClick={() => open('dashboard')}
          >
            <i style={{ fontSize: '15px' }}>📊</i> <span>Executive Dashboard</span>
          </button>
        </div>

        {/* Unified Hierarchical Categories */}
        {categoriesToRender.map((cat) => {
          const isOpen = Boolean(openCategories[cat.key]);
          const hasActivePage = cat.items.some(
            (item) => item.id === page || item.subItems?.some((sub) => sub.id === page)
          );

          return (
            <div key={cat.key} className="menu-category-section" style={{ marginBottom: '8px' }}>
              <button
                type="button"
                className={`menu-category-toggle ${isOpen ? 'cat-open' : ''} ${hasActivePage ? 'cat-active' : ''}`}
                onClick={() => toggleCategory(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  border: hasActivePage ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                  background: isOpen ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  color: hasActivePage ? '#34d399' : '#f8fafc',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i style={{ fontSize: '14px' }}>{cat.icon}</i>
                  <span>{cat.label}</span>
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#94a3b8',
                  }}
                >
                  ▼
                </span>
              </button>

              {isOpen && (
                <div className="menu-subitems-container" style={{ marginLeft: '4px', paddingLeft: '8px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '4px' }}>
                  {cat.items.map((item) => {
                    if (item.subItems) {
                      const isSubOpen = activeSubFolder === item.label;
                      const hasSubActive = item.subItems.some((sub) => sub.id === page);

                      return (
                        <div key={item.key || item.label} className="menu-subfolder-group" style={{ marginBottom: '2px' }}>
                          <button
                            type="button"
                            className={`menu-subfolder-toggle ${isSubOpen ? 'sub-open' : ''}`}
                            onClick={() => setActiveSubFolder(isSubOpen ? null : item.label)}
                            style={{
                              color: hasSubActive ? '#34d399' : '#cbd5e1',
                              fontWeight: hasSubActive ? 700 : 500,
                            }}
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
              )}
            </div>
          );
        })}
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
