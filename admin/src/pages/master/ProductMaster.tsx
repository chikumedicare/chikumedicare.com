import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { Product } from '../../domain/master/fieldMaster.types';
import { FieldMasterGateway } from '../../gateway/master/fieldMasterGateway';
import { ProductFormModal } from './ProductFormModal';

export function ProductMaster() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const refreshList = async () => {
    setLoading(true);
    try {
      const data = await FieldMasterGateway.getProducts();
      setProducts(data || []);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = async (draft: Partial<Product>) => {
    try {
      await FieldMasterGateway.saveProduct(draft);
      await refreshList();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to save Product record' };
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Product: ${name}?`)) {
      try {
        await FieldMasterGateway.deleteProduct(id);
        await refreshList();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete Product record');
      }
    }
  };

  const filtered = products.filter((p) => {
    if (catFilter !== 'ALL' && p.category !== catFilter) return false;
    if (q.trim()) {
      const haystack = `${p.productName} ${p.productCode} ${p.category} ${p.composition}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <>
      <Head
        title="Product Master (Pharmaceutical Range)"
        sub="Manage product portfolio, price list (MRP, PTS, PTR), pack sizes, and active compositions."
        action={
          <button
            className="primary"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px', fontWeight: 600, background: '#059669', borderColor: '#059669' }}
          >
            + ADD New Product
          </button>
        }
      />

      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{products.length} Products</b>
          <small>Total Master Portfolio</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#059669' }}>{products.filter(p => p.isActive).length} Active Products</b>
          <small>Live Commercial Range</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>{new Set(products.map(p => p.category)).size} Categories</b>
          <small>Formulation Dosage Forms</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#7c3aed' }}>100% Price List Sync</b>
          <small>Real-time D1 Sync</small>
        </div>
      </div>

      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Search by Product Name, Code, Category, or Composition..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 260px' }}
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Dosage Categories</option>
          <option value="TABLET">TABLET</option>
          <option value="SYRUP">SYRUP</option>
          <option value="INJECTION">INJECTION</option>
          <option value="CREAM">CREAM / OINTMENT</option>
          <option value="GEL">GEL</option>
          <option value="SACHET">SACHET</option>
          <option value="CAPSULE">CAPSULE</option>
        </select>
      </div>

      <div className="panel table">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Product Master Records from D1...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name & Code</th>
                <th>Category</th>
                <th>Pack Size</th>
                <th>MRP (₹)</th>
                <th>PTS (₹)</th>
                <th>PTR (₹)</th>
                <th>GST %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{item.productName}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>{item.composition || item.productCode || 'N/A'}</small>
                  </td>
                  <td>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#ecfdf5', color: '#059669' }}>
                      {item.category || 'TABLET'}
                    </span>
                  </td>
                  <td><b>{item.packSize || 'Strip'}</b></td>
                  <td><b style={{ color: '#0f172a' }}>₹{item.mrp}</b></td>
                  <td><b style={{ color: '#0284c7' }}>₹{item.pts}</b></td>
                  <td><b style={{ color: '#16a34a' }}>₹{item.ptr}</b></td>
                  <td><b>{item.gstPercent || 12}%</b></td>
                  <td><Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="link" onClick={() => setEditingProduct(item)}>Edit</button>
                      <button type="button" className="link" onClick={() => handleDelete(item.id, item.productName)} style={{ color: '#ef4444' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No Product records found. Click "+ ADD New Product" to create one.
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
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingProduct(null); }}
        />
      )}
    </>
  );
}
