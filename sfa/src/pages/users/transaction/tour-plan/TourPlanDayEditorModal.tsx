import React, { useState } from 'react';
import type { TourPlanDay, WorkType, WorkWithMode } from '../../../../core/domain/transaction/tourPlan.types';

interface TourPlanDayEditorModalProps {
  day: TourPlanDay;
  availableAreas: { id: string; name: string }[];
  availableManagers: { id: string; name: string; role: string }[];
  onSave: (updatedDay: TourPlanDay) => void;
  onClose: () => void;
}

export function TourPlanDayEditorModal({
  day,
  availableAreas,
  availableManagers,
  onSave,
  onClose,
}: TourPlanDayEditorModalProps) {
  const [workType, setWorkType] = useState<WorkType>(day.workType);
  const [workWithMode, setWorkWithMode] = useState<WorkWithMode>(day.workWithMode || 'ALONE');
  const [selectedJointManagerId, setSelectedJointManagerId] = useState<string>(day.jointWithIds?.[0] || availableManagers[0]?.id || '');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(day.workingAreaIds?.[0] || availableAreas[0]?.id || '');
  const [remarks, setRemarks] = useState<string>(day.remarks || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const areaObj = availableAreas.find((a) => a.id === selectedAreaId);
    const mgrObj = availableManagers.find((m) => m.id === selectedJointManagerId);

    const updated: TourPlanDay = {
      ...day,
      workType,
      workWithMode,
      jointWithIds: workWithMode === 'JOINT' && mgrObj ? [mgrObj.id] : undefined,
      jointWithNames: workWithMode === 'JOINT' && mgrObj ? [mgrObj.name] : undefined,
      workingAreaIds: workType === 'FIELD_WORK' && areaObj ? [areaObj.id] : [],
      workingAreaNames: workType === 'FIELD_WORK' && areaObj ? [areaObj.name] : [],
      remarks: remarks.trim() || undefined,
    };
    onSave(updated);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
          maxWidth: '560px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              🗓️ Edit Day: {day.date} ({day.dayName})
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Customize work type, field patch, and joint working mode
            </small>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, fontSize: '12px', color: '#475569', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              1. Work Classification *
            </label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value as WorkType)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff', fontWeight: 700, color: '#0284c7' }}
            >
              <option value="FIELD_WORK">💼 Field Work (Doctor/Chemist Detailing)</option>
              <option value="MEETING">👥 Cycle Meeting / Conference</option>
              <option value="TRANSIT">🚆 Transit / Travel Day</option>
              <option value="CAMP">🏕️ Special Diagnostic Camp</option>
              <option value="LEAVE">🏖️ Leave</option>
              <option value="HOLIDAY">🎉 Official Holiday</option>
              <option value="WEEKLY_OFF">🔴 Weekly Off (Sunday)</option>
            </select>
          </div>

          {workType === 'FIELD_WORK' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  2. Working Territory / Patch *
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                >
                  {availableAreas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    3. Work Mode
                  </label>
                  <select
                    value={workWithMode}
                    onChange={(e) => setWorkWithMode(e.target.value as WorkWithMode)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="ALONE">Single (Alone)</option>
                    <option value="JOINT">Joint Work (with Manager)</option>
                  </select>
                </div>

                {workWithMode === 'JOINT' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Joint Manager
                    </label>
                    <select
                      value={selectedJointManagerId}
                      onChange={(e) => setSelectedJointManagerId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    >
                      {availableManagers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Day Objectives / Route Remarks
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Focus on launching D-Cal 500 in Zone 1 clinics..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13.5px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                cursor: 'pointer',
              }}
            >
              💾 Update Day Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
