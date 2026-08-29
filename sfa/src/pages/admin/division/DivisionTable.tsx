import React from 'react';
import type { Division } from '../../../core/domain/hr/headOffice.types';

interface DivisionTableProps {
  divisions: Division[];
  loading: boolean;
  onEdit: (division: Division) => void;
  onToggleStatus: (division: Division) => void;
  onDelete: (division: Division) => void;
  onAdd: () => void;
}

export function DivisionTable({
  divisions,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
  onAdd,
}: DivisionTableProps) {
  if (loading) {
    return (
      <div
        style={{
          padding: '48px',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          color: '#64748b',
          fontSize: '14px',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        <div>Loading business divisions from database...</div>
      </div>
    );
  }

  if (divisions.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px dashed #cbd5e1',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏢</div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
          No Marketing Divisions Found
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
          Get started by adding your company's strategic marketing or product divisions.
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
          ➕ Add First Division
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Division Code
              </th>
              <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Division Name
              </th>
              <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Product Portfolio & Description
              </th>
              <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Status
              </th>
              <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((d, index) => {
              const isEven = index % 2 === 0;
              const isActive = Boolean(d.isActive);

              return (
                <tr
                  key={d.id}
                  style={{
                    background: isEven ? '#ffffff' : '#fafafa',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.1s ease',
                  }}
                >
                  {/* Division Code */}
                  <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#0369a1',
                        fontFamily: 'monospace',
                      }}
                    >
                      {d.code || 'DIV--'}
                    </span>
                  </td>

                  {/* Division Name */}
                  <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                      {d.name}
                    </div>
                  </td>

                  {/* Portfolio / Description */}
                  <td style={{ padding: '12px 14px', verticalAlign: 'middle', maxWidth: '320px' }}>
                    <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
                      {d.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Standard healthcare & pharmaceuticals portfolio</span>}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: isActive ? '#ecfdf5' : '#fef2f2',
                        color: isActive ? '#065f46' : '#991b1b',
                        border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`,
                      }}
                    >
                      <span style={{ fontSize: '8px' }}>●</span>
                      <span>{isActive ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEdit(d)}
                        title="Edit Division"
                        style={{
                          padding: '5px 10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0f172a',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Edit
                      </button>

                      {/* Deactivate / Activate Button */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(d)}
                        title={isActive ? 'Deactivate Division' : 'Activate Division'}
                        style={{
                          padding: '5px 10px',
                          border: `1px solid ${isActive ? '#fecaca' : '#bbf7d0'}`,
                          background: isActive ? '#fff1f2' : '#f0fdf4',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isActive ? '#be123c' : '#15803d',
                          cursor: 'pointer',
                        }}
                      >
                        {isActive ? '🚫 Deactivate' : '🟢 Activate'}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDelete(d)}
                        title="Delete Division"
                        style={{
                          padding: '5px 8px',
                          border: '1px solid #fecdd3',
                          background: '#fff1f2',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#e11d48',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️
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
