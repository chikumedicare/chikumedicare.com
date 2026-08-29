import { getErrorMessage } from '../../../../utils/dataIntegrity';
import React, { useState, useEffect } from 'react';
import type { Product } from '../../../../core/domain/master/fieldMaster.types';
import { GatewayContainer } from '../../../../core/container/GatewayContainer';
import { useHeadOfficeStore } from '../../../../store/hr/useHeadOfficeStore';
import { ProductFormModal } from './ProductFormModal';

export function ProductMaster({
  mode = "LIST",
}: {
  mode?: "LIST" | "ADD" | "EDIT" | "DELETE";
}) {
  const { divisions, fetchHeadOfficeData } = useHeadOfficeStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await GatewayContainer.getFieldMasterGateway().getProducts();
      setProducts(data || []);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
    fetchHeadOfficeData();
    if (mode === 'ADD') {
      setShowAddModal(true);
      setEditingProduct(null);
    }
  }, [mode]);

  const handleDelete = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete Product: ${name || id}?`)) return;
    try {
      await GatewayContainer.getFieldMasterGateway().deleteProduct(id);
      await refreshList();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleSave = async (draft: Partial<Product>) => {
    try {
      await GatewayContainer.getFieldMasterGateway().saveProduct(draft);
      await refreshList();
      return { success: true };
    } catch (err: unknown) {
      alert(getErrorMessage(err));
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const filtered = products.filter((p) => {
    if (divisionFilter !== 'ALL' && p.divisionId !== divisionFilter) return false;
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (q.trim()) {
      const haystack = `${p.productName} ${p.productCode} ${p.category} ${p.divisionName || ''} ${p.composition} ${p.packSize}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      {/* Compact Action & Filter Toolbar */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
        <input
          placeholder="Search Product by Brand Name, Code, Division, Composition, or Pack Size..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 260px', minWidth: '200px' }}
        />
        <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Divisions</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>🏢 {(d as any).name || (d as any).division_name}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Dosage Categories</option>
          <option value="TABLET">Tablets</option>
          <option value="CAPSULE">Capsules</option>
          <option value="SYRUP">Syrups</option>
          <option value="INJECTION">Injections</option>
          <option value="CREAM">Creams / Ointments</option>
          <option value="GEL">Gels</option>
          <option value="LOTION">Lotions</option>
          <option value="SERUM">Serums</option>
          <option value="FACEWASH">Face Washes</option>
          <option value="SOAP">Soaps</option>
          <option value="SUNSCREEN">Sunscreens</option>
          <option value="SHAMPOO">Shampoos</option>
          <option value="DROPS">Drops</option>
          <option value="SACHET">Sachets</option>
        </select>

        {mode !== 'EDIT' && mode !== 'DELETE' && (
          <button
            type="button"
            className="primary"
            onClick={() => { setShowAddModal(true); setEditingProduct(null); }}
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
            <span>➕</span> Add New Product
          </button>
        )}
      </div>

      {/* Product Table View */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Product Catalog...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Brand Name</th>
                <th>Division</th>
                <th>Category</th>
                <th>Pack Size</th>
                <th>Active Composition</th>
                <th>MRP (₹)</th>
                <th>PTR (₹)</th>
                <th>PTS (₹)</th>
                <th>NRV (₹)</th>
                <th>GST (%)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '14.5px' }}>{item.productName}</b>
                    {item.productCode && <small style={{ color: '#64748b', display: 'block' }}>Code: {item.productCode}</small>}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      🏢 {item.divisionName || 'Main Division'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {item.category || 'TABLET'}
                    </span>
                  </td>
                  <td>{item.packSize || '-'}</td>
                  <td>
                    <div style={{ maxWidth: '220px', fontSize: '12px', color: '#334155' }}>
                      {item.composition || '-'}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>₹{Number(item.mrp || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>₹{Number(item.ptr || 0).toFixed(2)}</span>
                  </td>
                  <td>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>₹{Number(item.pts || 0).toFixed(2)}</span>
                  </td>
                  <td>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>₹{Number(item.nrv || 0).toFixed(2)}</span>
                  </td>
                  <td>{item.gstPercent || 12}%</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => { setEditingProduct(item); setShowAddModal(true); }}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.productName)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#991b1b',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No Product catalog records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(showAddModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          divisions={divisions}
          onSave={(draft) => handleSave(draft)}
          onClose={() => { setShowAddModal(false); setEditingProduct(null); }}
        />
      )}
    </>
  );
}
export default ProductMaster;
