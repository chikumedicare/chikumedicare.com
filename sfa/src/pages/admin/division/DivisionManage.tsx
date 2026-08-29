import React, { useState } from 'react';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { DivisionTable } from './DivisionTable';
import { DivisionModal } from './DivisionModal';
import { DivisionConfirmModal, type DivisionConfirmAction } from './DivisionConfirmModal';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import { getErrorMessage } from '../../../utils/dataIntegrity';

export function DivisionManage() {
  const { divisions, loading, saveDivision, deleteDivision } = useHeadOfficeStore();
  const [selectedDiv, setSelectedDiv] = useState<Division | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Search and filter state
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState<DivisionConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Division | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredDivisions = divisions.filter((d) => {
    const code = d.code || '';
    const name = d.name || '';
    const desc = d.description || '';
    const matchesQ =
      !q ||
      code.toLowerCase().includes(q.toLowerCase()) ||
      name.toLowerCase().includes(q.toLowerCase()) ||
      desc.toLowerCase().includes(q.toLowerCase());

    if (!matchesQ) return false;

    const isActive = Boolean(d.isActive);
    if (statusFilter === 'ACTIVE' && !isActive) return false;
    if (statusFilter === 'INACTIVE' && isActive) return false;

    return true;
  });

  const handleOpenAdd = () => {
    setSelectedDiv(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (div: Division) => {
    setSelectedDiv(div);
    setModalOpen(true);
  };

  const handleToggleClick = (div: Division) => {
    if (div.isActive) {
      // Require confirmation for deactivation
      setConfirmAction('DEACTIVATE');
      setConfirmTarget(div);
    } else {
      // Direct activation
      saveDivision({ id: div.id, isActive: true }).catch((err) => alert(getErrorMessage(err)));
    }
  };

  const handleDeleteClick = (div: Division) => {
    setConfirmAction('DELETE');
    setConfirmTarget(div);
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget || !confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction === 'DEACTIVATE') {
        await saveDivision({ id: confirmTarget.id, isActive: false });
      } else if (confirmAction === 'DELETE') {
        await deleteDivision(confirmTarget.id);
      }
      setConfirmTarget(null);
      setConfirmAction(null);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Compact Row 1: Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Marketing Division Management
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Configure strategic business divisions (SBUs), therapeutic focus areas, and marketing lines
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
          }}
        >
          <span>➕</span>
          <span>Add New Division</span>
        </button>
      </div>

      {/* Compact Row 2: Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#0284c7',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
            }}
          >
            <span>🏢</span>
            <span>Divisions</span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '11px',
              }}
            >
              {divisions.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search divisions..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '12.5px',
              width: '200px',
              outline: 'none',
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '6px 8px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '12px',
              background: '#fff',
            }}
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">🟢 Active</option>
            <option value="INACTIVE">🔴 Inactive</option>
          </select>
        </div>
      </div>

      {/* Modern Data Table */}
      <DivisionTable
        divisions={filteredDivisions}
        loading={loading}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleClick}
        onDelete={handleDeleteClick}
        onAdd={handleOpenAdd}
      />

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <DivisionModal
          division={selectedDiv}
          onSave={async (draft) => {
            const res = await saveDivision(draft);
            if (res.success) setModalOpen(false);
            return res;
          }}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Deactivate & Delete Confirmation Popup Modal */}
      {confirmAction && confirmTarget && (
        <DivisionConfirmModal
          action={confirmAction}
          division={confirmTarget}
          loading={actionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setConfirmAction(null);
            setConfirmTarget(null);
          }}
        />
      )}
    </div>
  );
}
