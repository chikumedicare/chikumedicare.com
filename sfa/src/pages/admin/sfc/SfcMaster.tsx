import React, { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../../../utils/dataIntegrity';
import { GatewayContainer } from '../../../core/container/GatewayContainer';
import type { SfcRate } from '../../../core/domain/hr/sfc.types';
import type { DaRate } from '../../../core/domain/hr/leave.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { useHrStore } from '../../../store/hr/useHrStore';
import { SfcMasterHeader } from './SfcMasterHeader';
import { SfcMasterToolbar } from './SfcMasterToolbar';
import { SfcMasterTable } from './SfcMasterTable';
import { SfcFormModal } from './SfcFormModal';

export function SfcMaster({
  daRates: propDaRates,
}: {
  daRates?: DaRate[];
}) {
  const { hqs, areas, refresh: refreshGeo } = useGeographyStore();
  const { daRates: storeDaRates, refresh: refreshHr } = useHrStore();

  const [sfcList, setSfcList] = useState<SfcRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [travelTypeFilter, setTravelTypeFilter] = useState('ALL');
  const [originFilter, setOriginFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSfc, setEditingSfc] = useState<SfcRate | null>(null);

  const daRates = propDaRates || storeDaRates;

  const refreshList = useCallback(async () => {
    setLoading(true);
    try {
      const sfcData = await GatewayContainer.getSfcGateway().getSfcRates();
      setSfcList(sfcData || []);
    } catch (err) {
      setSfcList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGeo(true);
    refreshHr(true);
    refreshList();
  }, [refreshGeo, refreshHr, refreshList]);

  const handleSave = async (draft: Partial<SfcRate>) => {
    try {
      await GatewayContainer.getSfcGateway().saveSfcRate(draft);
      await refreshList();
      setShowAddModal(false);
      setEditingSfc(null);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as any)?.error || (err as any)?.message || 'Failed to save SFC slab' };
    }
  };

  const handleDelete = async (id: string, routeName: string) => {
    if (window.confirm(`Are you sure you want to remove SFC fare route: ${routeName}?`)) {
      try {
        await GatewayContainer.getSfcGateway().deleteSfcRate(id);
        await refreshList();
      } catch (err: unknown) {
        alert(getErrorMessage(err));
      }
    }
  };

  const filtered = sfcList.filter((item) => {
    if (travelTypeFilter !== 'ALL' && item.travelType !== travelTypeFilter) return false;
    if (originFilter !== 'ALL' && item.fromNodeId !== originFilter && item.fromHqId !== originFilter) return false;
    if (q.trim()) {
      const haystack = `${item.fromNodeName} ${item.toNodeName} ${item.fromHqName} ${item.toAreaName} ${item.travelType}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  const totalRoutes = sfcList.length;
  const exhqCount = sfcList.filter((s) => s.travelType === 'EX_HQ').length;
  const outstationCount = sfcList.filter((s) => s.travelType === 'OUTSTATION').length;
  const avgFare = totalRoutes > 0 ? Math.round(sfcList.reduce((sum, s) => sum + (s.approvedFare || 0), 0) / totalRoutes) : 0;

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <SfcMasterHeader
        totalRoutes={totalRoutes}
        exhqCount={exhqCount}
        outstationCount={outstationCount}
        avgFare={avgFare}
        onOpenAdd={() => setShowAddModal(true)}
      />

      <SfcMasterToolbar
        q={q}
        setQ={setQ}
        originFilter={originFilter}
        setOriginFilter={setOriginFilter}
        travelTypeFilter={travelTypeFilter}
        setTravelTypeFilter={setTravelTypeFilter}
        hqs={hqs}
      />

      <SfcMasterTable
        loading={loading}
        filtered={filtered}
        onEdit={(item) => setEditingSfc(item)}
        onDelete={handleDelete}
      />

      {(showAddModal || editingSfc) && (
        <SfcFormModal
          sfc={editingSfc}
          hqs={hqs}
          areas={areas}
          daRates={daRates}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingSfc(null);
          }}
        />
      )}
    </div>
  );
}
