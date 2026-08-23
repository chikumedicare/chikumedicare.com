import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import { ApiClient } from '../../api/ApiClient';
import { DocumentPreviewModal } from './DocumentPreviewModal';

export function EmployeeDocUploader({
  docs = [],
  onChange,
}: {
  docs: any[];
  onChange: (newDocs: any[]) => void;
}) {
  const [docType, setDocType] = useState('Aadhaar Card Copy');
  const [customDocName, setCustomDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string; type: string } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadStatus(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB). Click "Upload Document" to process.`);
    } else {
      setSelectedFile(null);
      setUploadStatus('');
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) {
      alert('Please select a document file from your computer first.');
      return;
    }

    setUploadingDoc(true);
    setUploadStatus('Uploading document to Cloudflare R2 Storage Bucket...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string;
        const docTitle = docType === 'OTHER' ? (customDocName.trim() || 'KYC Document') : docType;

        const uploadResult = await ApiClient.fetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileData: dataUrl,
            mimeType: selectedFile.type || 'application/octet-stream',
          }),
        });

        const newDoc = {
          id: uploadResult.objectKey || ('doc_' + Date.now()),
          name: docTitle,
          fileName: selectedFile.name,
          size: Math.round(selectedFile.size / 1024) + ' KB',
          type: selectedFile.type.includes('pdf') ? 'PDF' : 'IMAGE',
          url: uploadResult.url,
          uploadedAt: new Date().toISOString().split('T')[0],
          storage: 'CLOUDFLARE_R2',
        };

        onChange([...docs, newDoc]);
        setUploadStatus('✓ Document successfully uploaded to Cloudflare R2!');
        setSelectedFile(null);
        setCustomDocName('');
        setTimeout(() => setUploadStatus(''), 4000);
      } catch (err: any) {
        alert(err?.error || err?.message || 'Failed to upload document to Cloudflare R2');
        setUploadStatus('⚠️ Upload failed. Please try again.');
      } finally {
        setUploadingDoc(false);
      }
    };

    reader.onerror = () => {
      setUploadingDoc(false);
      setUploadStatus('⚠️ Failed to read local file.');
      alert('Failed to read file. Please try again.');
    };

    reader.readAsDataURL(selectedFile);
  };

  const removeDocWithR2Sync = async (index: number) => {
    const docToDelete = docs[index];
    const docName = typeof docToDelete === 'string' ? docToDelete : (docToDelete.name || docToDelete.fileName || 'Document');
    
    // Explicit Delete Confirmation Dialog
    const confirmed = window.confirm(`🗑️ Delete Confirmation:\n\nAre you sure you want to permanently delete document "${docName}" from Cloudflare R2 Cloud Storage?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    // Purge file from Cloudflare R2 if it has an R2 URL or objectKey
    if (typeof docToDelete === 'object' && docToDelete.url && docToDelete.url.includes('/api/files/')) {
      try {
        const filename = docToDelete.url.split('/api/files/').pop();
        if (filename) {
          await ApiClient.fetch(`/api/files/${filename}`, { method: 'DELETE' });
        }
      } catch (e) {
        console.error('[EmployeeDocUploader] R2 purge error:', e);
      }
    }

    const nextDocs = [...docs];
    nextDocs.splice(index, 1);
    onChange(nextDocs);
    setUploadStatus(`✓ Document "${docName}" deleted from R2 Storage.`);
    setTimeout(() => setUploadStatus(''), 4000);
  };

  return (
    <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <b style={{ color: '#0f172a', fontSize: '14px' }}>
          📁 Upload Identity & Verification Documents
        </b>
        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
          ☁️ Cloudflare R2 Live Sync
        </span>
      </div>
      <small style={{ color: '#64748b', display: 'block', marginBottom: '14px' }}>
        Select document copy from your computer (.pdf, .jpg, .png) and click <b>Upload Document</b>. Deleting here will live sync & purge from R2 Storage.
      </small>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
        <SelectField
          label="Document Label / Type"
          value={docType}
          onChange={setDocType}
          options={[
            { v: 'Aadhaar Card Copy', l: 'Aadhaar Card Copy' },
            { v: 'PAN Card Copy', l: 'PAN Card Copy' },
            { v: 'Passport Copy', l: 'Passport Copy' },
            { v: 'Driving Licence Copy', l: 'Driving Licence Copy' },
            { v: 'Educational Marksheet / Degree', l: 'Educational Marksheet / Degree' },
            { v: 'Bank Passbook / Cancelled Cheque', l: 'Bank Passbook / Cancelled Cheque' },
            { v: 'OTHER', l: '+ Custom Document Name...' },
          ]}
        />
        {docType === 'OTHER' ? (
          <TextField
            label="Enter Custom Document Name"
            value={customDocName}
            onChange={setCustomDocName}
            placeholder="e.g. Electricity Bill, Address Proof"
          />
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Select File from Computer
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              disabled={uploadingDoc}
              style={{ padding: '6px', fontSize: '13px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}
            />
          </div>
        )}
      </div>

      {docType === 'OTHER' && (
        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
            Select File for {customDocName || 'Custom Document'}
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            disabled={uploadingDoc}
            style={{ padding: '6px', fontSize: '13px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}
          />
        </div>
      )}

      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={handleStartUpload}
          disabled={!selectedFile || uploadingDoc}
          style={{
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            background: (!selectedFile || uploadingDoc) ? '#94a3b8' : '#0284c7',
            border: 'none',
            borderRadius: '6px',
            cursor: (!selectedFile || uploadingDoc) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {uploadingDoc ? '⏳ Uploading to Cloud...' : '⬆️ Upload Document to R2'}
        </button>
        {selectedFile && !uploadingDoc && (
          <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600 }}>
            Ready to upload: {selectedFile.name}
          </span>
        )}
      </div>

      {uploadStatus && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: uploadingDoc ? '#0284c7' : uploadStatus.includes('✓') ? '#16a34a' : '#475569', fontWeight: 600 }}>
          {uploadStatus}
        </div>
      )}

      {/* Attached Documents List */}
      <div style={{ marginTop: '18px' }}>
        <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
          Attached Documents ({docs.length}):
        </b>
        {docs.length === 0 ? (
          <small style={{ color: '#94a3b8', fontStyle: 'italic' }}>No documents attached yet.</small>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {docs.map((doc: any, idx: number) => {
              const docName = typeof doc === 'string' ? doc : (doc.name || doc.fileName || ('Doc #' + (idx + 1)));
              const docUrl = typeof doc === 'string' ? doc : doc.url;
              const docTypeTag = typeof doc === 'object' && doc.type ? doc.type : (docUrl?.toLowerCase().includes('.pdf') ? 'PDF' : 'IMAGE');
              const docSize = typeof doc === 'object' && doc.size ? doc.size : '';
              const isR2 = typeof doc === 'object' && doc.storage === 'CLOUDFLARE_R2';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: docTypeTag === 'PDF' ? '#fef2f2' : '#f0fdf4', color: docTypeTag === 'PDF' ? '#dc2626' : '#16a34a' }}>
                    {docTypeTag}
                  </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{docName}</span>
                  {docSize && <small style={{ color: '#64748b' }}>({docSize})</small>}
                  {isR2 && <span style={{ fontSize: '9px', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>R2</span>}
                  
                  {docUrl && (
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc({ name: docName, url: docUrl, type: docTypeTag })}
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #bae6fd',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        👁️ Preview
                      </button>
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        🔗 Open Tab
                      </a>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDocWithR2Sync(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, marginLeft: '6px', fontSize: '14px' }}
                    title="Permanently delete document from R2"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
