import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Section } from '../components/Section';
import { SelectField } from '../components/FormFields';
import { hqs } from '../data';
import type { User } from '../types';

export function Transfer({
  user,
  back,
}: {
  user: User | null;
  back: () => void;
}) {
  const [hq, setHq] = useState(user?.hqId || '');

  return (
    <>
      <Head
        title={`Transfer${user ? `: ${user.fullName}` : ''}`}
        sub="Two-step controlled transfer workflow."
      />
      <div className="grid2">
        <Section title="Step 1: Select New HQ">
          <p className="muted">
            Current HQ:{' '}
            {hqs.find((h) => h.id === user?.hqId)?.name || 'Not assigned'}
          </p>
          <SelectField
            label="New HQ"
            value={hq}
            onChange={setHq}
            options={hqs.map((h) => ({ v: h.id, l: `${h.code} — ${h.name}` }))}
          />
        </Section>
        <Section title="Step 2: Confirm Transfer">
          <div className="confirm">
            <span>Employee</span>
            <b>{user?.fullName || 'Select user from User Management'}</b>
            <span>Role</span>
            <b>{user?.role || '—'}</b>
            <span>New HQ</span>
            <b>{hqs.find((h) => h.id === hq)?.name || '—'}</b>
          </div>
          <div className="note">
            When connected, the backend transfer endpoint updates territory
            mappings, history and hierarchy atomically.
          </div>
        </Section>
      </div>
      <div className="actions">
        <button className="secondary" onClick={back}>
          Cancel
        </button>
        <button className="primary" onClick={back}>
          Confirm Transfer
        </button>
      </div>
    </>
  );
}
