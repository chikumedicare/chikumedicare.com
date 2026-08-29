export interface FestivalInfo {
  date: string; // YYYY-MM-DD
  name: string;
  category: 'GOVT' | 'HINDU' | 'MUSLIM' | 'CHRISTIAN' | 'SIKH' | 'JAIN' | 'BUDDHIST' | 'OTHER';
  type: 'NATIONAL' | 'STATE' | 'RESTRICTED';
  icon: string;
}

export function getFinancialYearInfo(now: Date = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const currentStartYear = month >= 4 ? year : year - 1;
  const prevStartYear = currentStartYear - 1;
  const nextStartYear = currentStartYear + 1;

  const formatFY = (startY: number) => `${startY}-${String(startY + 1).substring(2)}`;

  return {
    previousFY: formatFY(prevStartYear),
    currentFY: formatFY(currentStartYear),
    nextFY: formatFY(nextStartYear),
    currentStartYear,
    currentEndYear: currentStartYear + 1,
    nextStartYear,
    nextEndYear: nextStartYear + 1,
    minAllowedDate: `${currentStartYear}-04-01`,
    maxAllowedDate: `${nextStartYear + 1}-03-31`,
    allowedYears: Array.from(new Set([currentStartYear, currentStartYear + 1, nextStartYear + 1])),
  };
}

export const BASE_INDIAN_FESTIVALS: FestivalInfo[] = [
  { date: '2026-01-01', name: "New Year's Day", category: 'GOVT', type: 'RESTRICTED', icon: '🎉' },
  { date: '2026-01-14', name: 'Makar Sankranti / Pongal', category: 'HINDU', type: 'RESTRICTED', icon: '🪁' },
  { date: '2026-01-23', name: 'Netaji Subhas Chandra Bose Jayanti', category: 'GOVT', type: 'RESTRICTED', icon: '🇮🇳' },
  { date: '2026-01-26', name: 'Republic Day', category: 'GOVT', type: 'NATIONAL', icon: '🇮🇳' },
  { date: '2026-02-15', name: 'Maha Shivratri', category: 'HINDU', type: 'STATE', icon: '🔱' },
  { date: '2026-03-03', name: 'Holi (Dhulandi)', category: 'HINDU', type: 'STATE', icon: '🎨' },
  { date: '2026-03-04', name: 'Holi Holiday', category: 'HINDU', type: 'STATE', icon: '🌸' },
  { date: '2026-03-20', name: 'Eid-ul-Fitr (Ramzan Eid)', category: 'MUSLIM', type: 'NATIONAL', icon: '🌙' },
  { date: '2026-03-26', name: 'Ram Navami', category: 'HINDU', type: 'STATE', icon: '🏹' },
  { date: '2026-03-31', name: 'Mahavir Jayanti', category: 'JAIN', type: 'NATIONAL', icon: '🕊️' },
  { date: '2026-04-03', name: 'Good Friday', category: 'CHRISTIAN', type: 'NATIONAL', icon: '✝️' },
  { date: '2026-04-05', name: 'Easter Sunday', category: 'CHRISTIAN', type: 'RESTRICTED', icon: '🐣' },
  { date: '2026-04-14', name: 'Dr. B.R. Ambedkar Jayanti / Baisakhi', category: 'GOVT', type: 'NATIONAL', icon: '⚖️' },
  { date: '2026-05-01', name: 'May Day / Labour Day', category: 'GOVT', type: 'RESTRICTED', icon: '⚒️' },
  { date: '2026-05-02', name: 'Buddha Purnima', category: 'BUDDHIST', type: 'NATIONAL', icon: '☸️' },
  { date: '2026-05-27', name: 'Eid-al-Adha (Bakrid)', category: 'MUSLIM', type: 'NATIONAL', icon: '🕌' },
  { date: '2026-06-25', name: 'Muharram (Ashura)', category: 'MUSLIM', type: 'STATE', icon: '🌙' },
  { date: '2026-08-15', name: 'Independence Day', category: 'GOVT', type: 'NATIONAL', icon: '🇮🇳' },
  { date: '2026-08-26', name: 'Milad-un-Nabi (Eid-e-Milad)', category: 'MUSLIM', type: 'STATE', icon: '🕌' },
  { date: '2026-08-28', name: 'Raksha Bandhan', category: 'HINDU', type: 'RESTRICTED', icon: '🧵' },
  { date: '2026-09-04', name: 'Janmashtami', category: 'HINDU', type: 'STATE', icon: '🪈' },
  { date: '2026-09-14', name: 'Ganesh Chaturthi', category: 'HINDU', type: 'STATE', icon: '🐘' },
  { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', category: 'GOVT', type: 'NATIONAL', icon: '🇮🇳' },
  { date: '2026-10-20', name: 'Maha Navami / Durga Puja', category: 'HINDU', type: 'STATE', icon: '🌺' },
  { date: '2026-10-21', name: 'Dussehra (Vijayadashami)', category: 'HINDU', type: 'NATIONAL', icon: '🏹' },
  { date: '2026-11-08', name: 'Diwali (Deepawali)', category: 'HINDU', type: 'NATIONAL', icon: '🪔' },
  { date: '2026-11-09', name: 'Govardhan Puja / New Year', category: 'HINDU', type: 'STATE', icon: '🪔' },
  { date: '2026-11-10', name: 'Bhai Dooj', category: 'HINDU', type: 'RESTRICTED', icon: '✨' },
  { date: '2026-11-15', name: 'Chhath Puja', category: 'HINDU', type: 'STATE', icon: '☀️' },
  { date: '2026-11-24', name: 'Guru Nanak Jayanti (Gurpurab)', category: 'SIKH', type: 'NATIONAL', icon: '☬' },
  { date: '2026-12-25', name: 'Christmas Day', category: 'CHRISTIAN', type: 'NATIONAL', icon: '🎄' },
  { date: '2027-01-26', name: 'Republic Day', category: 'GOVT', type: 'NATIONAL', icon: '🇮🇳' },
  { date: '2027-03-22', name: 'Holi', category: 'HINDU', type: 'STATE', icon: '🎨' },
  { date: '2027-08-15', name: 'Independence Day', category: 'GOVT', type: 'NATIONAL', icon: '🇮🇳' },
  { date: '2027-10-29', name: 'Diwali', category: 'HINDU', type: 'NATIONAL', icon: '🪔' },
  { date: '2027-12-25', name: 'Christmas Day', category: 'CHRISTIAN', type: 'NATIONAL', icon: '🎄' },
];

export function getFestivalForDate(dateStr: string): FestivalInfo | undefined {
  return BASE_INDIAN_FESTIVALS.find((f) => f.date === dateStr);
}
