import { getErrorMessage } from '../../../../utils/dataIntegrity';
import React, { useState, useEffect } from 'react';
import type { Holiday } from '../../../../core/domain/master/fieldMaster.types';
import { GatewayContainer } from '../../../../core/container/GatewayContainer';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';
import { HolidayFormModal } from './HolidayFormModal';

export function HolidayMaster({
  mode = "LIST",
}: {
  mode?: "LIST" | "ADD" | "EDIT" | "DELETE";
}) {
  const fyInfo = getFinancialYearInfo();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await GatewayContainer.getFieldMasterGateway().getHolidays();
      setHolidays(data || []);
    } catch (err) {
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
    if (mode === 'ADD') {
      setShowAddModal(true);
      setEditingHoliday(null);
    }
  }, [mode]);

  const handleDelete = async (id: string, name?: string, holidayFY?: string) => {
    if (holidayFY === fyInfo.previousFY) {
      alert(`Previous Financial Year (${fyInfo.previousFY}) holidays are locked and cannot be deleted.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete Holiday: ${name || id}?`)) return;
    try {
      await GatewayContainer.getFieldMasterGateway().deleteHoliday(id);
      await refreshList();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleSave = async (draft: Partial<Holiday>) => {
    try {
      await GatewayContainer.getFieldMasterGateway().saveHoliday(draft);
      await refreshList();
      return { success: true };
    } catch (err: unknown) {
      alert(getErrorMessage(err));
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const filtered = holidays.filter((h) => {
    if (fyFilter !== 'ALL' && (h.financialYear || fyInfo.currentFY) !== fyFilter) return false;
    if (typeFilter !== 'ALL' && h.type !== typeFilter) return false;
    if (q.trim()) {
      const haystack = `${h.holidayName} ${h.date} ${h.financialYear || ''} ${h.type} ${h.stateName || ''}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      {/* Compact Action & Filter Toolbar */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <input
          placeholder="Search by Festival / Holiday Name, Date, FY, or State..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 280px', minWidth: '220px' }}
        />

        {/* FY Triplet Filter: Previous (Closed), Current, Next */}
        <select
          value={fyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          style={{
            flex: '0 0 auto',
            fontWeight: 800,
            color: '#059669',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
          }}
        >
          <option value="ALL">All Financial Years</option>
          <option value={fyInfo.currentFY}>🟢 Current FY ({fyInfo.currentFY})</option>
          <option value={fyInfo.nextFY}>🔵 Next FY ({fyInfo.nextFY})</option>
          <option value={fyInfo.previousFY}>🔒 Previous FY ({fyInfo.previousFY}) [Closed]</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Holiday Types</option>
          <option value="NATIONAL">National Holidays</option>
          <option value="STATE">State Holidays</option>
          <option value="RESTRICTED">Restricted Holidays</option>
        </select>

        {mode !== 'EDIT' && mode !== 'DELETE' && (
          <button
            type="button"
            className="primary"
            onClick={() => { setShowAddModal(true); setEditingHoliday(null); }}
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
            <span>➕</span> Add New Holiday
          </button>
        )}
      </div>

      {/* Holiday Table View */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Holiday Calendar...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Festival / Occasion Name</th>
                <th>Financial Year (FY)</th>
                <th>Holiday Date</th>
                <th>Day</th>
                <th>Holiday Type</th>
                <th>Applicable Geography</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const itemFY = item.financialYear || fyInfo.currentFY;
                const isPastLocked = itemFY === fyInfo.previousFY;
                const dateObj = new Date(item.date);
                const dayName = isNaN(dateObj.getTime())
                  ? ''
                  : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <tr key={item.id} style={{ opacity: isPastLocked ? 0.75 : 1 }}>
                    <td>
                      <b style={{ color: '#0f172a', fontSize: '14.5px' }}>{item.holidayName}</b>
                      {isPastLocked && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>[Locked]</span>}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: isPastLocked ? '#fee2e2' : itemFY === fyInfo.currentFY ? '#ecfdf5' : '#eff6ff',
                          color: isPastLocked ? '#dc2626' : itemFY === fyInfo.currentFY ? '#059669' : '#2563eb',
                          border: isPastLocked ? '1px solid #fca5a5' : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        FY {itemFY}
                      </span>
                    </td>
                    <td>
                      <b style={{ color: '#0284c7', fontSize: '13.5px' }}>📅 {item.date}</b>
                    </td>
                    <td>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>{dayName || '-'}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: item.type === 'NATIONAL' ? '#ecfdf5' : item.type === 'STATE' ? '#eff6ff' : '#fef3c7',
                          color: item.type === 'NATIONAL' ? '#059669' : item.type === 'STATE' ? '#2563eb' : '#d97706',
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        {item.type === 'NATIONAL' ? '🇮🇳 NATIONAL' : item.type === 'STATE' ? '📍 STATE' : '⭐ RESTRICTED'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#334155', fontWeight: 500 }}>
                        {item.type === 'NATIONAL' ? 'All States (Pan-India)' : item.stateName || 'Specific State'}
                      </span>
                    </td>
                    <td>
                      {isPastLocked ? (
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>🔒 Past Closed</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingHoliday(item); setShowAddModal(true); }}
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
                            onClick={() => handleDelete(item.id, item.holidayName, item.financialYear)}
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
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No Holiday records found matching your filters.
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
          onSave={(draft) => handleSave(draft)}
          onClose={() => { setShowAddModal(false); setEditingHoliday(null); }}
        />
      )}
    </>
  );
}
export default HolidayMaster;
