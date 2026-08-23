import React from 'react';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
