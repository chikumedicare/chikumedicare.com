import React from 'react';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';

interface GeographyStatsBarProps {
  currentTab: TerritoryType;
  onTabChange: (tab: TerritoryType) => void;
  counts: {
    ho: number;
    zone: number;
    state: number;
    hq: number;
    area: number;
    beat: number;
  };
}

export function GeographyStatsBar({ currentTab, onTabChange, counts }: GeographyStatsBarProps) {
  const cards: Array<{ type: TerritoryType; label: string; icon: string; count: number; color: string }> = [
    { type: 'HO', label: 'Head Office (HO)', icon: '🏢', count: counts.ho, color: '#f59e0b' },
    { type: 'Zone', label: 'Zones', icon: '🌐', count: counts.zone, color: '#3b82f6' },
    { type: 'State', label: 'States', icon: '🗺️', count: counts.state, color: '#8b5cf6' },
    { type: 'HQ', label: 'Field HQs', icon: '📍', count: counts.hq, color: '#10b981' },
    { type: 'Area', label: 'Areas', icon: '🏙️', count: counts.area, color: '#06b6d4' },
    { type: 'Beat', label: 'Beats / Routes', icon: '🛣️', count: counts.beat, color: '#ec4899' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      {cards.map((c) => {
        const isActive = currentTab === c.type;
        return (
          <div
            key={c.type}
            onClick={() => onTabChange(c.type)}
            style={{
              background: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              border: isActive ? `2px solid ${c.color}` : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 14px',
              cursor: 'pointer',
              boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.08)' : 'none',
              transform: isActive ? 'scale(1.02)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                {c.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {c.count}
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isActive ? `${c.color}15` : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              {c.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}
