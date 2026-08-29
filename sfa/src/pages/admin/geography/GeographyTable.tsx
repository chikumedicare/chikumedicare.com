import React from 'react';
import { Badge } from '../../../components/Badge';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area, Beat } from '../../../core/domain/hr/geography.types';

export type TerritoryItem = Zone | State | Headquarter | Area | Beat;

interface GeographyTableProps {
  tab: TerritoryType;
  items: TerritoryItem[];
  getZoneName: (id?: string) => string;
  getStateName: (id?: string) => string;
  getHqName: (id?: string) => string;
  onEdit: (item: TerritoryItem) => void;
  onToggleStatus: (item: TerritoryItem) => void;
  onAdd: () => void;
}

export function GeographyTable({
  tab,
  items,
  getZoneName,
  getStateName,
  getHqName,
  onEdit,
  onToggleStatus,
  onAdd,
}: GeographyTableProps) {
  if (items.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>
          {tab === 'HO' ? '🏢' : tab === 'Zone' ? '🌐' : tab === 'State' ? '🗺️' : tab === 'HQ' ? '📍' : tab === 'Area' ? '🏙️' : '🛣️'}
        </div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a', fontWeight: 700 }}>
          No {tab === 'HO' ? 'Head Offices' : tab + ' records'} found
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
          {tab === 'HO'
            ? 'No Corporate Head Office created yet. Create one for Admin/Owner corporate mapping.'
            : 'No geography records match your current filters. Add a new territory to get started.'}
        </p>
        <button
          type="button"
          onClick={onAdd}
          style={{
            padding: '8px 18px',
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          + Add New {tab === 'HO' ? 'Head Office' : tab}
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Code</th>
              <th style={{ padding: '12px 16px' }}>{tab === 'HO' ? 'Head Office Name' : tab + ' Name'}</th>
              {tab === 'HO' && <th style={{ padding: '12px 16px' }}>Location / City</th>}
              {tab === 'HO' && <th style={{ padding: '12px 16px' }}>Pincode</th>}
              {tab === 'State' && <th style={{ padding: '12px 16px' }}>Parent Zone</th>}
              {tab === 'HQ' && <th style={{ padding: '12px 16px' }}>Parent State</th>}
              {tab === 'HQ' && <th style={{ padding: '12px 16px' }}>HQ Type</th>}
              {tab === 'Area' && <th style={{ padding: '12px 16px' }}>Parent HQ</th>}
              {tab === 'Area' && <th style={{ padding: '12px 16px' }}>Travel Mode</th>}
              {tab === 'Beat' && <th style={{ padding: '12px 16px' }}>Parent Area</th>}
              {tab === 'Beat' && <th style={{ padding: '12px 16px' }}>Beat Type</th>}
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const hqItem = item as Headquarter;
              const areaItem = item as Area;
              const beatItem = item as Beat;
              const stateItem = item as State;

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0284c7' }}>
                    <code>{item.code || '-'}</code>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                    {item.name}
                    {tab === 'HO' && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Corporate Super HQ
                      </span>
                    )}
                  </td>

                  {tab === 'HO' && (
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {[hqItem.city, hqItem.district].filter(Boolean).join(', ') || '-'}
                    </td>
                  )}
                  {tab === 'HO' && (
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {hqItem.pinCode || '-'}
                    </td>
                  )}

                  {tab === 'State' && (
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {getZoneName(stateItem.zoneId)}
                    </td>
                  )}

                  {tab === 'HQ' && (
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {getStateName(hqItem.stateId)}
                    </td>
                  )}
                  {tab === 'HQ' && (
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {hqItem.hqType || 'Standard HQ'}
                      </span>
                    </td>
                  )}

                  {tab === 'Area' && (
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {getHqName(areaItem.hqId)}
                    </td>
                  )}
                  {tab === 'Area' && (
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {areaItem.travelMode || 'TWO_SIDE'}
                    </td>
                  )}

                  {tab === 'Beat' && (
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {beatItem.areaId || '-'}
                    </td>
                  )}
                  {tab === 'Beat' && (
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {beatItem.beatType || 'CORE'}
                      </span>
                    </td>
                  )}

                  <td style={{ padding: '12px 16px' }}>
                    <Badge v={item.isActive ? 'Active' : 'Inactive'} />
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        style={{
                          padding: '5px 10px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item)}
                        style={{
                          padding: '5px 10px',
                          background: item.isActive ? '#fff1f2' : '#f0fdf4',
                          border: item.isActive ? '1px solid #fecdd3' : '1px solid #bbf7d0',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: item.isActive ? '#be123c' : '#15803d',
                          cursor: 'pointer',
                        }}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
