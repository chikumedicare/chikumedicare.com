import { getErrorMessage } from '../../../utils/dataIntegrity';
import type { TransferRecord } from '../../../core/domain/hr/lifecycle.types';
import React, { useState, useEffect } from 'react';
import { Head } from '../../../components/Head';
import { Section } from '../../../components/Section';
import { SelectField, TextField } from '../../../components/FormFields';
import { Badge } from '../../../components/Badge';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { GatewayContainer } from '../../../core/container/GatewayContainer';
import { TransferHistoryTable } from './TransferHistoryTable';

export function TransferWorkflow({
  users,
  preselectedUser,
  onComplete,
  back,
}: {
  users: SfaUser[];
  preselectedUser?: SfaUser | null;
  onComplete: () => void;
  back: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'FORM' | 'HISTORY'>('FORM');
  const [targetUserId, setTargetUserId] = useState<string>(preselectedUser?.id || '');
  const [destinationDivisionId, setDestinationDivisionId] = useState<string>('');
  const [destinationStateId, setDestinationStateId] = useState<string>('');
  const [newHqId, setNewHqId] = useState<string>('');
  const [reason, setReason] = useState<string>('Territory Expansion');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState<string>('');

  const [executing, setExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const [historyLogs, setHistoryLogs] = useState<TransferRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { hqs, states, getHqName } = useGeographyStore();
  const { divisions } = useHeadOfficeStore();

  const currentTarget = users.find((u) => u.id === targetUserId);
  const currentDivisionId = currentTarget?.divisionId || '';

  useEffect(() => {
    if (currentTarget && !destinationDivisionId) {
      setDestinationDivisionId(currentDivisionId);
    }
  }, [currentTarget]);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      setHistoryLoading(true);
      GatewayContainer.getTransferGateway().getTransferHistory()
        .then((res) => setHistoryLogs(Array.isArray(res) ? res : []))
        .catch(() => setHistoryLogs([]))
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab]);

  // Filter HQs by selected division and state
  const filteredHqs = hqs.filter((h) => {
    const matchState = !destinationStateId || h.stateId === destinationStateId;
    const matchDiv = !destinationDivisionId || h.divisionId === destinationDivisionId;
    return matchState && matchDiv;
  });

  // Auto-update division when selecting an HQ if not explicitly locked
  const handleHqChange = (hqIdVal: string) => {
    setNewHqId(hqIdVal);
    const selectedHq = hqs.find((h) => h.id === hqIdVal);
    if (selectedHq) {
      const hqDiv = selectedHq.divisionId;
      if (hqDiv) {
        setDestinationDivisionId(hqDiv);
      }
    }
  };

  const getDivisionName = (divId?: string) => {
    if (!divId) return 'Main Division';
    return divisions.find((d) => d.id === divId)?.name || divId;
  };

  const handleValidateAndOpenConfirm = () => {
    if (!targetUserId) {
      setError('Please select an employee to transfer');
      return;
    }
    if (!newHqId) {
      setError('Please select a Destination Headquarter (HQ)');
      return;
    }
    if (newHqId === currentTarget?.hqId && destinationDivisionId === currentDivisionId) {
      setError('Destination HQ and Division are identical to current assignment');
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const handleExecuteTransfer = async () => {
    if (!currentTarget || !newHqId) return;
    setExecuting(true);
    setError('');

    try {
      await GatewayContainer.getTransferGateway().transferUser(
        currentTarget.id,
        newHqId,
        destinationDivisionId,
        undefined,
        reason,
        effectiveDate
      );
      setDoneMessage(
        `Success: ${currentTarget.fullName} has been transferred to ${getHqName(newHqId)} (${getDivisionName(destinationDivisionId)}), effective ${effectiveDate}.`
      );
      setShowConfirmModal(false);
      onComplete();
    } catch (e: unknown) {
      setError((e as any)?.message || 'Failed to execute transfer on Database');
      setShowConfirmModal(false);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <>
      <Head
        title="Employee Territory & Division Transfer Workflow"
        sub="Relocate field force employees across Headquarters, States & Marketing Divisions with automatic hierarchy rebuilding."
      />

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          className={activeTab === 'FORM' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('FORM')}
        >
          🔄 Execute New Transfer
        </button>
        <button
          type="button"
          className={activeTab === 'HISTORY' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('HISTORY')}
        >
          📜 Transfer Audit Logs History
        </button>
      </div>

      {activeTab === 'FORM' && (
        <>
          <div className="formGrid">
            {/* Step 1: Target Selection */}
            <Section title="Step 1: Target Employee & Current Location">
              <SelectField
                label="Select Target Field Employee *"
                value={targetUserId}
                onChange={(v) => {
                  setTargetUserId(v);
                  setNewHqId(''); }}
                options={[
                  { v: '', l: '-- Select Employee to Transfer --' },
                  ...users
                    .filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER')
                    .map((u) => ({
                      v: u.id,
                      l: `${u.fullName} (${u.role} - ${u.empCode || u.userId})`,
                    })),
                ]}
              />

              {currentTarget && (
                <div style={{ marginTop: '12px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{currentTarget.fullName}</div>
                  <div style={{ marginTop: '4px', color: '#475569' }}>
                    Role: <Badge v={currentTarget.role} /> • Code: <code>{currentTarget.empCode || currentTarget.userId}</code>
                  </div>
                  <div style={{ marginTop: '6px', color: '#0369a1', fontWeight: 600 }}>
                    Current Base HQ: <b>{getHqName(currentTarget.hqId) || 'Unassigned'}</b> | Current Division: <b>{getDivisionName(currentDivisionId)}</b>
                  </div>
                </div>
              )}

              {/* Step 2: Destination Division & HQ Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                <SelectField
                  label="Destination Marketing Division *"
                  value={destinationDivisionId}
                  onChange={(v) => {
                    setDestinationDivisionId(v);
                    setNewHqId(''); }}
                  options={[
                    { v: '', l: '-- Select Marketing Division --' },
                    ...divisions.map((d) => ({ v: d.id, l: `${d.code} - ${d.name}` })),
                  ]}
                />
                <SelectField
                  label="Filter Destination State (Optional)"
                  value={destinationStateId}
                  onChange={(v) => {
                    setDestinationStateId(v);
                    setNewHqId(''); }}
                  options={[
                    { v: '', l: '-- All States --' },
                    ...states.map((s) => ({ v: s.id, l: s.name })),
                  ]}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <SelectField
                  label="New Destination HQ *"
                  value={newHqId}
                  onChange={handleHqChange}
                  options={[
                    { v: '', l: '-- Select Destination HQ --' },
                    ...filteredHqs.map((h) => ({ v: h.id, l: `${h.code} - ${h.name}` })),
                  ]}
                />
              </div>
            </Section>

            {/* Step 3: Parameters & Impact */}
            <Section title="Step 2: Transfer Reason & Parameters">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <SelectField
                  label="Transfer Reason *"
                  value={reason}
                  onChange={setReason}
                  options={[
                    { v: 'Territory Expansion', l: 'Territory Expansion' },
                    { v: 'Business Reorganization', l: 'Business Reorganization' },
                    { v: 'Division Relocation', l: 'Division Relocation' },
                    { v: 'Routine Rotation', l: 'Routine Rotation' },
                    { v: 'Employee Request', l: 'Relocation on Employee Request' },
                    { v: 'Performance Realignment', l: 'Performance Realignment' },
                    { v: 'Vacancy Replacement', l: 'Vacancy Replacement' },
                  ]}
                />
                <TextField
                  label="Effective Date *"
                  type="date"
                  value={effectiveDate}
                  onChange={setEffectiveDate}
                />
              </div>

              <TextField
                label="Transfer Remarks / Order Ref"
                placeholder="e.g. Approved via HO Order #TR-2026-88"
                value={remarks}
                onChange={setRemarks}
              />

              {/* Automatic Relocation Notice */}
              <div style={{ marginTop: '14px', padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px' }}>
                <b style={{ color: '#166534' }}>ℹ️ Automatic Relocation Adjustments:</b>
                <ul style={{ margin: '6px 0 0 16px', padding: 0, color: '#15803d', lineHeight: 1.5 }}>
                  <li>Base HQ updated to <b>{getHqName(newHqId) || '(Select HQ)'}</b>.</li>
                  <li>Marketing Division updated to <b>{getDivisionName(destinationDivisionId)}</b>.</li>
                  <li>Territory area mappings outside destination territory auto-cleared.</li>
                  <li>Supervisor reporting chain updated in Database.</li>
                </ul>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px', fontWeight: 600 }}>⚠️ {error}</div>}
            </Section>
          </div>

          <div className="actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="secondary" onClick={back}>Cancel</button>
            <button type="button" className="primary" onClick={handleValidateAndOpenConfirm}>
              Review & Execute Transfer ➔
            </button>
          </div>
        </>
      )}

      {/* History Log Tab */}
      {activeTab === 'HISTORY' && (
        <div className="panel table">
          <TransferHistoryTable logs={historyLogs} loading={historyLoading} />
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '22px' }}>
              🔄
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a', textAlign: 'center' }}>
              Confirm Territory & Division Relocation
            </h3>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', margin: '14px 0', border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#64748b' }}>Target Employee:</span><b>{currentTarget.fullName} ({currentTarget.role})</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#64748b' }}>Current HQ & Div:</span><b>{getHqName(currentTarget.hqId)} ({getDivisionName(currentDivisionId)})</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#64748b' }}>Destination HQ & Div:</span><b style={{ color: '#0284c7' }}>{getHqName(newHqId)} ({getDivisionName(destinationDivisionId)})</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Effective Date:</span><b>{effectiveDate}</b></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="secondary" disabled={executing} onClick={() => setShowConfirmModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="button" className="primary" disabled={executing} onClick={handleExecuteTransfer} style={{ flex: 1, background: '#0284c7', borderColor: '#0284c7' }}>
                {executing ? 'Executing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Done Modal */}
      {doneMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px' }}>
              ✅
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              Transfer Successfully Executed!
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              {doneMessage}
            </p>
            <button type="button" className="primary" onClick={() => { setDoneMessage(null); back(); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#16a34a', borderColor: '#16a34a' }}>
              Done / Return to Users
            </button>
          </div>
        </div>
      )}
    </>
  );
}
