import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import { useHeadOfficeStore, type HeadOfficeTab } from '../../../store/hr/useHeadOfficeStore';
import { useHrStore } from '../../../store/hr/useHrStore';
import { SuperHqProfileForm } from './SuperHqProfileForm';
import { CorporateLeadershipTab } from './CorporateLeadershipTab';
import { DivisionsTab } from './DivisionsTab';
import { DivisionModal } from './DivisionModal';
import type { Division } from '../../../domain/hr/headOffice.types';

export function HeadOfficeMaster() {
  const {
    profile,
    divisions,
    activeTab,
    loading,
    saving,
    setActiveTab,
    saveProfile,
    saveDivision,
    toggleDivisionStatus,
  } = useHeadOfficeStore();

  const { users } = useHrStore();

  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);

  const handleAddDivision = () => {
    setEditingDivision(null);
    setIsDivisionModalOpen(true);
  };

  const handleEditDivision = (d: Division) => {
    setEditingDivision(d);
    setIsDivisionModalOpen(true);
  };

  if (isDivisionModalOpen) {
    return (
      <DivisionModal
        item={editingDivision}
        onSave={saveDivision}
        onClose={() => setIsDivisionModalOpen(false)}
      />
    );
  }

  const tabs: { key: HeadOfficeTab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Corporate HQ Profile & Address', icon: '🏢' },
    { key: 'statutory', label: 'Statutory Licenses (DL, GSTIN)', icon: '📜' },
    { key: 'leadership', label: `Appointed Leadership (${users.filter(u => u.role === 'ADMIN' || u.role === 'OWNER').length})`, icon: '👑' },
    { key: 'divisions', label: `Marketing Divisions (${divisions.length})`, icon: '🏷️' },
    { key: 'policies', label: 'Corporate Policies & Support', icon: '⚙️' },
  ];

  return (
    <>
      <Head
        title="Head Office & Corporate HQ (HQ000)"
        sub="Corporate Apex • Statutory Invoicing Licenses • Leadership & Marketing Divisions"
      />

      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                color: isActive ? '#0284c7' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          ⏳ Loading Head Office & Corporate HQ from Cloudflare D1...
        </div>
      ) : activeTab === 'leadership' ? (
        <CorporateLeadershipTab users={users} />
      ) : activeTab === 'divisions' ? (
        <DivisionsTab
          divisions={divisions}
          onAdd={handleAddDivision}
          onEdit={handleEditDivision}
          onToggleStatus={toggleDivisionStatus}
        />
      ) : (
        <SuperHqProfileForm
          activeTab={activeTab}
          profile={profile}
          saving={saving}
          onSave={saveProfile}
        />
      )}
    </>
  );
}
