import React, { useState, useRef, useEffect } from 'react';
import type { FestivalInfo } from './festivalData';
import { BASE_INDIAN_FESTIVALS, getFestivalForDate, getFinancialYearInfo } from './festivalData';
export type { FestivalInfo };
export { BASE_INDIAN_FESTIVALS, getFestivalForDate, getFinancialYearInfo };

interface FestivalDatePickerProps {
  value: string;
  onChange: (date: string, festivalName?: string, holidayType?: 'NATIONAL' | 'STATE' | 'RESTRICTED') => void;
}

export function FestivalDatePicker({ value, onChange }: FestivalDatePickerProps) {
  const fyInfo = getFinancialYearInfo();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const validInitialDate = isNaN(initialDate.getTime()) ? new Date(fyInfo.minAllowedDate) : initialDate;

  const [currentYear, setCurrentYear] = useState(validInitialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(validInitialDate.getMonth());

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    if (currentMonth === 0) {
      if (fyInfo.allowedYears.includes(currentYear - 1)) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      }
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      if (fyInfo.allowedYears.includes(currentYear + 1)) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      }
    } else setCurrentMonth((m) => m + 1);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleDateClick = (day: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${mStr}-${dStr}`;

    if (dateStr < fyInfo.minAllowedDate || dateStr > fyInfo.maxAllowedDate) {
      alert(`Only dates within Current FY (${fyInfo.currentFY}) and Next FY (${fyInfo.nextFY}) are allowed.`);
      return;
    }

    const festival = getFestivalForDate(dateStr);
    onChange(dateStr, festival?.name, festival?.type);
    setIsOpen(false);
  };

  const selectedFestival = value ? getFestivalForDate(value) : undefined;
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const thisMonthFestivals = BASE_INDIAN_FESTIVALS.filter((f) => f.date.startsWith(monthPrefix));

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          borderRadius: '8px',
          border: isOpen ? '2px solid #10b981' : '1px solid #cbd5e1',
          background: '#ffffff',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📅</span>
          <span style={{ fontWeight: 700, fontSize: '13.5px', color: value ? '#0f172a' : '#94a3b8' }}>
            {value || 'Select Date from Calendar'}
          </span>
          {selectedFestival && (
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              {selectedFestival.icon} {selectedFestival.name}
            </span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: '#64748b' }}>▼</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 10000,
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            padding: '16px',
            width: '100%',
            minWidth: '340px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '6px 10px', borderRadius: '8px', marginBottom: '10px', fontSize: '11.5px', color: '#065f46', fontWeight: 700 }}>
            <span>📅 Scope: Current FY ({fyInfo.currentFY}) & Next FY ({fyInfo.nextFY})</span>
            <span>Apr to Mar</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <button type="button" onClick={prevMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>◀</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '13px', background: '#fff' }}>
                {monthNames.map((m, idx) => (<option key={m} value={idx}>{m}</option>))}
              </select>
              <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '13px', background: '#fff' }}>
                {fyInfo.allowedYears.map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            <button type="button" onClick={nextMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>▶</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '4px', marginBottom: '6px', fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
            <span style={{ color: '#ef4444' }}>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span style={{ color: '#0284c7' }}>SAT</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '12px' }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (<div key={`empty-${i}`} style={{ height: '42px' }} />))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === cellDate;
              const fest = getFestivalForDate(cellDate);
              const isAllowed = cellDate >= fyInfo.minAllowedDate && cellDate <= fyInfo.maxAllowedDate;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => isAllowed && handleDateClick(day)}
                  disabled={!isAllowed}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #10b981' : fest && isAllowed ? '1px solid #fde68a' : '1px solid #f1f5f9',
                    background: isSelected ? '#ecfdf5' : !isAllowed ? '#f8fafc' : fest ? '#fefce8' : '#ffffff',
                    cursor: isAllowed ? 'pointer' : 'not-allowed',
                    opacity: isAllowed ? 1 : 0.4,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: isSelected || fest ? 800 : 500, color: !isAllowed ? '#94a3b8' : isSelected ? '#065f46' : fest ? '#b45309' : '#1e293b' }}>{day}</span>
                  {fest && isAllowed && (<span style={{ fontSize: '8.5px', maxWidth: '42px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#b45309', fontWeight: 700 }}>{fest.icon} {fest.name.split(' ')[0]}</span>)}
                </button>
              );
            })}
          </div>

          {thisMonthFestivals.length > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '8px 10px', border: '1px solid #e2e8f0', maxHeight: '110px', overflowY: 'auto' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>🎉 {monthNames[currentMonth]} Festivals:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {thisMonthFestivals.map((f) => (
                  <div key={f.date} onClick={() => { onChange(f.date, f.name, f.type); setIsOpen(false); }} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: '#fff', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                    <b>{f.icon} {f.name}</b>
                    <span style={{ color: '#0284c7' }}>{f.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
