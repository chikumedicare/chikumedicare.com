import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { Holiday } from '../../domain/master/fieldMaster.types';
import { FieldMasterGateway } from '../../gateway/master/fieldMasterGateway';
import { HolidayFormModal } from './HolidayFormModal';

export function HolidayMaster() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await FieldMasterGateway.getHolidays();
      setHolidays(data || []);
    } catch (err) {
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = async (draft: Partial<Holiday>) => {
    try {
      await FieldMasterGateway.saveHoliday(draft);
      await refreshList();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to save Holiday record' };
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Holiday: ${name}?`)) {
      try {
        await FieldMasterGateway.deleteHoliday(id);
        await refreshList();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete Holiday record');
      }
    }
  };

  const filtered = holidays.filter((h) => {
    if (q.trim()) {
      const haystack = `${h.holidayName} ${h.date} ${h.type}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      <Head
        title="Holiday Master (Company Calendar)"
        sub="Manage annual company holiday schedule, national festivals, and state holiday allocations."
        action={
          <button
            className="primary"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px', fontWeight: 600, background: '#d97706', borderColor: '#d97706' }}
          >
            + ADD New Holiday
          </button>
        }
      />

      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{holidays.length} Holidays</b>
          <small>Annual Calendar</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#d97706' }}>{holidays.filter(h => h.type === 'NATIONAL').length} National Holidays</b>
          <small>Company Wide Off</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>{holidays.filter(h => h.isActive).length} Active Dates</b>
          <small>System Approved</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#16a34a' }}>DCR Calendar Sync</b>
          <small>Automatic Tour Block</small>
        </div>
      </div>

      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Search by Festival Name, Date, or Type..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 260px' }}
        />
      </div>

      <div className="panel table">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Holiday Master Records from D1...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Festival / Occasion Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{item.holidayName}</b>
                  </td>
                  <td><b style={{ color: '#d97706' }}>📅 {item.date}</b></td>
                  <td>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#d97706' }}>
                      {item.type || 'NATIONAL'}
                    </span>
                  </td>
                  <td><Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="link" onClick={() => setEditingHoliday(item)}>Edit</button>
                      <button type="button" className="link" onClick={() => handleDelete(item.id, item.holidayName)} style={{ color: '#ef4444' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No Holiday records found. Click "+ ADD New Holiday" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(showAddModal || editingHoliday) && (
        <HolidayFormModal
          holiday={editingHoliday}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingHoliday(null); }}
        />
      )}
    </>
  );
}
