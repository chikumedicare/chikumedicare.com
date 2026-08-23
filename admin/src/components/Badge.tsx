import React from 'react';

export function Badge({ v }: { v: string }) {
  const x = v.toLowerCase();
  const colorClass = x === 'active' 
    ? 'green' 
    : x === 'inactive' || x.includes('resign') || x.includes('suspend') || x.includes('terminate') 
    ? 'red' 
    : ['mr', 'sr_mr', 'asm', 'sr_asm', 'rsm', 'zsm', 'nsm', 'vp', 'owner', 'admin'].includes(x) 
    ? 'blue' 
    : 'gray';

  return <span className={`badge ${colorClass}`}>{v}</span>;
}
