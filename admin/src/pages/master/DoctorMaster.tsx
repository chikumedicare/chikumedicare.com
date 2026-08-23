import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { Doctor } from '../../domain/master/fieldMaster.types';
import { FieldMasterGateway } from '../../gateway/master/fieldMasterGateway';
import { DoctorFormModal } from './DoctorFormModal';

export function DoctorMaster({
  hqs = [],
  areas = [],
}: {
  hqs?: any[];
  areas?: any[];
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [hqFilter, setHqFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await FieldMasterGateway.getDoctors();
      setDoctors(data || []);
    } catch (err) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = async (draft: Partial<Doctor>) => {
    try {
      await FieldMasterGateway.saveDoctor(draft);
      await refreshList();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to save Doctor record' };
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Doctor record: ${name}?`)) {
      try {
        await FieldMasterGateway.deleteDoctor(id);
        await refreshList();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete Doctor record');
      }
    }
  };

  const filtered = doctors.filter((d) => {
    if (hqFilter !== 'ALL' && d.hqId !== hqFilter) return false;
    if (classFilter !== 'ALL' && d.doctorClass !== classFilter) return false;
    if (q.trim()) {
      const haystack = `${d.doctorName} ${d.qualification} ${d.speciality} ${d.hqName} ${d.city}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  const totalDoctors = doctors.length;
  const classACount = doctors.filter((d) => d.doctorClass === 'A' || d.doctorClass === 'VIP').length;
  const activeCount = doctors.filter((d) => d.isActive).length;

  return (
    <>
      <Head
        title="Doctor Master (Field Practitioners)"
        sub="Manage Doctor Master database, specialities, classifications, and HQ mappings."
        action={
          <button
            className="primary"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px', fontWeight: 600 }}
          >
            + ADD New Doctor
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{totalDoctors} Doctors</b>
          <small>Total Master Database</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>{classACount} Class-A / VIP</b>
          <small>High Priority Prescribers</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#16a34a' }}>{activeCount} Active</b>
          <small>Field Verified Practitioners</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#7c3aed' }}>{hqs.length} HQs Covered</b>
          <small>Territory Coverage</small>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Search by Doctor Name, Speciality, HQ, or City..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 260px' }}
        />
        <select value={hqFilter} onChange={(e) => setHqFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Base HQs</option>
          {hqs.map((h) => (
            <option key={h.id} value={h.id}>{h.name || h.hq_name} (HQ)</option>
          ))}
        </select>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Classifications</option>
          <option value="A">Class A Only</option>
          <option value="B">Class B Only</option>
          <option value="C">Class C Only</option>
          <option value="VIP">VIP Doctors</option>
        </select>
      </div>

      {/* Doctor Table */}
      <div className="panel table">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Doctor Master Records from D1...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Doctor Name & Qualification</th>
                <th>Speciality</th>
                <th>Class</th>
                <th>Base HQ & Area</th>
                <th>Clinic Address & City</th>
                <th>Mobile Contact</th>
                <th>Visits/Mo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{item.doctorName}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.qualification || 'MBBS'}</small>
                  </td>
                  <td>
                    <b style={{ color: '#0284c7' }}>{item.speciality || 'General'}</b>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        background: item.doctorClass === 'VIP' ? '#fef3c7' : item.doctorClass === 'A' ? '#e0f2fe' : '#f1f5f9',
                        color: item.doctorClass === 'VIP' ? '#d97706' : item.doctorClass === 'A' ? '#0284c7' : '#475569'
                      }}
                    >
                      Class {item.doctorClass || 'A'}
                    </span>
                  </td>
                  <td>
                    <b>{item.hqName || item.hqId}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.areaName || item.areaId}</small>
                  </td>
                  <td>
                    <small style={{ color: '#334155', fontWeight: 600 }}>{item.clinicAddress || 'Clinic'}</small>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.city || 'Bhopal'}</small>
                  </td>
                  <td><b>{item.mobile || 'N/A'}</b></td>
                  <td><b style={{ color: '#7c3aed' }}>{item.visitFrequency || 2} / Mo</b></td>
                  <td><Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="link"
                        onClick={() => setEditingDoctor(item)}
                        style={{ fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link"
                        onClick={() => handleDelete(item.id, item.doctorName)}
                        style={{ color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No Doctor records found. Click "+ ADD New Doctor" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editingDoctor) && (
        <DoctorFormModal
          doctor={editingDoctor}
          hqs={hqs}
          areas={areas}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingDoctor(null); }}
        />
      )}
    </>
  );
}
