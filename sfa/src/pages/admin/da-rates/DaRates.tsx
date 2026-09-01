import React, { useState, useEffect } from 'react';
import { useHrStore } from '../../../store/hr/useHrStore';
import type { DaRate, RoleDaSummary, TaPolicy } from '../../../core/domain/hr/leave.types';
import { DaRatesHeader } from './DaRatesHeader';
import { DaRatesToolbar } from './DaRatesToolbar';
import { DaRatesTable } from './DaRatesTable';
import { DaRateFormModal } from './DaRateFormModal';

interface DaRatesProps {
  daRates?: DaRate[];
  onSaveRoleRates?: (
    role: string,
    hq: number,
    exhq: number,
    outstation: number,
    transit: number,
    effectiveFrom?: string,
    isActive?: boolean,
    existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
    taPolicy?: TaPolicy
  ) => Promise<{ success: boolean; error?: string }>;
  onDeleteRoleRates?: (existingIds: string[]) => Promise<{ success: boolean; error?: string }>;
}

export function DaRates({
  daRates: propDaRates,
  onSaveRoleRates: propSave,
  onDeleteRoleRates: propDelete,
}: DaRatesProps) {
  const {
    daRates: storeDaRates,
    addOrUpdateRoleDaRates,
    deleteRoleDaRates,
    refresh,
  } = useHrStore();

  const daRates = propDaRates || storeDaRates;

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'DA' | 'TA'>('DA');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoleSummary, setEditingRoleSummary] = useState<RoleDaSummary | null>(null);

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  // Aggregate raw DA records by role into structured summaries
  const roles = Array.from(new Set(daRates.map((d) => d.role)));
  const roleSummaries: RoleDaSummary[] = roles.map((r) => {
    const roleRates = daRates.filter((d) => d.role === r);
    const hqItem = roleRates.find((d) => d.cityType === 'HQ');
    const exhqItem = roleRates.find((d) => d.cityType === 'EX_HQ');
    const outstationItem = roleRates.find((d) => d.cityType === 'OUTSTATION');
    const transitItem = roleRates.find((d) => d.cityType === 'TRANSIT');

    const firstItem = hqItem || exhqItem || outstationItem || transitItem;

    return {
      role: r,
      hq: hqItem?.amount || 0,
      exhq: exhqItem?.amount || 0,
      outstation: outstationItem?.amount || 0,
      transit: transitItem?.amount || 0,
      effectiveFrom: firstItem?.effectiveFrom || '2026-04-01',
      active: roleRates.some((d) => d.isActive),
      fareType: firstItem?.fareType || 'TWO_WAY',
      kmRate0_199: firstItem?.kmRate0_199 || 3.5,
      kmRate200_299: firstItem?.kmRate200_299 || 4.5,
      travelMode299_599: firstItem?.travelMode299_599 || 'Required Sleeper Ticket',
      travelMode600Plus: firstItem?.travelMode600Plus || 'Required 3rd AC Ticket',
      ids: {
        hq: hqItem?.id,
        exhq: exhqItem?.id,
        outstation: outstationItem?.id,
        transit: transitItem?.id,
      },
    };
  });

  const filteredSummaries = roleSummaries.filter((r) => {
    if (statusFilter === 'ACTIVE' && !r.active) return false;
    if (statusFilter === 'INACTIVE' && r.active) return false;
    if (q.trim()) {
      return r.role.toLowerCase().includes(q.toLowerCase().trim());
    }
    return true;
  });

  const avgHq = roleSummaries.length ? Math.round(roleSummaries.reduce((sum, r) => sum + r.hq, 0) / roleSummaries.length) : 0;
  const avgOutstation = roleSummaries.length ? Math.round(roleSummaries.reduce((sum, r) => sum + r.outstation, 0) / roleSummaries.length) : 0;
  const avgKmRate = roleSummaries.length ? Number((roleSummaries.reduce((sum, r) => sum + (r.kmRate0_199 || 3.5), 0) / roleSummaries.length).toFixed(1)) : 3.5;

  const handleSave = async (
    role: string,
    hq: number,
    exhq: number,
    outstation: number,
    transit: number,
    effectiveFrom?: string,
    isActive?: boolean,
    existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
    taPolicy?: TaPolicy
  ) => {
    if (propSave) {
      const res = await propSave(role, hq, exhq, outstation, transit, effectiveFrom || '2026-04-01', isActive !== false, existingIds, taPolicy);
      if (res.success) {
        setShowAddModal(false);
        setEditingRoleSummary(null);
      }
      return res;
    }

    const res = await addOrUpdateRoleDaRates(role, hq, exhq, outstation, transit, effectiveFrom || '2026-04-01', isActive !== false, existingIds, taPolicy);
    if (res.success) {
      await refresh(true);
      setShowAddModal(false);
      setEditingRoleSummary(null);
    }
    return res;
  };

  const handleDelete = async (r: RoleDaSummary) => {
    if (!window.confirm(`Are you sure you want to reset DA rates for ${r.role}?`)) return;
    const ids = Object.values(r.ids).filter(Boolean) as string[];
    if (propDelete) {
      await propDelete(ids);
    } else {
      await deleteRoleDaRates(ids);
    }
    await refresh(true);
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <DaRatesHeader
        rolesCount={roleSummaries.length}
        avgHq={avgHq}
        avgOutstation={avgOutstation}
        avgKmRate={avgKmRate}
        isReadOnly={false}
        onOpenAdd={() => setShowAddModal(true)}
      />

      <DaRatesToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        q={q}
        setQ={setQ}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <DaRatesTable
        activeTab={activeTab}
        roleSummaries={filteredSummaries}
        onEdit={(r) => setEditingRoleSummary(r)}
        onDelete={handleDelete}
      />

      {(showAddModal || editingRoleSummary) && (
        <DaRateFormModal
          roleSummary={editingRoleSummary}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingRoleSummary(null);
          }}
        />
      )}
    </div>
  );
}
