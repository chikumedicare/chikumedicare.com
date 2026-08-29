import React, { useState } from 'react';
import type { SponsorshipRecord } from '../../../../core/domain/transaction/sponsorship.types';
import { SponsorshipList } from './SponsorshipList';
import { SponsorshipForm } from './SponsorshipForm';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';

const MOCK_DOCTORS = [
  { id: 'DOC-01', name: 'Dr. Rajesh Sharma', degree: 'MBBS, MD (Medicine)', specialty: 'Consultant Physician', hqId: 'HQ-01', hqName: 'Bhopal Central', regNo: 'MPMC-10492' },
  { id: 'DOC-02', name: 'Dr. Sunita Verma', degree: 'MBBS, DNB (Dermatology)', specialty: 'Dermatologist', hqId: 'HQ-01', hqName: 'Bhopal Central', regNo: 'MPMC-14881' },
  { id: 'DOC-03', name: 'Dr. Alok Gupta', degree: 'MBBS, MS (Ortho)', specialty: 'Orthopedic Surgeon', hqId: 'HQ-02', hqName: 'Indore City', regNo: 'MPMC-20184' },
];

const MOCK_CHEMISTS = [
  { id: 'CHM-01', name: 'Sharma Medical Hall', firmName: 'Sharma Medical Hall', hqId: 'HQ-01' },
  { id: 'CHM-02', name: 'LifeCare Chemist & Druggist', firmName: 'LifeCare Chemist', hqId: 'HQ-01' },
];

const MOCK_HQS = [
  { id: 'HQ-01', name: 'Bhopal Central' },
  { id: 'HQ-02', name: 'Indore City' },
  { id: 'HQ-03', name: 'Jabalpur East' },
];

const INITIAL_RECORDS: SponsorshipRecord[] = [
  {
    id: 'SPON-2026-001',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    doctorId: 'DOC-01',
    doctorName: 'Dr. Rajesh Sharma',
    doctorDegree: 'MBBS, MD (Medicine)',
    doctorSpecialty: 'Consultant Physician',
    doctorRegNo: 'MPMC-10492',
    chemistIds: ['CHM-01'],
    chemistNames: ['Sharma Medical Hall'],
    sponsorshipDate: '2026-08-20',
    monthYear: '2026-08',
    financialYear: '2026-27',
    sponsorshipType: 'Registration Support',
    amount: 25000,
    programName: '78th National Cardiology CME 2026',
    institutionOrOrganizer: 'Cardiological Society of India',
    locationCity: 'Indore',
    referenceIdType: 'Medical Council Reg No',
    referenceIdNumber: 'MPMC-10492',
    remark: 'Conference delegate registration fee sponsored for key opinion leader.',
    status: 'APPROVED',
    approvedBy: 'National Sales Manager (NSM)',
    submittedAt: '2026-08-20 02:30 PM',
  },
  {
    id: 'SPON-2026-002',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    doctorId: 'DOC-02',
    doctorName: 'Dr. Sunita Verma',
    doctorDegree: 'MBBS, DNB (Dermatology)',
    doctorSpecialty: 'Dermatologist',
    doctorRegNo: 'MPMC-14881',
    sponsorshipDate: '2026-08-25',
    monthYear: '2026-08',
    financialYear: '2026-27',
    sponsorshipType: 'Financial Support',
    amount: 18000,
    referenceIdType: 'PAN Number',
    referenceIdNumber: 'ABCDE1234F',
    remark: 'Patient acne diagnostic camp banner and literature assistance.',
    status: 'PENDING_APPROVAL',
    submittedAt: '2026-08-25 11:15 AM',
  },
];

export function SponsorshipEntry() {
  const fyInfo = getFinancialYearInfo();
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [records, setRecords] = useState<SponsorshipRecord[]>(INITIAL_RECORDS);
  const [editingRecord, setEditingRecord] = useState<SponsorshipRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleSave = (recordData: Partial<SponsorshipRecord>, isDraft: boolean) => {
    const newRecord: SponsorshipRecord = {
      ...(editingRecord || {}),
      ...(recordData as SponsorshipRecord),
      id: editingRecord?.id || ('SPON-' + Date.now()),
      status: isDraft ? 'DRAFT' : 'PENDING_APPROVAL',
      submittedAt: new Date().toLocaleString(),
    };

    if (editingRecord) {
      setRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? newRecord : r)));
      setAlertMsg('✓ Sponsorship for ' + newRecord.doctorName + ' updated successfully!');
    } else {
      setRecords((prev) => [newRecord, ...prev]);
      setAlertMsg(isDraft ? '💾 Draft saved in Sponsorship directory!' : '🚀 Sponsorship request submitted for Approval!');
    }

    setEditingRecord(null);
    setViewMode('LIST');
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const filteredRecords = records.filter((rec) => {
    if (fyFilter !== 'ALL' && rec.financialYear !== fyFilter) return false;
    if (typeFilter !== 'ALL' && rec.sponsorshipType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const str = rec.doctorName + ' ' + rec.sponsorshipType + ' ' + (rec.hqName || '') + ' ' + rec.financialYear;
      return str.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {alertMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 18px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700 }}>
          <span>✨</span> {alertMsg}
        </div>
      )}

      {viewMode === 'LIST' ? (
        <SponsorshipList
          records={filteredRecords}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fyFilter={fyFilter}
          setFyFilter={setFyFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAddNew={() => { setEditingRecord(null); setViewMode('FORM'); }}
          onEdit={(rec) => { setEditingRecord(rec); setViewMode('FORM'); }}
          onDelete={(id) => {
            if (!window.confirm('Delete this sponsorship record?')) return;
            setRecords((prev) => prev.filter((r) => r.id !== id));
          }}
        />
      ) : (
        <SponsorshipForm
          initialRecord={editingRecord}
          doctors={MOCK_DOCTORS}
          chemists={MOCK_CHEMISTS}
          hqs={MOCK_HQS}
          currentFY={fyInfo.currentFY}
          onCancel={() => { setEditingRecord(null); setViewMode('LIST'); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
export default SponsorshipEntry;
