import { useGeographyStore } from '../../../../store/hr/useGeographyStore';
import type { Headquarter, Area } from '../../../../core/domain/hr/geography.types';
import { getErrorMessage } from '../../../../utils/dataIntegrity';
import React, { useState, useEffect } from 'react';
import type { Chemist } from '../../../../core/domain/master/fieldMaster.types';
import { GatewayContainer } from '../../../../core/container/GatewayContainer';
import { ChemistFormModal } from './ChemistFormModal';

export function ChemistMaster({
  hqs: propsHqs = [],
  areas: propsAreas = [],
  mode = "LIST",
}: {
  hqs?: Headquarter[];
  areas?: Area[];
  mode?: "LIST" | "ADD" | "EDIT" | "DELETE";
}) {
  const geoStore = useGeographyStore();
  const hqs = propsHqs.length > 0 ? propsHqs : geoStore.hqs;
  const areas = propsAreas.length > 0 ? propsAreas : geoStore.areas;
  const beats = geoStore.beats;

  const [chemists, setChemists] = useState<Chemist[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [hqFilter, setHqFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChemist, setEditingChemist] = useState<Chemist | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await GatewayContainer.getFieldMasterGateway().getChemists();
      setChemists(data || []);
    } catch (err) {
      setChemists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
    if (mode === 'ADD') {
      setShowAddModal(true);
      setEditingChemist(null);
    }
  }, [mode]);

  const handleDelete = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete Chemist: ${name || id}?`)) return;
    try {
      await GatewayContainer.getFieldMasterGateway().deleteChemist(id);
      await refreshList();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleSave = async (draft: Partial<Chemist>) => {
    try {
      await GatewayContainer.getFieldMasterGateway().saveChemist(draft);
      await refreshList();
      return { success: true };
    } catch (err: unknown) {
      alert(getErrorMessage(err));
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const filtered = chemists.filter((c) => {
    if (hqFilter !== 'ALL' && c.hqId !== hqFilter) return false;
    if (classFilter !== 'ALL' && c.chemistClass !== classFilter) return false;
    if (q.trim()) {
      const haystack = `${c.chemistName} ${c.contactPerson} ${c.hqName} ${c.city} ${c.drugLicenseNumber}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      {/* Compact Action & Filter Toolbar */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <input
          placeholder="Search Chemist by Name, Owner, HQ, City, or DL Number..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 280px', minWidth: '220px' }}
        />
        <select value={hqFilter} onChange={(e) => setHqFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Base HQs</option>
          {hqs.map((h) => (
            <option key={h.id} value={h.id}>{(h as any).name || (h as any).hq_name} (HQ)</option>
          ))}
        </select>


        {mode !== 'EDIT' && mode !== 'DELETE' && (
          <button
            type="button"
            className="primary"
            onClick={() => { setShowAddModal(true); setEditingChemist(null); }}
            style={{
              marginLeft: 'auto',
              borderRadius: '10px',
              fontWeight: 700,
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>➕</span> Add New Chemist
          </button>
        )}
      </div>

      {/* Chemist Table View */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Chemist Records...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Chemist / Shop Name</th>
                <th>Contact Person / Owner</th>
                <th>Base HQ & Area / Beat</th>
                <th>Shop Address & City</th>
                <th>Drug License & GSTIN</th>
                <th>Mobile Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '14.5px' }}>{item.chemistName}</b>
                    {item.chemistCode && <small style={{ color: '#64748b', display: 'block' }}>ID: {item.chemistCode}</small>}
                  </td>
                  <td>{item.contactPerson || '-'}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.hqName || 'HQ'}</div>
                    <small style={{ color: '#64748b' }}>{item.areaName || item.beatName || 'General Patch'}</small>
                  </td>
                  <td>
                    <div>{item.addressLine1 || item.address || '-'}</div>
                    <small style={{ color: '#64748b' }}>{item.city || 'Bhopal'}, {item.state || 'MP'}</small>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>DL: {item.drugLicenseNumber || 'Pending'}</div>
                    <small style={{ color: '#64748b' }}>GST: {item.gstin || 'N/A'}</small>
                  </td>
                  <td>{item.mobile || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => { setEditingChemist(item); setShowAddModal(true); }}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.chemistName)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#991b1b',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No Chemist records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(showAddModal || editingChemist) && (
        <ChemistFormModal
          chemist={editingChemist}
          hqs={hqs}
          areas={areas}
          beats={beats}
          onSave={(draft) => handleSave(draft)}
          onClose={() => { setShowAddModal(false); setEditingChemist(null); }}
        />
      )}
    </>
  );
}
export default ChemistMaster;
