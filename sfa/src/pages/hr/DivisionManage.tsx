import React, { useState } from 'react';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';
import { DivisionModal } from './headOffice/DivisionModal';
import type { Division } from '../../core/domain/hr/headOffice.types';
import { getErrorMessage } from '../../utils/dataIntegrity';

export function DivisionManage() {
  const { divisions, loading, error, saveDivision, deleteDivision } = useHeadOfficeStore();
  const [selectedDiv, setSelectedDiv] = useState<Division | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleDivisionStatus = async (id: string, active: boolean) => {
    try {
      await saveDivision({ id, isActive: active });
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this division?')) return;
    try {
      await deleteDivision(id);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="division-manage-screen">
      <div className="page-header-row">
        <div>
          <h2>Division Management</h2>
          <p className="subtitle">Manage corporate business divisions and product lines</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setSelectedDiv(null);
            setModalOpen(true);
          }}
        >
          ➕ Add New Division
        </button>
      </div>

      {loading ? (
        <div className="loading-box">Loading divisions...</div>
      ) : error ? (
        <div className="error-alert">{error}</div>
      ) : (
        <div className="divisions-grid">
          {divisions.map((d) => (
            <div key={d.id} className="division-card">
              <div className="card-header">
                <h3>{d.name}</h3>
                <span className={`status-badge ${d.isActive ? 'active' : 'inactive'}`}>
                  {d.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="division-code">Code: {d.code}</p>
              {d.description && <p className="division-desc">{d.description}</p>}
              <div className="card-actions">
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => {
                    setSelectedDiv(d);
                    setModalOpen(true);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => toggleDivisionStatus(d.id, !d.isActive)}
                >
                  {d.isActive ? '🚫 Deactivate' : '✅ Activate'}
                </button>
                <button
                  type="button"
                  className="btn-text danger"
                  onClick={() => handleDelete(d.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
