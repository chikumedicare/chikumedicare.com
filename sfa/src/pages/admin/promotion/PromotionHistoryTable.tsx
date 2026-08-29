import type { PromotionRecord } from '../../../core/domain/hr/lifecycle.types';
import React, { useState } from 'react';
import { Badge } from '../../../components/Badge';

export function PromotionHistoryTable({
  logs,
  loading,
}: {
  logs: PromotionRecord[];
  loading: boolean;
}) {
  const [q, setQ] = useState('');

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading promotion history from Database...</div>;
  }

  const filteredLogs = logs.filter((log) => {
    const searchLower = q.toLowerCase();
    const nameStr = (log.userName || log.userId || '').toLowerCase();
    const codeStr = (log.userId || '').toLowerCase();
    const remarksStr = (log.remarks || '').toLowerCase();
    return nameStr.includes(searchLower) || codeStr.includes(searchLower) || remarksStr.includes(searchLower);
  });

  return (
    <>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <input
          placeholder="Filter history by employee name, code, or appraisal remarks..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: '360px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Effective Date</th>
            <th>Employee & User ID</th>
            <th>Previous Role ➔ New Role</th>
            <th>Appraisal Remarks & Ref</th>
            <th>Transition Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, idx) => {
            const remarksLower = (log.remarks || '').toLowerCase();
            const isConfirm = remarksLower.includes('probation') || remarksLower.includes('confirm') || (log.action_type || '').toUpperCase() === 'CONFIRMATION';
            const isDemote = remarksLower.includes('demote') || (log.action_type || '').toUpperCase() === 'DEMOTION';

            const statusText = isConfirm ? 'CONFIRMED' : isDemote ? 'DEMOTED' : 'PROMOTED';
            const statusBg = isConfirm ? '#e0f2fe' : isDemote ? '#fee2e2' : '#dcfce7';
            const statusFg = isConfirm ? '#0369a1' : isDemote ? '#b91c1c' : '#15803d';

            return (
              <tr key={log.id || idx}>
                <td>
                  <b>{(log.effectiveDate || log.createdAt) ? new Date(String(log.effectiveDate || log.createdAt)).toLocaleDateString() : '-'}</b>
                </td>
                <td>
                  <b>{log.userName || log.userId}</b>
                  <small style={{ display: 'block' }}>Code: <code>{log.userId}</code></small>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge v={log.previous_role || 'MR'} />
                    <b style={{ color: statusFg }}> ➔ </b>
                    <Badge v={log.new_role || 'ASM'} />
                  </div>
                </td>
                <td>
                  <b>{log.remarks || 'Role Elevation'}</b>
                </td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: statusBg, color: statusFg }}>
                    {statusText}
                  </span>
                </td>
              </tr>
            );
          })}
          {filteredLogs.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No role transition records found in history.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
