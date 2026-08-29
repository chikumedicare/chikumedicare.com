import { getErrorMessage } from '../../utils/dataIntegrity';
import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { SfcRate } from '../../core/domain/hr/sfc.types';
import type { Headquarter, Area } from '../../core/domain/hr/geography.types';
import type { DaRate } from '../../core/domain/hr/leave.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { SfcFormModal } from './SfcFormModal';

export function SfcMaster({
  hqs = [],
  areas = [],
  daRates: propDaRates = [],
}: {
  hqs?: Headquarter[];
  areas?: Area[];
  daRates?: DaRate[];
}) {
  const [sfcList, setSfcList] = useState<SfcRate[]>([]);
  const [liveDaRates, setLiveDaRates] = useState<DaRate[]>(propDaRates || []);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [travelTypeFilter, setTravelTypeFilter] = useState('ALL');
  const [originFilter, setOriginFilter] = useState('ALL');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSfc, setEditingSfc] = useState<SfcRate | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const [sfcData, daData] = await Promise.all([
        GatewayContainer.getSfcGateway().getSfcRates(),
        GatewayContainer.getDaGateway().getDaRates(),
      ]);
      setSfcList(sfcData || []);
      if (daData && daData.length > 0) setLiveDaRates(daData);
    } catch (err) {
      setSfcList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = async (draft: Partial<SfcRate>) => {
    try {
      await GatewayContainer.getSfcGateway().saveSfcRate(draft);
      await refreshList();
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
  const avgFare = totalRoutes > 0 ? Math.round(sfcList.reduce((sum, s) => sum + s.approvedFare, 0) / totalRoutes) : 0;

  return (
    <>
      <Head
        title="SFC Master (Standard Fare Chart)"
        sub="Standard Fare Chart (SFC) Distance & Fare Slabs."
        action={
          <button
            className="primary"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px', fontWeight: 600 }}
          >
            + Add New SFC
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{totalRoutes} SFC Routes</b>
          <small>Standard Fare Slabs</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>{exhqCount} EX-HQ</b>
          <small>Day Return Fare Slabs</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#d97706' }}>{outstationCount} Outstation</b>
          <small>Night Stay Fare Slabs</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#16a34a' }}>₹{avgFare} / Route</b>
          <small>Average Approved Fare</small>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Search by Origin, Destination Town, or Category..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 260px' }}
        />
        <select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Origin Locations</option>
          {hqs.map((h) => (
            <option key={h.id} value={h.id}>{h.name || h.hq_name} (HQ)</option>
          ))}
        </select>
        <select value={travelTypeFilter} onChange={(e) => setTravelTypeFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Travel Categories</option>
          <option value="EX_HQ">EX-HQ Only</option>
          <option value="OUTSTATION">OUTSTATION Only</option>
          <option value="LOCAL_HQ">LOCAL HQ Only</option>
        </select>
      </div>

      {/* SFC Table */}
      <div className="panel table">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading SFC Route Slabs & Live DA Rates...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Origin (From Node)</th>
                <th>Destination (To Node)</th>
                <th>Travel Category</th>
                <th>Distance (1-Way / Round)</th>
                <th>Rate / KM (DA Policy)</th>
                <th>Approved Fare</th>
                <th>Effective Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a' }}>{item.fromNodeName || item.fromHqName || item.fromNodeId}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.fromNodeType || 'Origin'}</small>
                  </td>
                  <td>
                    <b style={{ color: '#0284c7' }}>{item.toNodeName || item.toAreaName || item.toNodeId}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.toNodeType || 'Destination'}</small>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        background: item.travelType === 'OUTSTATION' ? '#fef3c7' : item.travelType === 'EX_HQ' ? '#e0f2fe' : '#f1f5f9',
                        color: item.travelType === 'OUTSTATION' ? '#d97706' : item.travelType === 'EX_HQ' ? '#0284c7' : '#475569'
                      }}
                    >
                      {item.travelType}
                    </span>
                  </td>
                  <td>
                    <b>{item.distanceKm} KM</b> (1-Way)
                    <small style={{ color: '#64748b', display: 'block' }}>
                      Round Trip: <b>{item.roundTripKm} KM</b>
                    </small>
                  </td>
                  <td>
                    <b style={{ color: '#7c3aed' }}>₹{item.ratePerKm || 3.5}/KM</b>
                  </td>
                  <td>
                    <b style={{ fontSize: '15px', color: '#16a34a' }}>₹ {item.approvedFare}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>Approved Fare</small>
                  </td>
                  <td><b>{item.effectiveFrom || '2026-04-01'}</b></td>
                  <td><Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="link"
                        onClick={() => setEditingSfc(item)}
                        style={{ fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link"
                        onClick={() => handleDelete(item.id, `${item.fromNodeName || item.fromHqName} ➔ ${item.toNodeName || item.toAreaName}`)}
                        style={{ color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No SFC route fare slabs found. Click "+ Add New SFC" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editingSfc) && (
        <SfcFormModal
          sfc={editingSfc}
          hqs={hqs}
          areas={areas}
          daRates={liveDaRates}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingSfc(null); }}
        />
      )}
    </>
  );
}
