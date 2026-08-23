import React from 'react';
import { Head } from '../components/Head';

export function DaRates() {
  return (
    <>
      <Head
        title="DA Rates"
        sub="Daily allowance master."
        action={<button className="primary">＋ Add DA Rate</button>}
      />
      <div className="empty">
        <h3>Blank DA Master Sub-module</h3>
        <p>
          The supplied RN source contains a placeholder DA screen and does not
          define rate fields or business rules. This Web build intentionally does
          not invent them.
        </p>
      </div>
    </>
  );
}
