import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { Chemist } from '../../domain/master/fieldMaster.types';
import { FieldMasterGateway } from '../../gateway/master/fieldMasterGateway';
import { ChemistFormModal } from './ChemistFormModal';

export function ChemistMaster({
  hqs = [],
  areas = [],
}: {
  hqs?: any[];
  areas?: any[];
}) {
  const [chemists, setChemists] = useState<Chemist[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [hqFilter, setHqFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChemist, setEditingChemist] = useState<Chemist | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await FieldMasterGateway.getChemists();
      setChemists(data || []);
    } catch (err) {
      setChemists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = async (draft: Partial<Chemist>) => {
    try {
      await FieldMasterGateway.saveChemist(draft);
      await refreshList();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to save Chemist record' };
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Chemist counter: ${name}?`)) {
      try {
        await FieldMasterGateway.deleteChemist(id);
        await refreshList();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete Chemist record');
      }
    }
  };

  const filtered = chemists.filter((c) => {
    if (hqFilter !== 'ALL' && c.hqId !== hqFilter) return false;
    if (q.trim()) {
      const haystack = `${c.chemistName} ${c.contactPerson} ${c.drugLicenseNumber} ${c.hqName} ${c.city}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      <Head
        title="Chemist Master (Retail Outlets)"
        sub="Manage Chemist retail counters, drug licenses, GSTIN, and territory coverage."
        action={
          <button
            className="primary"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px', fontWeight: 600, background: '#16a34a', borderColor: '#16a34a' }}
          >
            + ADD New Chemist
          </button>
        }
      />

      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{chemists.length} Chemist Counters</b>
          <small>Total Retail Outlets</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#16a34a' }}>{chemists.filter(c => c.chemistClass === 'A').length} Class A Counters</b>
          <small>High Volume Retailers</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>{chemists.filter(c => c.isActive).length} Active Outlets</b>
          <small>Field Verified Chemists</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#7c3aed' }}>{hqs.length} HQs Covered</b>
          <small>Territory Coverage</small>
        </div>
      </div>

      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Search by Chemist Name, Owner, DL, GSTIN, or City..."
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
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Chemist Master Records from D1...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Chemist Shop & Owner</th>
                <th>Class</th>
                <th>Base HQ & Area</th>
                <th>Shop Address & City</th>
                <th>DL & GSTIN</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{item.chemistName}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>Owner: {item.contactPerson || 'N/A'}</small>
                  </td>
                  <td>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>
                      Class {item.chemistClass || 'A'}
                    </span>
                  </td>
                  <td>
                    <b>{item.hqName || item.hqId}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.areaName || item.areaId}</small>
                  </td>
                  <td>
                    <small style={{ color: '#334155', fontWeight: 600 }}>{item.address || 'Shop'}</small>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.city || 'Bhopal'}</small>
                  </td>
                  <td>
                    <small style={{ color: '#0f172a', fontWeight: 700 }}>DL: {item.drugLicenseNumber || 'N/A'}</small>
                    <small style={{ color: '#64748b', display: 'block' }}>GST: {item.gstin || 'N/A'}</small>
                  </td>
                  <td><b>{item.mobile || 'N/A'}</b></td>
                  <td><Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="link" onClick={() => setEditingChemist(item)}>Edit</button>
                      <button type="button" className="link" onClick={() => handleDelete(item.id, item.chemistName)} style={{ color: '#ef4444' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No Chemist records found. Click "+ ADD New Chemist" to create one.
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
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingChemist(null); }}
        />
      )}
    </>
  );
}
