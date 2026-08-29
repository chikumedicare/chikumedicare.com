import React from 'react';
import type { SecondarySalesEntryRecord } from '../../../../core/domain/transaction/secondarySales.types';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';

interface SecondarySalesListProps {
  entries: SecondarySalesEntryRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fyFilter: string;
  setFyFilter: (fy: string) => void;
  monthFilter: string;
  setMonthFilter: (m: string) => void;
  stockistFilter: string;
  setStockistFilter: (s: string) => void;
  monthNames: string[];
  stockists: any[];
  onAddNew: () => void;
  onEdit: (entry: SecondarySalesEntryRecord) => void;
  onDelete: (id: string) => void;
}

export function SecondarySalesList({
  entries,
  searchQuery,
  setSearchQuery,
  fyFilter,
  setFyFilter,
  monthFilter,
  setMonthFilter,
  stockistFilter,
  setStockistFilter,
  monthNames,
  stockists,
  onAddNew,
  onEdit,
  onDelete,
}: SecondarySalesListProps) {
  const fyInfo = getFinancialYearInfo();

  const totalEntriesCount = entries.length;
  const totalUnits = entries.reduce((sum, e) => sum + e.totalQuantity, 0);
  const totalVal = entries.reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <>
      {/* Top Filter Toolbar */}
      <div
        className="toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <input
          placeholder="Search by Stockist Name, HQ, Month (YYYY-MM), or FY..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: '200px' }}
        />

        <select
          value={fyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          style={{ flex: '0 0 auto', fontWeight: 800, color: '#059669', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Financial Years</option>
          <option value={fyInfo.currentFY}>🟢 Current FY ({fyInfo.currentFY})</option>
          <option value={fyInfo.nextFY}>🔵 Next FY ({fyInfo.nextFY})</option>
          <option value={fyInfo.previousFY}>🔒 Previous FY ({fyInfo.previousFY})</option>
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Sales Months</option>
          {monthNames.map((m, idx) => {
            const mm = String(idx + 1).padStart(2, '0');
            return (<option key={mm} value={mm}>{m}</option>);
          })}
        </select>

        <select
          value={stockistFilter}
          onChange={(e) => setStockistFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Stockists</option>
          {stockists.map((stk) => (
            <option key={stk.id} value={stk.id}>{stk.firmName} ({stk.hqName})</option>
          ))}
        </select>

        <button
          type="button"
          className="primary"
          onClick={onAddNew}
          style={{
            marginLeft: 'auto',
            borderRadius: '10px',
            fontWeight: 700,
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>➕</span> Add Secondary Sales
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🏬
          </div>
          <div>
            <small style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>Stockist Statements</small>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{totalEntriesCount} Records</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            📦
          </div>
          <div>
            <small style={{ fontSize: '11.5px', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>Secondary Sold Units</small>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{totalUnits.toLocaleString('en-IN')} Units</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            💰
          </div>
          <div>
            <small style={{ fontSize: '11.5px', color: '#854d0e', fontWeight: 800, textTransform: 'uppercase' }}>Secondary Sales Value</small>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0284c7' }}>₹ {totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table>
          <thead>
            <tr>
              <th>Stockist Firm Name</th>
              <th>Base HQ</th>
              <th>Sales Month</th>
              <th>Financial Year</th>
              <th>Secondary Quantity</th>
              <th>Total Value (₹ PTR)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item) => {
              const [y, m] = item.monthYear.split('-');
              const monthName = monthNames[parseInt(m, 10) - 1] || item.monthYear;

              return (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '14px' }}>{item.stockistName}</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.id}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                      📍 {item.hqName || 'Bhopal'}
                    </span>
                  </td>
                  <td>
                    <b style={{ color: '#0284c7', fontSize: '13.5px' }}>🗓️ {monthName} {y}</b>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                      FY {item.financialYear}
                    </span>
                  </td>
                  <td>
                    <b style={{ color: '#059669', fontSize: '14px' }}>
                      📦 {item.totalQuantity.toLocaleString('en-IN')} Units
                    </b>
                  </td>
                  <td>
                    <b style={{ color: '#0284c7', fontSize: '14px' }}>
                      ₹{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </b>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                      >
                        ✏️ Edit Qty
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#991b1b' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {entries.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No Secondary Sales records found. Click <strong>"➕ Add Secondary Sales"</strong> to record stockist secondary movement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
