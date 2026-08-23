import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Badge } from '../components/Badge';

interface Column {
  key: string;
  header: string;
}

interface RowItem {
  id: string;
  [key: string]: any;
}

interface GenericModulePageProps {
  title: string;
  category: string;
  description: string;
  actionText?: string;
  columns: Column[];
  items: RowItem[];
  stats?: { label: string; value: string | number }[];
  onAction?: () => void;
}

export function GenericModulePage({
  title,
  category,
  description,
  actionText,
  columns,
  items,
  stats,
  onAction,
}: GenericModulePageProps) {
  const [q, setQ] = useState('');

  const filteredItems = items.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(q.toLowerCase())
    )
  );

  return (
    <>
      <Head
        title={title}
        sub={`${category} • ${description}`}
        action={
          actionText && (
            <button className="primary" onClick={onAction}>
              ＋ {actionText}
            </button>
          )
        }
      />

      {stats && stats.length > 0 && (
        <div className="stats" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
          {stats.map((s, i) => (
            <div className="stat" key={i}>
              <span>{s.value}</span>
              <small>{s.label}</small>
            </div>
          ))}
        </div>
      )}

      <div className="toolbar">
        <input
          placeholder={`Search ${title}...`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select>
          <option>All Status</option>
          <option>Active / Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="panel table">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.header}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => {
                  const val = row[c.key];
                  const isStatus = c.key.toLowerCase().includes('status');
                  return (
                    <td key={c.key}>
                      {isStatus ? (
                        <Badge v={String(val || 'ACTIVE')} />
                      ) : (
                        <span>{val ?? '—'}</span>
                      )}
                    </td>
                  );
                })}
                <td>
                  <button className="link" onClick={() => {}}>
                    View / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
