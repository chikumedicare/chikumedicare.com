import { useGeographyStore } from '../../store/hr/useGeographyStore';
import type { Headquarter, Area } from '../../core/domain/hr/geography.types';
import { getErrorMessage } from '../../utils/dataIntegrity';
import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { Doctor } from '../../core/domain/master/fieldMaster.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { DoctorFormModal } from './DoctorFormModal';

export function DoctorMaster({
  hqs: propsHqs = [],
  areas: propsAreas = [],
  mode = "LIST",
}: {
  hqs?: Headquarter[];
  areas?: Area[];
  mode?: "LIST" | "ADD" | "EDIT" | "DELETE";
}) {
  const geoStore = useGeographyStore();
  const hqs = propsHqs.length > 0 ? propsHqs : geoStore.hqs;
  const areas = propsAreas.length > 0 ? propsAreas : geoStore.areas;
  const beats = geoStore.beats;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [hqFilter, setHqFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'LIST' | 'ADD' | 'EDIT' | 'DELETE'>('LIST');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await GatewayContainer.getFieldMasterGateway().getDoctors();
      setDoctors(data || []);
    } catch (err) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
    if (mode === 'ADD') {
      setShowAddModal(true);
      setEditingDoctor(null);
    }
  }, [mode]);

  
  
  const fetchAll = async () => {
    try {
      const items = await (GatewayContainer.getFieldMasterGateway() as any)['get' + 'Doctors']();
      setDoctors(items || []);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string, _name?: string) => {
    if (!window.confirm('Are you sure you want to delete?')) return;
    try {
      await (GatewayContainer.getFieldMasterGateway() as any)['delete' + 'Doctor'](id);
      await loadItems();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const loadItems = async () => {
    try {
      const items = await (GatewayContainer.getFieldMasterGateway() as any)['get' + 'Doctors']();
      setDoctors(items || []);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleSave = async (draft: Partial<Doctor>) => {
    try {
      await GatewayContainer.getFieldMasterGateway().saveDoctor(draft);
      await refreshList();
      return { success: true };
    } catch (err: unknown) {
      alert(getErrorMessage(err));
      return { success: false, error: getErrorMessage(err) };
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

      

      {/* Compact Action & Filter Toolbar */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <input
          placeholder="Search Doctor List by Name, Speciality, HQ, or City..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 280px', minWidth: '220px' }}
        />
        <select value={hqFilter} onChange={(e) => setHqFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Base HQs</option>
          {hqs.map((h) => (
            <option key={h.id} value={h.id}>{h.name || h.hq_name} (HQ)</option>
          ))}
        </select>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Classes</option>
          <option value="A">Class A</option>
          <option value="B">Class B</option>
          <option value="C">Class C</option>
        </select>

        {mode !== 'EDIT' && mode !== 'DELETE' && (
          <button
            type="button"
            className="primary"
            onClick={() => { setActiveTab('ADD'); setShowAddModal(true); setEditingDoctor(null); }}
            style={{
              marginLeft: 'auto',
              borderRadius: '10px',
              fontWeight: 700,
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>➕</span> Add New Doctor
          </button>
        )}
      </div>

      {/* Doctor Table (Doctor List View) */}
      <div className="panel table">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Doctor Master Records...</div>
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
                        onClick={() => { setEditingDoctor(item); setActiveTab('EDIT'); }}
                        style={{ fontWeight: 700, color: '#0284c7' }}
                      >
                        ✏️ Edit Dr
                      </button>
                      <button
                        type="button"
                        className="link"
                        onClick={() => handleDelete(item.id, item.doctorName)}
                        style={{ color: '#ef4444', fontWeight: 700 }}
                      >
                        🗑️ Delete Dr
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No Doctor records found. Click "➕ Add Doctor" to create one.
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
          beats={beats}
          onSave={(draft) => handleSave(draft)}
          onClose={() => { setShowAddModal(false); setEditingDoctor(null); setActiveTab('LIST'); }}
        />
      )}
    </>
  );
}
