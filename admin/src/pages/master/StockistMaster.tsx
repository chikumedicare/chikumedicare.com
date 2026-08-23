import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { Stockist } from '../../domain/master/fieldMaster.types';
import { FieldMasterGateway } from '../../gateway/master/fieldMasterGateway';
import { StockistFormModal } from './StockistFormModal';

export function StockistMaster({
  hqs = [],
  areas = [],
}: {
  hqs?: any[];
  areas?: any[];
}) {
  const [stockists, setStockists] = useState<Stockist[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [hqFilter, setHqFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStockist, setEditingStockist] = useState<Stockist | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await FieldMasterGateway.getStockists();
      setStockists(data || []);
    } catch (err) {
      setStockists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = async (draft: Partial<Stockist>) => {
    try {
      await FieldMasterGateway.saveStockist(draft);
      await refreshList();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to save Stockist record' };
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Stockist firm: ${name}?`)) {
      try {
        await FieldMasterGateway.deleteStockist(id);
        await refreshList();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete Stockist record');
      }
    }
  };

  const filtered = stockists.filter((s) => {
    if (hqFilter !== 'ALL' && s.hqId !== hqFilter) return false;
    if (q.trim()) {
      const haystack = `${s.stockistName} ${s.contactPerson} ${s.dl20b} ${s.gstin} ${s.hqName}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      <Head
        title="Stockist Master (Wholesale Distributors)"
        sub="Manage Stockist distributors, DL 20B/21B certificates, GSTIN, and primary billing mappings."
        action={
          <button
            className="primary"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px', fontWeight: 600, background: '#7c3aed', borderColor: '#7c3aed' }}
          >
            + ADD New Stockist
          </button>
        }
      />

      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{stockists.length} Stockist Firms</b>
          <small>Total Wholesale Stockists</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#7c3aed' }}>{stockists.filter(s => s.isActive).length} Active Distributors</b>
          <small>Authorized Stockists</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>{hqs.length} HQs Covered</b>
          <small>Territory Billing Coverage</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#16a34a' }}>100% Online D1</b>
          <small>Real-time Billing Sync</small>
        </div>
      </div>

      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Search by Stockist Firm Name, Manager, DL 20B, GSTIN, or HQ..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 260px' }}
        />
        <select value={hqFilter} onChange={(e) => setHqFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Base HQs</option>
          {hqs.map((h) => (
            <option key={h.id} value={h.id}>{h.name || h.hq_name} (HQ)</option>
          ))}
        </select>
      </div>

      <div className="panel table">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Stockist Master Records from D1...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Stockist Firm & Manager</th>
                <th>Base HQ</th>
                <th>Office Address & City</th>
                <th>DL 20B / 21B</th>
                <th>GSTIN Number</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{item.stockistName}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>Contact: {item.contactPerson || 'N/A'}</small>
                  </td>
                  <td><b>{item.hqName || item.hqId}</b></td>
                  <td>
                    <small style={{ color: '#334155', fontWeight: 600 }}>{item.address || 'Office'}</small>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.city || 'Bhopal'}</small>
                  </td>
                  <td>
                    <small style={{ color: '#7c3aed', fontWeight: 700, display: 'block' }}>20B: {item.dl20b || 'N/A'}</small>
                    <small style={{ color: '#475569', fontWeight: 600 }}>21B: {item.dl21b || 'N/A'}</small>
                  </td>
                  <td><b>{item.gstin || 'N/A'}</b></td>
                  <td><b>{item.mobile || 'N/A'}</b></td>
                  <td><Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="link" onClick={() => setEditingStockist(item)}>Edit</button>
                      <button type="button" className="link" onClick={() => handleDelete(item.id, item.stockistName)} style={{ color: '#ef4444' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No Stockist records found. Click "+ ADD New Stockist" to create one.
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
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingStockist(null); }}
        />
      )}
    </>
  );
}
