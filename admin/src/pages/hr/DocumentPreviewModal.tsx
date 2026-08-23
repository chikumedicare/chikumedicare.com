import React from 'react';

export function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: { name: string; url: string; type: string };
  onClose: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '850px', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '12px 18px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b style={{ fontSize: '14px', display: 'block' }}>👁️ Document Viewer: {doc.name}</b>
            <small style={{ color: '#94a3b8', fontSize: '11px' }}>Cloudflare R2 Object Stream</small>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}
            >
              🔗 Open Full Tab
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕ Close
            </button>
          </div>
        </div>
        <div style={{ flex: 1, padding: '16px', background: '#f8fafc', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '450px' }}>
          {doc.type === 'PDF' || doc.url.toLowerCase().includes('.pdf') ? (
            <object
              data={doc.url}
              type="application/pdf"
              style={{ width: '100%', height: '550px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ color: '#475569', fontWeight: 600 }}>Your browser requires opening PDFs directly in a new tab.</p>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: '#0284c7', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}
                >
                  📄 Click Here to Open PDF Document
                </a>
              </div>
            </object>
          ) : (
            <img
              src={doc.url}
              alt={doc.name}
              style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
