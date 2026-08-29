import React from 'react';
import type { Page } from '../../types';

interface TopNavbarProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isAdminOrOwner: boolean;
  portalView: 'HR' | 'OPERATIONS';
  setPortalView: (view: 'HR' | 'OPERATIONS') => void;
  open: (p: Page) => void;
  activeFY: string;
  isReadOnly: boolean;
  userName: string;
  role: string;
  hqName: string;
  reportingTo: string;
  setActiveFolder: (f: string | null) => void;
}

export function TopNavbar({
  menuOpen,
  setMenuOpen,
  isAdminOrOwner,
  portalView,
  setPortalView,
  open,
  activeFY,
  isReadOnly,
  userName,
  role,
  hqName,
  reportingTo,
  setActiveFolder,
}: TopNavbarProps) {
  return (
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
        <span className="fy-pill-badge">
          🟢 FY {activeFY} {isReadOnly ? '(Read-Only)' : ''}
        </span>

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
  );
}
