import React, { useState } from 'react';
import type { Holiday } from '../../../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../../../utils/dataIntegrity';
import { getFestivalForDate, getFinancialYearInfo } from '../../../../components/FestivalDatePicker';
import { HolidayFormFields } from './HolidayFormFields';
import { HolidayCalendarPicker } from './HolidayCalendarPicker';

interface HolidayFormModalProps {
  holiday: Holiday | null;
  onSave: (draft: Partial<Holiday>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function HolidayFormModal({
  holiday,
  onSave,
  onClose,
}: HolidayFormModalProps) {
  const isEditing = Boolean(holiday);
  const fyInfo = getFinancialYearInfo();

  // Helper to compute FY string from date
  const computeFYFromDate = (dStr: string) => {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return fyInfo.currentFY;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (m >= 4) {
      return `${y}-${String(y + 1).substring(2)}`;
    } else {
      return `${y - 1}-${String(y).substring(2)}`;
    }
  };

  const initialDateStr = holiday?.date || `${fyInfo.currentStartYear}-04-14`;
  const [holidayName, setHolidayName] = useState(holiday?.holidayName || '');
  const [date, setDate] = useState(initialDateStr);
  const [financialYear, setFinancialYear] = useState<string>(
    holiday?.financialYear || computeFYFromDate(initialDateStr)
  );
  const [type, setType] = useState<'NATIONAL' | 'STATE' | 'RESTRICTED'>(holiday?.type || 'NATIONAL');
  const [stateName, setStateName] = useState(holiday?.stateName || 'Madhya Pradesh');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentSelectedFestival = date ? getFestivalForDate(date) : undefined;

  const handleSelectDate = (selectedDateStr: string, festName?: string, festType?: 'NATIONAL' | 'STATE' | 'RESTRICTED') => {
    if (selectedDateStr < fyInfo.minAllowedDate || selectedDateStr > fyInfo.maxAllowedDate) {
      setError(`Holiday date must be within Current FY (${fyInfo.currentFY}) or Next FY (${fyInfo.nextFY}): ${fyInfo.minAllowedDate} to ${fyInfo.maxAllowedDate}.`);
      return;
    }
    setError('');
    setDate(selectedDateStr);
    const calculatedFY = computeFYFromDate(selectedDateStr);
    setFinancialYear(calculatedFY);
    if (festName && (!holidayName.trim() || holidayName === 'New Holiday')) {
      setHolidayName(festName);
    }
    if (festType) {
      setType(festType);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim()) {
      setError('Holiday / Festival Name is required.');
      return;
    }
    if (!date) {
      setError('Holiday Date is required.');
      return;
    }

    // Check Previous FY lock rule
    if (financialYear === fyInfo.previousFY) {
      setError(`Previous Financial Year (${fyInfo.previousFY}) is locked. Holidays can only be created in Current FY (${fyInfo.currentFY}) and Next FY (${fyInfo.nextFY}).`);
      return;
    }

    // Validate date bounds (Apr 1 Current FY to Mar 31 Next FY)
    if (date < fyInfo.minAllowedDate || date > fyInfo.maxAllowedDate) {
      setError(`Date must fall within Current FY (${fyInfo.currentFY}) or Next FY (${fyInfo.nextFY}): ${fyInfo.minAllowedDate} to ${fyInfo.maxAllowedDate}.`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const draft: Partial<Holiday> = {
        id: holiday?.id,
        holidayName: holidayName.trim(),
        date,
        financialYear,
        type,
        stateName: type === 'STATE' ? stateName : undefined,
        isActive: true,
      };

      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save Holiday record.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '880px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #0b1329 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🌴</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                {isEditing ? 'Edit Holiday' : 'Add New Holiday'}
              </h3>
              <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                Create holidays for Current FY ({fyInfo.currentFY}) & Next FY ({fyInfo.nextFY}) (Apr to Mar).
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }}>
            <HolidayFormFields
              holidayName={holidayName}
              setHolidayName={setHolidayName}
              financialYear={financialYear}
              setFinancialYear={setFinancialYear}
              date={date}
              setDate={setDate}
              type={type}
              setType={setType}
              stateName={stateName}
              setStateName={setStateName}
              fyInfo={fyInfo}
              currentSelectedFestival={currentSelectedFestival}
              setError={setError}
              computeFYFromDate={computeFYFromDate}
            />

            <HolidayCalendarPicker
              fyInfo={fyInfo}
              date={date}
              handleSelectDate={handleSelectDate}
            />
          </div>

          {/* Sticky Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{
                flex: 2,
                padding: '11px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Holiday' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default HolidayFormModal;
