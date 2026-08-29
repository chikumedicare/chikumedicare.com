import { getErrorMessage } from '../../utils/dataIntegrity';
import type { PromotionRecord } from '../../core/domain/hr/lifecycle.types';
import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Section } from '../../components/Section';
import { SelectField, TextField } from '../../components/FormFields';
import { Badge } from '../../components/Badge';
import type { SfaUser, SfaRole } from '../../core/domain/hr/user.types';
import { useGeographyStore } from '../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { PromotionHistoryTable } from './PromotionHistoryTable';

const ROLE_HIERARCHY_LEVELS: Record<SfaRole, number> = {
  MR: 1, SR_MR: 2, ASM: 3, SR_ASM: 4, RSM: 5, ZSM: 6, NSM: 7, VP: 8, ADMIN: 9, OWNER: 10,
};

const DEFAULT_TITLES: Record<SfaRole, string> = {
  MR: 'Medical Representative',
  SR_MR: 'Senior Medical Representative (Sr. MR)',
  ASM: 'Area Sales Manager',
  SR_ASM: 'Senior Area Sales Manager (Sr. ASM)',
  RSM: 'Regional Sales Manager',
  ZSM: 'Zonal Sales Manager',
  NSM: 'National Sales Manager',
  VP: 'Vice President - Sales',
  ADMIN: 'System Administrator',
  OWNER: 'Managing Director / Owner',
};

