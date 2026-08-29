import React from 'react';
import type { Page } from '../../types';

interface TopNavbarProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  open: (p: Page) => void;
  activeFY: string;
  isReadOnly: boolean;
  userName: string;
  role: string;
  hqName: string;
  reportingTo: string;
}

export function TopNavbar({
  menuOpen,
  setMenuOpen,
  open,
  activeFY,
  isReadOnly,
  userName,
  role,
  hqName,
  reportingTo,
}: TopNavbarProps) {
  return (
    <header className="main-top-navbar">
      <div className="nav-left-brand-group">
        <div
          className="brand-header-row"
          onClick={() => open('dashboard')}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
          title="Go to Executive Dashboard"
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

        {/* ☰ 3-Line Hamburger Menu Toggle (Clean White Icon, Transparent Background) */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: '6px 8px',
            borderRadius: '8px',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
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
