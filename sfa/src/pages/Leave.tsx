import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Section } from '../components/Section';
import { Badge } from '../components/Badge';
import { TextField, SelectField } from '../components/FormFields';
import { employees, leaveAllocations } from '../data';

export function Leave() {
  const [editing, setEditing] = useState(false);

  if (editing) return <LeaveForm back={() => setEditing(false)} />;

  return (
    <>
      <Head
        title="Leave Allocation"
        sub="Allocate CL, SL and PL balances by financial year."
        action={
          <button className="primary" onClick={() => setEditing(true)}>
            ＋ Add Allocation
          </button>
        }
      />
      <div className="toolbar">
        <select>
          <option>All Users</option>
          {employees.map((e) => (
            <option key={e.id}>
              {e.firstName} {e.lastName}
            </option>
          ))}
        </select>
        <select>
          <option>All FY</option>
          <option>2026-27</option>
          <option>2027-28</option>
        </select>
      </div>
      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>FY</th>
              <th>CL</th>
              <th>SL</th>
              <th>PL</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leaveAllocations.map((l) => {
              const e = employees.find((x) => x.id === l.employeeId);
              return (
                <tr key={l.id}>
                  <td>
                    <b>
                      {e?.firstName} {e?.lastName}
                    </b>
                    <small>{e?.empCode}</small>
                  </td>
                  <td>{l.year}</td>
                  <td>{l.cl}</td>
                  <td>{l.sl}</td>
                  <td>{l.pl}</td>
                  <td>
                    <Badge v={l.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td>
                    <button className="link" onClick={() => setEditing(true)}>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LeaveForm({ back }: { back: () => void }) {
  return (
    <>
      <Head
        title="Add / Edit Leave Allocation"
        sub="Financial year allocation from the existing HR module."
      />
      <Section title="Allocation">
        <div className="two">
          <SelectField
            label="Financial Year"
            value="2026-27"
            onChange={() => {}}
            options={[
              { v: '2026-27', l: 'FY 2026-27 (Current)' },
              { v: '2027-28', l: 'FY 2027-28 (Next)' },
            ]}
          />
          <SelectField
            label="Employee *"
            value="e1"
            onChange={() => {}}
            options={employees.map((e) => ({
              v: e.id,
              l: `${e.firstName} ${e.lastName} (${e.empCode})`,
            }))}
          />
        </div>
        <div className="three">
          <TextField
            label="CL"
            value="12"
            onChange={() => {}}
            placeholder="e.g. 12"
          />
          <TextField
            label="SL"
            value="6"
            onChange={() => {}}
            placeholder="e.g. 6"
          />
          <TextField
            label="PL"
            value="15"
            onChange={() => {}}
            placeholder="e.g. 15"
          />
        </div>
      </Section>
      <div className="actions">
        <button className="secondary" onClick={back}>
          Cancel
        </button>
        <button className="primary" onClick={back}>
          Save
        </button>
      </div>
    </>
  );
}
