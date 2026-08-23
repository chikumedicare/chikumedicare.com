import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Section } from '../components/Section';
import { SelectField } from '../components/FormFields';
import { hqs, roles } from '../data';
import type { User, Role } from '../types';

export function Promotion({
  user,
  back,
}: {
  user: User | null;
  back: () => void;
}) {
  const [role, setRole] = useState<Role>(user?.role || 'MR');
  const [hq, setHq] = useState(user?.hqId || '');

  return (
    <>
      <Head
        title="Promotion / Demotion"
        sub="Controlled role transition workflow."
      />
      <Section title="Promotion Details">
        <div className="confirm">
          <span>User</span>
          <b>{user?.fullName || 'Select user from User Management'}</b>
          <span>Current Role</span>
          <b>{user?.role || '—'}</b>
          <span>Current HQ</span>
          <b>{hqs.find((h) => h.id === user?.hqId)?.name || '—'}</b>
        </div>
        <div className="two">
          <SelectField
            label="New Role"
            value={role}
            onChange={(v) => setRole(v as Role)}
            options={roles.map((v) => ({ v, l: v }))}
          />
          <SelectField
            label="New Base HQ"
            value={hq}
            onChange={setHq}
            options={hqs.map((h) => ({ v: h.id, l: `${h.code} — ${h.name}` }))}
          />
        </div>
        <div className="note">
          When connected, the backend promotion endpoint changes role state,
          writes role history, invalidates permission cache and rebuilds hierarchy.
        </div>
      </Section>
      <div className="actions">
        <button className="secondary" onClick={back}>
          Cancel
        </button>
        <button className="primary" onClick={back}>
          Commit Changes
        </button>
      </div>
    </>
  );
}
