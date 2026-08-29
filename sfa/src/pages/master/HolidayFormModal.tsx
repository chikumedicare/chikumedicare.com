import React, { useState } from 'react';
import type { Holiday } from '../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../utils/dataIntegrity';
import { BASE_INDIAN_FESTIVALS, getFestivalForDate, getFinancialYearInfo } from '../../components/FestivalDatePicker';

interface HolidayFormModalProps {
  holiday: Holiday | null;
  onSave: (draft: Partial<Holiday>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

const INDIAN_STATES = [
  'Madhya Pradesh',
  'Maharashtra',
  'Uttar Pradesh',
  'Rajasthan',
  'Gujarat',
  'Chhattisgarh',
  'Delhi',
  'Bihar',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Kerala',
  'Odisha',
  'Assam',
  'Jharkhand',
  'Uttarakhand',
  'Himachal Pradesh',
  'Goa',
];

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

  const initialDateObj = new Date(initialDateStr);
  const [calYear, setCalYear] = useState(
    isNaN(initialDateObj.getTime()) ? fyInfo.currentStartYear : initialDateObj.getFullYear()
  );
  const [calMonth, setCalMonth] = useState(
    isNaN(initialDateObj.getTime()) ? 3 : initialDateObj.getMonth()
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const prevMonth = () => {
    if (calMonth === 0) {
      if (fyInfo.allowedYears.includes(calYear - 1)) {
        setCalMonth(11);
        setCalYear((y) => y - 1);
      }
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      if (fyInfo.allowedYears.includes(calYear + 1)) {
        setCalMonth(0);
        setCalYear((y) => y + 1);
      }
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

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

  const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const thisMonthFestivals = BASE_INDIAN_FESTIVALS.filter((f) => f.date.startsWith(monthPrefix));
  const currentSelectedFestival = date ? getFestivalForDate(date) : undefined;

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
            {/* Left Column: Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📝</span> Holiday Information
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Holiday / Festival Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Diwali / Independence Day / Eid-ul-Fitr"
                      value={holidayName}
                      onChange={(e) => setHolidayName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Financial Year (FY) *
                    </label>
                    <select
                      className="form-select"
                      value={financialYear}
                      onChange={(e) => {
                        setFinancialYear(e.target.value);
                        if (e.target.value === fyInfo.previousFY) {
                          setError(`Previous FY (${fyInfo.previousFY}) is locked for new holiday additions.`);
                        } else {
                          setError('');
                        }
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 700, color: financialYear === fyInfo.previousFY ? '#dc2626' : '#059669' }}
                    >
                      {/* Previous FY shown as locked */}
                      <option value={fyInfo.previousFY} disabled>
                        🔒 FY {fyInfo.previousFY} (Previous FY - Closed / Read-Only)
                      </option>
                      {/* Current FY */}
                      <option value={fyInfo.currentFY}>
                        🟢 FY {fyInfo.currentFY} (Current Active FY - Apr to Mar)
                      </option>
                      {/* Next FY */}
                      <option value={fyInfo.nextFY}>
                        🔵 FY {fyInfo.nextFY} (Next Upcoming FY - Apr to Mar)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Selected Holiday Date * (Apr to Mar)
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={date}
                      min={fyInfo.minAllowedDate}
                      max={fyInfo.maxAllowedDate}
                      onChange={(e) => {
                        const newD = e.target.value;
                        setDate(newD);
                        const autoFY = computeFYFromDate(newD);
                        setFinancialYear(autoFY);
                        const fest = getFestivalForDate(newD);
                        if (fest && (!holidayName.trim() || holidayName === 'New Holiday')) {
                          setHolidayName(fest.name);
                          setType(fest.type);
                        }
                      }}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                    />
                    {currentSelectedFestival && (
                      <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{currentSelectedFestival.icon}</span> {currentSelectedFestival.name} ({currentSelectedFestival.category})
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Holiday Type *
                    </label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="NATIONAL">🇮🇳 National Holiday (All India)</option>
                      <option value="STATE">📍 State Specific Holiday</option>
                      <option value="RESTRICTED">⭐ Restricted / Optional Holiday</option>
                    </select>
                  </div>

                  {type === 'STATE' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Applicable State *
                      </label>
                      <select
                        className="form-select"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>
                🛡️ <strong>Rule Enforced:</strong> Holidays can only be created for <strong>Current FY ({fyInfo.currentFY})</strong> and <strong>Next FY ({fyInfo.nextFY})</strong> from {fyInfo.minAllowedDate} to {fyInfo.maxAllowedDate}. Past FY ({fyInfo.previousFY}) is locked.
              </div>
            </div>

            {/* Right Column: Embedded Interactive Festival Calendar */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              {/* Calendar Month & Year Switcher (Only Current and Next FY Years) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={prevMonth}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: '#334155',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  ◀
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={calMonth}
                    onChange={(e) => setCalMonth(Number(e.target.value))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 800,
                      fontSize: '13px',
                      color: '#0f172a',
                      background: '#fff',
                    }}
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={calYear}
                    onChange={(e) => setCalYear(Number(e.target.value))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 800,
                      fontSize: '13px',
                      color: '#0f172a',
                      background: '#fff',
                    }}
                  >
                    {fyInfo.allowedYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: '#334155',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  ▶
                </button>
              </div>

              {/* Day Headers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center',
                  gap: '4px',
                  marginBottom: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                }}
              >
                <span style={{ color: '#ef4444' }}>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span style={{ color: '#0284c7' }}>SAT</span>
              </div>

              {/* Calendar Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  marginBottom: '12px',
                }}
              >
                {/* Empty slots */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ height: '42px' }} />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const mStr = String(calMonth + 1).padStart(2, '0');
                  const dStr = String(day).padStart(2, '0');
                  const cellDate = `${calYear}-${mStr}-${dStr}`;
                  const isSelected = date === cellDate;
                  const fest = getFestivalForDate(cellDate);
                  const isAllowed = cellDate >= fyInfo.minAllowedDate && cellDate <= fyInfo.maxAllowedDate;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => isAllowed && handleSelectDate(cellDate, fest?.name, fest?.type)}
                      disabled={!isAllowed}
                      style={{
                        height: '42px',
                        borderRadius: '8px',
                        border: isSelected
                          ? '2px solid #10b981'
                          : fest && isAllowed
                          ? '1px solid #fde68a'
                          : '1px solid #e2e8f0',
                        background: isSelected
                          ? '#ecfdf5'
                          : !isAllowed
                          ? '#f8fafc'
                          : fest
                          ? '#fefce8'
                          : '#ffffff',
                        cursor: isAllowed ? 'pointer' : 'not-allowed',
                        opacity: isAllowed ? 1 : 0.4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px',
                        transition: 'all 0.1s ease',
                      }}
                      title={!isAllowed ? `Locked: Outside Current (${fyInfo.currentFY}) or Next (${fyInfo.nextFY}) FY` : fest ? `${fest.name} (${fest.type})` : cellDate}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isSelected || fest ? 800 : 500,
                          color: !isAllowed ? '#94a3b8' : isSelected ? '#065f46' : fest ? '#b45309' : '#1e293b',
                        }}
                      >
                        {day}
                      </span>
                      {fest && isAllowed && (
                        <span
                          style={{
                            fontSize: '8.5px',
                            lineHeight: 1,
                            marginTop: '1px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '44px',
                            color: '#b45309',
                            fontWeight: 700,
                          }}
                        >
                          {fest.icon} {fest.name.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Month's Festivals Quick Pick */}
              {thisMonthFestivals.length > 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    border: '1px solid #e2e8f0',
                    maxHeight: '110px',
                    overflowY: 'auto',
                  }}
                >
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                    🎉 {monthNames[calMonth]} Festivals:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {thisMonthFestivals.map((f) => {
                      const isAllowed = f.date >= fyInfo.minAllowedDate && f.date <= fyInfo.maxAllowedDate;
                      return (
                        <button
                          key={f.date}
                          type="button"
                          onClick={() => isAllowed && handleSelectDate(f.date, f.name, f.type)}
                          disabled={!isAllowed}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: !isAllowed ? '#f1f5f9' : date === f.date ? '#ecfdf5' : '#f8fafc',
                            border: !isAllowed ? '1px solid #e2e8f0' : date === f.date ? '1px solid #10b981' : '1px solid #e2e8f0',
                            color: !isAllowed ? '#94a3b8' : date === f.date ? '#065f46' : '#334155',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: isAllowed ? 'pointer' : 'not-allowed',
                            opacity: isAllowed ? 1 : 0.5,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>{f.icon}</span> {f.name} ({f.date.substring(8)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '6px' }}>
                  No major festivals in this month. Click any date within FY to select.
                </div>
              )}
            </div>
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
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || financialYear === fyInfo.previousFY}
              style={{
                flex: 2,
                padding: '11px 18px',
                borderRadius: '10px',
                border: 'none',
                background: financialYear === fyInfo.previousFY ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontWeight: 700,
                fontSize: '13.5px',
                color: '#ffffff',
                boxShadow: financialYear === fyInfo.previousFY ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.35)',
                cursor: financialYear === fyInfo.previousFY ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving Holiday...' : isEditing ? 'Update Holiday' : 'Save & Register Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default HolidayFormModal;
