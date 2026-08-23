import React from 'react';

export interface LocalityItem {
  id: string;
  name: string;
  fullName: string;
  source: 'DIRECTORY' | 'WEB';
}

interface SuggestionDropdownProps {
  suggestions: LocalityItem[];
  selectedIndex: number;
  contextLocation: string;
  loading: boolean;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
}

export function SuggestionDropdown({
  suggestions,
  selectedIndex,
  contextLocation,
  loading,
  onSelect,
  onHover,
}: SuggestionDropdownProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 999,
        marginTop: '4px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        maxHeight: '260px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '6px 10px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '11px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>📍 <b>Select from {contextLocation ? `${contextLocation} Areas` : 'Prominent Localities'}</b></span>
        {loading ? (
          <span style={{ color: '#0284c7' }}>🔍 Searching web...</span>
        ) : (
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Click to auto-fill</span>
        )}
      </div>
      {suggestions.map((s, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={s.id}
            onClick={() => onSelect(s.name)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
              backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={() => onHover(idx)}
          >
            <span style={{ fontSize: '13px' }}>{s.source === 'DIRECTORY' ? '⭐' : '🌐'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                {s.name}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.fullName}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
