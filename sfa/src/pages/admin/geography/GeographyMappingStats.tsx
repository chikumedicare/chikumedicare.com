import React from 'react';

interface GeographyMappingStatsProps {
  totalStaff: number;
  mappedCount: number;
  unmappedCount: number;
  totalHqsCount: number;
}

export function GeographyMappingStats({
  totalStaff,
  mappedCount,
  unmappedCount,
  totalHqsCount,
}: GeographyMappingStatsProps) {
  const cards = [
    {
      title: 'Field Representatives',
      value: totalStaff,
      sub: 'Active Field Force',
      icon: '👥',
      bg: '#f0f9ff',
      border: '#bae6fd',
      textColor: '#0369a1',
    },
    {
      title: 'Territory Mapped',
      value: mappedCount,
      sub: `${totalStaff > 0 ? Math.round((mappedCount / totalStaff) * 100) : 0}% Fully Assigned`,
      icon: '🟢',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      textColor: '#15803d',
    },
    {
      title: 'Coverage Pending',
      value: unmappedCount,
      sub: 'Requires Territory Assignment',
      icon: '⚠️',
      bg: '#fffbeb',
      border: '#fde68a',
      textColor: '#b45309',
    },
    {
      title: 'Active Headquarters',
      value: totalHqsCount,
      sub: 'Base & Operational HQs',
      icon: '🗺️',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      textColor: '#6d28d9',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '16px',
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {c.icon}
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {c.title}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: c.textColor, lineHeight: '1.2', marginTop: '2px' }}>
              {c.value}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748b', marginTop: '2px' }}>
              {c.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
