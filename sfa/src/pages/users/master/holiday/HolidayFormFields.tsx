import React from 'react';
import { getFestivalForDate } from '../../../../components/FestivalDatePicker';

export const INDIAN_STATES = [
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

interface HolidayFormFieldsProps {
  holidayName: string;
  setHolidayName: (v: string) => void;
  financialYear: string;
  setFinancialYear: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  type: 'NATIONAL' | 'STATE' | 'RESTRICTED';
  setType: (v: 'NATIONAL' | 'STATE' | 'RESTRICTED') => void;
  stateName: string;
  setStateName: (v: string) => void;
  fyInfo: any;
  currentSelectedFestival: any;
  setError: (err: string) => void;
  computeFYFromDate: (d: string) => string;
}

export function HolidayFormFields({
  holidayName,
  setHolidayName,
  financialYear,
  setFinancialYear,
  date,
  setDate,
  type,
  setType,
  stateName,
  setStateName,
  fyInfo,
  currentSelectedFestival,
  setError,
  computeFYFromDate,
}: HolidayFormFieldsProps) {
  return (
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
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                background: '#fff',
                fontWeight: 700,
                color: financialYear === fyInfo.previousFY ? '#dc2626' : '#059669',
              }}
            >
              <option value={fyInfo.previousFY} disabled>
                🔒 FY {fyInfo.previousFY} (Previous FY - Closed / Read-Only)
              </option>
              <option value={fyInfo.currentFY}>
                🟢 FY {fyInfo.currentFY} (Current Active FY - Apr to Mar)
              </option>
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
  );
}
