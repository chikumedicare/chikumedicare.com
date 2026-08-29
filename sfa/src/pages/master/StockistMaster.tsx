import { useGeographyStore } from '../../store/hr/useGeographyStore';
import type { Headquarter, Area } from '../../core/domain/hr/geography.types';
import { getErrorMessage } from '../../utils/dataIntegrity';
import React, { useState, useEffect } from 'react';
import type { Stockist } from '../../core/domain/master/fieldMaster.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { StockistFormModal } from './StockistFormModal';

export function StockistMaster({
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

  const [stockists, setStockists] = useState<Stockist[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [hqFilter, setHqFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStockist, setEditingStockist] = useState<Stockist | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await GatewayContainer.getFieldMasterGateway().getStockists();
      setStockists(data || []);
    } catch (err) {
      setStockists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
    if (mode === 'ADD') {
      setShowAddModal(true);
      setEditingStockist(null);
    }
  }, [mode]);

  const handleDelete = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete Stockist: ${name || id}?`)) return;
    try {
      await GatewayContainer.getFieldMasterGateway().deleteStockist(id);
      await refreshList();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleSave = async (draft: Partial<Stockist>) => {
    try {
      await GatewayContainer.getFieldMasterGateway().saveStockist(draft);
      await refreshList();
      return { success: true };
    } catch (err: unknown) {
      alert(getErrorMessage(err));
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const filtered = stockists.filter((s) => {
    if (hqFilter !== 'ALL' && s.hqId !== hqFilter) return false;
    if (q.trim()) {
      const haystack = `${s.stockistName} ${s.contactPerson} ${s.hqName} ${s.city} ${s.dl20b} ${s.dl21b} ${s.gstin}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      {/* Compact Action & Filter Toolbar */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <input
          placeholder="Search Stockist by Firm Name, Proprietor, HQ, DL 20B/21B, or GSTIN..."
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
            onClick={() => { setShowAddModal(true); setEditingStockist(null); }}
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
            <span>➕</span> Add New Stockist
          </button>
        )}
      </div>

      {/* Stockist Table View */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Stockist Records...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Stockist Firm Name</th>
                <th>Contact Person / Proprietor</th>
                <th>Base HQ & Area</th>
                <th>Office Address & City</th>
                <th>Drug License (20B / 21B)</th>
                <th>GSTIN & PAN</th>
                <th>Mobile & Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '14.5px' }}>{item.stockistName}</b>
                    {item.stockistCode && <small style={{ color: '#64748b', display: 'block' }}>ID: {item.stockistCode}</small>}
                  </td>
                  <td>{item.contactPerson || '-'}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.hqName || 'HQ'}</div>
                    <small style={{ color: '#64748b' }}>{item.areaName || 'General Area'}</small>
                  </td>
                  <td>
                    <div>{item.addressLine1 || item.address || '-'}</div>
                    <small style={{ color: '#64748b' }}>{item.city || 'Bhopal'}, {item.state || 'MP'}</small>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>20B: {item.dl20b || 'Pending'}</div>
                    <small style={{ color: '#64748b' }}>21B: {item.dl21b || 'Pending'}</small>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>GST: {item.gstin || 'N/A'}</div>
                    <small style={{ color: '#64748b' }}>PAN: {item.panNumber || '-'}</small>
                  </td>
                  <td>
                    <div>{item.mobile || '-'}</div>
                    {item.phone && <small style={{ color: '#64748b' }}>Tel: {item.phone}</small>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => { setEditingStockist(item); setShowAddModal(true); }}
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
                        onClick={() => handleDelete(item.id, item.stockistName)}
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
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No Stockist records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(showAddModal || editingStockist) && (
        <StockistFormModal
          stockist={editingStockist}
          hqs={hqs}
          areas={areas}
          onSave={(draft) => handleSave(draft)}
          onClose={() => { setShowAddModal(false); setEditingStockist(null); }}
        />
      )}
    </>
  );
}
export default StockistMaster;
