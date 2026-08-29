import React from 'react';
import { Head } from '../../../components/Head';
import { useHrStore } from '../../../store/hr/useHrStore';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import type { Page } from '../../../types';

export function Dashboard({ go }: { go: (p: Page) => void }) {
  const { employees, users } = useHrStore();
  const { hqs, areas } = useGeographyStore();

  const cards: [Page, string, string][] = [
    ['employees', 'Employee Master', 'HR records and employee lifecycle'],
    ['users', 'User Management', 'SFA access and account lifecycle'],
    ['geography', 'Geography Master', 'Zone → State → HQ → Area → Beat'],
    ['hierarchy', 'Role & Hierarchy', 'Role, reporting and territory assignment'],
    ['transfer', 'Transfer', 'Controlled employee territory transfer'],
    ['promotion', 'Promotion / Demotion', 'Role transition and hierarchy rebuild'],
    ['leave', 'Leave Allocation', 'CL, SL and PL allocation'],
    ['da-rates', 'DA Rates', 'Daily allowance master'],
  ];

  return (
    <>
      <Head
        title="HR & Foundation"
        sub="Web Admin reference implementation of the existing RN HR module."
      />
      <div className="stats">
        <Stat n={employees.length} l="Employees" />
        <Stat n={users.filter((u) => u.isActive).length} l="Active SFA Users" />
        <Stat n={hqs.length} l="HQs" />
        <Stat n={areas.length} l="Areas" />
      </div>
      <div className="grid2">
        {cards.map(([p, t, s]) => (
          <button className="module" key={p} onClick={() => go(p)}>
            <span className="moduleicon">•</span>
            <span>
              <b>{t}</b>
              <small>{s}</small>
            </span>
            <em>›</em>
          </button>
        ))}
      </div>
    </>
  );
}

function Stat({ n, l }: { n: React.ReactNode; l: string }) {
  return (
    <div className="stat">
      <span>{n}</span>
      <small>{l}</small>
    </div>
  );
}
