import React, { useState } from 'react';
import { BASE_INDIAN_FESTIVALS, getFestivalForDate } from '../../../../components/FestivalDatePicker';

interface HolidayCalendarPickerProps {
  fyInfo: any;
  date: string;
  handleSelectDate: (d: string, festName?: string, festType?: any) => void;
}

export function HolidayCalendarPicker({
  fyInfo,
  date,
  handleSelectDate,
}: HolidayCalendarPickerProps) {
  const initialDateObj = new Date(date);
  const [calYear, setCalYear] = useState<number>(
    isNaN(initialDateObj.getTime()) ? fyInfo.currentStartYear : initialDateObj.getFullYear()
  );
  const [calMonth, setCalMonth] = useState<number>(
    isNaN(initialDateObj.getTime()) ? 3 : initialDateObj.getMonth()
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const prevMonth = () => {
    if (calMonth === 0) {
      if (fyInfo.allowedYears.includes(calYear - 1)) {
        setCalMonth(11);
        setCalYear((y: number) => y - 1);
      }
    } else {
      setCalMonth((m: number) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      if (fyInfo.allowedYears.includes(calYear + 1)) {
        setCalMonth(0);
        setCalYear((y: number) => y + 1);
      }
    } else {
      setCalMonth((m: number) => m + 1);
    }
  };

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const thisMonthFestivals = BASE_INDIAN_FESTIVALS.filter((f) => f.date.startsWith(monthPrefix));

  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      {/* Calendar Month & Year Switcher */}
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
            {fyInfo.allowedYears.map((y: number) => (
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
              {fest && (
                <span
                  style={{
                    fontSize: '9px',
                    lineHeight: 1,
                    color: !isAllowed ? '#94a3b8' : '#d97706',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '38px',
                    fontWeight: 700,
                  }}
                >
                  {fest.name.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Festival Suggestions Footer */}
      {thisMonthFestivals.length > 0 ? (
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '10px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <small style={{ fontWeight: 800, color: '#475569', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
            🎉 Recognized Festivals in {monthNames[calMonth]}:
          </small>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {thisMonthFestivals.map((f: any) => {
              const isAllowed = f.date >= fyInfo.minAllowedDate && f.date <= fyInfo.maxAllowedDate;
              return (
                <button
                  key={f.name}
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
  );
}
