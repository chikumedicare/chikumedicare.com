import React from 'react';

interface HeadProps {
  title: string;
  sub: string;
  action?: React.ReactNode;
}

export function Head({ title, sub, action }: HeadProps) {
  return (
    <div className="head">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
