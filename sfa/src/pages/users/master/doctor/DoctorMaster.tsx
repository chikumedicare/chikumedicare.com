import React, { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../../../../utils/dataIntegrity';
import { GatewayContainer } from '../../../../core/container/GatewayContainer';
import type { Doctor } from '../../../../core/domain/master/fieldMaster.types';
import { useGeographyStore } from '../../../../store/hr/useGeographyStore';
import { useAuthSessionStore } from '../../../../store/hr/useAuthSessionStore';
import { DoctorMasterHeader } from './DoctorMasterHeader';
import { DoctorMasterToolbar } from './DoctorMasterToolbar';
import { DoctorMasterTable } from './DoctorMasterTable';
import { DoctorFormModal } from './DoctorFormModal';

export function DoctorMaster({
  mode = 'LIST',
}: {
  mode?: 'LIST' | 'ADD' | 'EDIT' | 'DELETE';
}) {
  const { currentUser } = useAuthSessionStore();
  const user = currentUser;
  const { hqs, areas, beats, refresh: refreshGeo } = useGeographyStore();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [hqFilter, setHqFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const refreshList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GatewayContainer.getFieldMasterGateway().getDoctors();
      setDoctors(data || []);
    } catch (err) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGeo(true);
    refreshList();
    if (mode === 'ADD') {
      setShowAddModal(true);
      setEditingDoctor(null);
    }
  }, [mode, refreshGeo, refreshList]);

  const handleSave = async (draft: Partial<Doctor>) => {
    try {
      const isApex = user?.role === 'ADMIN' || user?.role === 'OWNER';
      if (isApex) {
        await GatewayContainer.getFieldMasterGateway().saveDoctor(draft);
        await refreshList();
        setShowAddModal(false);
        setEditingDoctor(null);
        return { success: true };
      } else {
        await GatewayContainer.getApprovalGateway().submitRequest({
          entityType: 'DR_ADD',
          payload: draft as Record<string, unknown>,
          remarks: `Doctor Addition Request for Dr. ${draft.doctorName || ''}`,
        });
        setShowAddModal(false);
        setEditingDoctor(null);
        alert('🚀 Doctor Addition Request submitted successfully for Manager / Admin Approval!');
        return { success: true };
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err));
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete Doctor: ${name || id}?`)) return;
    try {
      const isApex = user?.role === 'ADMIN' || user?.role === 'OWNER';
      if (isApex) {
        await GatewayContainer.getFieldMasterGateway().deleteDoctor(id);
        await refreshList();
      } else {
        await GatewayContainer.getApprovalGateway().submitRequest({
          entityType: 'DR_DELETE',
          payload: { id, doctorName: name },
          remarks: `Doctor Deletion Request for Dr. ${name || id}`,
        });
        alert('🚀 Doctor Deletion Request submitted successfully for Manager / Admin Approval!');
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const getHqName = (hqId: string) => {
    const h = hqs.find((item) => item.id === hqId || (item as any).hq_id === hqId);
    return h ? (h.name || (h as any).hq_name || (h.code ? `HQ (${h.code})` : '-')) : '-';
  };

  const getAreaName = (areaId: string) => {
    const a = areas.find((item) => item.id === areaId || (item as any).area_id === areaId);
    return a ? (a.name || (a as any).area_name || (a.code ? `Area (${a.code})` : '-')) : '-';
  };

  const filtered = doctors.filter((d) => {
    if (hqFilter !== 'ALL' && d.hqId !== hqFilter) return false;
    if (classFilter !== 'ALL' && d.doctorClass !== classFilter) return false;
    if (q.trim()) {
      const haystack = `${d.doctorName} ${d.qualification} ${d.speciality} ${getHqName(d.hqId)} ${getAreaName(d.areaId)} ${d.city || ''}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  const totalDoctors = doctors.length;
  const classACount = doctors.filter((d) => d.doctorClass === 'A' || d.doctorClass === 'VIP').length;
  const activeCount = doctors.filter((d) => d.isActive).length;

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <DoctorMasterHeader
        totalDoctors={totalDoctors}
        classACount={classACount}
        activeCount={activeCount}
        onOpenAdd={() => {
          setShowAddModal(true);
          setEditingDoctor(null);
        }}
      />

      <DoctorMasterToolbar
        q={q}
        setQ={setQ}
        hqFilter={hqFilter}
        setHqFilter={setHqFilter}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        hqs={hqs}
      />

      <DoctorMasterTable
        loading={loading}
        filtered={filtered}
        getHqName={getHqName}
        getAreaName={getAreaName}
        onEdit={(doc) => setEditingDoctor(doc)}
        onDelete={handleDelete}
      />

      {(showAddModal || editingDoctor) && (
        <DoctorFormModal
          doctor={editingDoctor}
          hqs={hqs}
          areas={areas}
          beats={beats}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingDoctor(null);
          }}
        />
      )}
    </div>
  );
}