export function PromotionWorkflow({
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
  const [activeTab, setActiveTab] = useState<'WIZARD' | 'HISTORY'>('WIZARD');
  const [actionType, setActionType] = useState<'PROMOTION' | 'DEMOTION' | 'CONFIRMATION'>('PROMOTION');
  const [selectedUserId, setSelectedUserId] = useState<string>(preselectedUser?.id || '');
  const [targetRole, setTargetRole] = useState<SfaRole>('SR_MR');
  const [targetHqId, setTargetHqId] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState<string>('');

  const [executing, setExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const [historyLogs, setHistoryLogs] = useState<PromotionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { hqs, getHqName } = useGeographyStore();
  const { divisions } = useHeadOfficeStore();

  const fieldUsers = users.filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER');
  const currentTarget = users.find((u) => u.id === selectedUserId);

  useEffect(() => {
    if (currentTarget) {
      setTargetHqId(currentTarget.hqId || '');
      const currLevel = ROLE_HIERARCHY_LEVELS[currentTarget.role] || 1;
      if (actionType === 'PROMOTION') {
        const nextRole = (['MR', 'SR_MR', 'ASM', 'SR_ASM', 'RSM', 'ZSM', 'NSM', 'VP'] as SfaRole[]).find(
          (r) => ROLE_HIERARCHY_LEVELS[r] > currLevel
        ) || 'SR_MR';
        setTargetRole(nextRole);
        setDesignation(DEFAULT_TITLES[nextRole] || nextRole);
      } else if (actionType === 'CONFIRMATION') {
        setTargetRole(currentTarget.role);
        setDesignation(`Confirmed ${DEFAULT_TITLES[currentTarget.role] || currentTarget.role}`);
      } else {
        const prevRole = (['MR', 'SR_MR', 'ASM', 'SR_ASM', 'RSM', 'ZSM', 'NSM'] as SfaRole[]).reverse().find(
          (r) => ROLE_HIERARCHY_LEVELS[r] < currLevel
        ) || 'MR';
        setTargetRole(prevRole);
        setDesignation(DEFAULT_TITLES[prevRole] || prevRole);
      }
    }
  }, [selectedUserId, actionType]);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      setHistoryLoading(true);
      GatewayContainer.getPromotionGateway().getPromotionHistory().then((res) => setHistoryLogs(Array.isArray(res) ? res : [])).catch(() => setHistoryLogs([])).finally(() => setHistoryLoading(false));
    }
  }, [activeTab]);

  const currLevel = currentTarget ? ROLE_HIERARCHY_LEVELS[currentTarget.role] || 1 : 1;
  const eligibleRoles: SfaRole[] = (['MR', 'SR_MR', 'ASM', 'SR_ASM', 'RSM', 'ZSM', 'NSM', 'VP'] as SfaRole[]).filter((r) => actionType === 'CONFIRMATION' ? ROLE_HIERARCHY_LEVELS[r] === currLevel : actionType === 'PROMOTION' ? ROLE_HIERARCHY_LEVELS[r] > currLevel : ROLE_HIERARCHY_LEVELS[r] < currLevel);

  const getDivisionName = (divId?: string) => {
    if (!divId) return 'Main Division';
    return divisions.find((d) => d.id === divId)?.name || divId;
  };

  const handleValidateAndOpenConfirm = () => {
    if (!selectedUserId) return setError('Please select a field employee');
    if (!targetRole) return setError('Please select a target role');
    if (!designation) return setError('Please enter official designation');
    if (!remarks) return setError('Please provide appraisal remarks / order reference');
    setError('');
    setShowConfirmModal(true);
  };

  const handleExecute = async () => {
    if (!currentTarget) return;
    setExecuting(true);
    setError('');
    try {
      await GatewayContainer.getPromotionGateway().promoteUser(
        currentTarget.id,
        targetRole,
        targetHqId || currentTarget.hqId,
        designation,
        remarks,
        effectiveDate,
        actionType
      );
      setDoneMessage(
        `Success: ${currentTarget.fullName} has been ${actionType === 'CONFIRMATION' ? 'confirmed (Permanent Status)' : actionType === 'PROMOTION' ? 'promoted' : 'demoted'} as ${targetRole} (${designation}), effective ${effectiveDate}.`
      );
      setShowConfirmModal(false);
      onComplete();
    } catch (e: unknown) {
      setError((e as any)?.message || 'Failed to execute role transition');
      setShowConfirmModal(false);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <>
      <Head
        title="Field Force Promotion & Probation Confirmation Workflow"
        sub="Elevate field staff (MR ➔ Sr. MR ➔ ASM), confirm probation periods (6M / 1Y) or reassign roles with live Database updates."
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          className={activeTab === 'WIZARD' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('WIZARD')}
        >
          📈 Role Transition & Confirmation Wizard
        </button>
        <button
          type="button"
          className={activeTab === 'HISTORY' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('HISTORY')}
        >
          📜 Role History Audit Logs
        </button>
      </div>

      {activeTab === 'WIZARD' && (
        <>
          <div className="formGrid">
            {/* Step 1: Employee & Action Type */}
            <Section title="Step 1: Select Field Staff & Transition Type">
              <div style={{ marginBottom: '14px' }}>
                <SelectField
                  label="Select Field Representative *"
                  value={selectedUserId}
                  onChange={(v) => {
                    setSelectedUserId(v);
                    setError('');
                  }}
                  options={[{ v: '', l: '-- Select Field Staff --' }, ...fieldUsers.map((u) => ({ v: u.id, l: `${u.fullName} (${u.role} - ${u.empCode || u.userId}) - HQ: ${getHqName(u.hqId)}` }))]}
                />
              </div>

              {currentTarget && (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{currentTarget.fullName}</b>
                    <Badge v={currentTarget.role} />
                  </div>
                  <div style={{ color: '#475569', marginTop: '4px' }}>
                    Current Title: <b>{currentTarget.designation || currentTarget.role}</b> • Base HQ: <b>{getHqName(currentTarget.hqId)}</b> • Division: <b>{getDivisionName(currentTarget.divisionId)}</b>
                  </div>
                </div>
              )}

              {/* Action Type Toggle */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Transition Type *
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={actionType === 'PROMOTION' ? 'primary' : 'secondary'}
                    onClick={() => setActionType('PROMOTION')}
                    style={{ flex: 1, minWidth: '160px', padding: '10px', borderRadius: '8px', background: actionType === 'PROMOTION' ? '#16a34a' : undefined, borderColor: actionType === 'PROMOTION' ? '#16a34a' : undefined, fontWeight: 700 }}
                  >
                    📈 Promotion (Elevation)
                  </button>
                  <button
                    type="button"
                    className={actionType === 'CONFIRMATION' ? 'primary' : 'secondary'}
                    onClick={() => setActionType('CONFIRMATION')}
                    style={{ flex: 1, minWidth: '160px', padding: '10px', borderRadius: '8px', background: actionType === 'CONFIRMATION' ? '#0284c7' : undefined, borderColor: actionType === 'CONFIRMATION' ? '#0284c7' : undefined, fontWeight: 700 }}
                  >
                    🎓 Probation Confirmation (6M/1Y)
                  </button>
                  <button
                    type="button"
                    className={actionType === 'DEMOTION' ? 'primary' : 'secondary'}
                    onClick={() => setActionType('DEMOTION')}
                    style={{ flex: 1, minWidth: '160px', padding: '10px', borderRadius: '8px', background: actionType === 'DEMOTION' ? '#dc2626' : undefined, borderColor: actionType === 'DEMOTION' ? '#dc2626' : undefined, fontWeight: 700 }}
                  >
                    📉 Demotion (Reassignment)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <SelectField
                  label={actionType === 'CONFIRMATION' ? 'Confirmed Role Title *' : actionType === 'PROMOTION' ? 'Target Senior Role *' : 'Target Subordinate Role *'}
                  value={targetRole}
                  onChange={(v) => {
                    setTargetRole(v as SfaRole);
                    setDesignation(DEFAULT_TITLES[v as SfaRole] || v);
                  }}
                  options={eligibleRoles.map((r) => ({ v: r, l: `${r} - ${DEFAULT_TITLES[r] || r}` }))}
                />
                <SelectField
                  label="Base HQ"
                  value={targetHqId}
                  onChange={setTargetHqId}
                  options={hqs.map((h) => ({ v: h.id, l: `${h.code} - ${h.name}` }))}
                />
              </div>
            </Section>

            {/* Step 2: Role Details & Impact */}
            <Section title="Step 2: Official Title & Appraisal Parameters">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <TextField
                  label="New Official Designation *"
                  value={designation}
                  onChange={setDesignation}
                  placeholder="e.g. Senior Medical Representative (Sr. MR)"
                />
                <TextField
                  label="Effective Date *"
                  type="date"
                  value={effectiveDate}
                  onChange={setEffectiveDate}
                />
              </div>

              <TextField
                label="Reason / Order Ref / Appraisal Remarks *"
                value={remarks}
                onChange={setRemarks}
                placeholder={actionType === 'CONFIRMATION' ? 'e.g. Successfully completed 6-month probation review Order #CONF-2026-12' : 'e.g. Promoted to Sr. MR based on Q2 Performance Review Order #PR-2026-44'}
              />

              {/* Notice Box */}
              <div style={{ marginTop: '14px', padding: '14px', background: actionType === 'CONFIRMATION' ? '#f0fdf4' : '#fff1f2', border: `1px solid ${actionType === 'CONFIRMATION' ? '#bbf7d0' : '#fecdd3'}`, borderRadius: '10px', fontSize: '13px', color: actionType === 'CONFIRMATION' ? '#166534' : '#be123c' }}>
                <b style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                  {actionType === 'CONFIRMATION' ? '🎓 Probation Confirmation Effect:' : '⚠️ Hierarchy & Supervisor Unbind Notice:'}
                </b>
                {actionType === 'CONFIRMATION' ? (
                  <span>Employee transition from Probation to <b>Confirmed Permanent Staff</b>. Service status updated to Confirmed.</span>
                ) : (
                  <span>Changing role level from <b>{currentTarget?.role || 'Current'} ➔ {targetRole}</b> will <b>UNBIND & CLEAR</b> this user's current Reporting Supervisor links. You will need to re-assign reporting hierarchy in <b>Role & Hierarchy</b> for their new level.</span>
                )}
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px', fontWeight: 600 }}>⚠️ {error}</div>}
            </Section>
          </div>

          <div className="actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="secondary" onClick={back}>Cancel</button>
            <button type="button" className="primary" onClick={handleValidateAndOpenConfirm}>
              Review & Commit Transition ➔
            </button>
          </div>
        </>
      )}

      {/* History Log Tab */}
      {activeTab === 'HISTORY' && (
        <div className="panel table">
          <PromotionHistoryTable logs={historyLogs} loading={historyLoading} />
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: actionType === 'CONFIRMATION' ? '#e0f2fe' : actionType === 'PROMOTION' ? '#dcfce7' : '#fee2e2', color: actionType === 'CONFIRMATION' ? '#0284c7' : actionType === 'PROMOTION' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '22px' }}>
              {actionType === 'CONFIRMATION' ? '🎓' : actionType === 'PROMOTION' ? '📈' : '📉'}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a', textAlign: 'center' }}>
              Confirm {actionType === 'CONFIRMATION' ? 'Probation Confirmation' : actionType === 'PROMOTION' ? 'Role Promotion' : 'Role Demotion'}
            </h3>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', margin: '14px 0', border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#64748b' }}>Target Employee:</span><b>{currentTarget.fullName}</b></div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#64748b' }}>Transition:</span><b>{currentTarget.role} ➔ {targetRole}</b></div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#64748b' }}>Official Designation:</span><b>{designation}</b></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Effective Date:</span><b>{effectiveDate}</b></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="secondary" disabled={executing} onClick={() => setShowConfirmModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="button" className="primary" disabled={executing} onClick={handleExecute} style={{ flex: 1, background: actionType === 'CONFIRMATION' ? '#0284c7' : actionType === 'PROMOTION' ? '#16a34a' : '#dc2626', borderColor: actionType === 'CONFIRMATION' ? '#0284c7' : actionType === 'PROMOTION' ? '#16a34a' : '#dc2626' }}>
                {executing ? 'Executing...' : 'Confirm Transition'}
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
              Transition Successfully Executed!
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
