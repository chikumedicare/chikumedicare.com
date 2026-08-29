import React from 'react';

export function GenericModulePage(props: any) {
  return (
    <div className="generic-module-screen" style={{ padding: '24px' }}>
      <div className="module-header-box" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '32px' }}>{props.icon || '📦'}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{props.title || 'Enterprise SFA Module'}</h2>
          {props.subtitle && <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>{props.subtitle}</p>}
        </div>
      </div>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#475569', margin: 0 }}>This module is online-first and connected to Cloudflare D1.</p>
      </div>
    </div>
  );
}
