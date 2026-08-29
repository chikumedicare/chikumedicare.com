import type { TransferRecord } from '../../../core/domain/hr/lifecycle.types';
import React, { useState } from 'react';
import { Badge } from '../../../components/Badge';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';

export function TransferHistoryTable({
  logs,
  loading,
}: {
  logs: TransferRecord[];
  loading: boolean;
}) {
  const [q, setQ] = useState('');
  const { getHqName } = useGeographyStore();
  const { divisions } = useHeadOfficeStore();

  const getDivisionName = (divId?: string) => {
    if (!divId) return '';
    return divisions.find((d) => d.id === divId)?.name || divId;
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading transfer history from Database...</div>;
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
          placeholder="Filter logs by employee name, code, or reason..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: '360px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Execution Date</th>
            <th>Employee & User ID</th>
            <th>Role</th>
            <th>Origin (HQ & Div) ➔ Destination (HQ & Div)</th>
            <th>Reason & Remarks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, idx) => {
            let oldHqId = '';
            let newHqIdLog = '';
            let oldDivId = '';
            let newDivIdLog = '';
            try {
              const oldD = typeof log.old_data === 'string' ? JSON.parse(log.old_data) : (log.old_data || {});
              const newD = typeof log.new_data === 'string' ? JSON.parse(log.new_data) : (log.new_data || {});
              oldHqId = oldD.previousHqId;
              newHqIdLog = newD.newHqId;
              oldDivId = oldD.previousDivisionId;
              newDivIdLog = newD.newDivisionId;
            } catch (e) {}

            const oldDivName = getDivisionName(oldDivId);
            const newDivName = getDivisionName(newDivIdLog);

            return (
              <tr key={log.id || idx}>
                <td>
                  <b>{log.changed_at ? new Date(log.changed_at).toLocaleDateString() : '-'}</b>
                  <small style={{ color: '#64748b', display: 'block' }}>
                    {log.changed_at ? new Date(log.changed_at).toLocaleTimeString() : ''}
                  </small>
                </td>
                <td>
                  <b>{log.userName || log.userId}</b>
                  <small style={{ display: 'block' }}>Code: <code>{log.userId}</code></small>
                </td>
                <td><Badge v={log.role || 'MR'} /></td>
                <td>
                  <div>
                    <span style={{ color: '#64748b' }}>
                      {getHqName(oldHqId) || 'Previous HQ'}{oldDivName ? ` (${oldDivName})` : ''}
                    </span>
                    <b style={{ color: '#0284c7' }}> ➔ </b>
                    <b style={{ color: '#0f172a' }}>
                      {getHqName(newHqIdLog) || 'New HQ'}{newDivName ? ` (${newDivName})` : ''}
                    </b>
                  </div>
                </td>
                <td>
                  <b>{log.remarks || 'Territory & Division Relocation'}</b>
                </td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
                    EXECUTED
                  </span>
                </td>
              </tr>
            );
          })}
          {filteredLogs.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No territory transfer records found in history.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
