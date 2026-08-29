import React, { useState } from 'react';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { getErrorMessage } from '../../utils/dataIntegrity';

export interface UploadedDocItem {
  id?: string;
  name: string;
  fileName?: string;
  size?: number | string;
  type?: string;
  mimeType?: string;
  url: string;
  objectKey?: string;
  uploadedAt?: string;
  storage?: string;
}

export function EmployeeDocUploader({
  docs = [],
  onDocsChange,
  disabled = false,
}: {
  docs?: (UploadedDocItem | string)[];
  onDocsChange: (docs: any[]) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const docGateway = GatewayContainer.getDocumentGateway();
      const uploaded = await docGateway.uploadDocument(file, 'identity_docs');
      const newDoc: UploadedDocItem = {
        name: file.name,
        fileName: file.name,
        url: uploaded.url,
        objectKey: uploaded.objectKey || uploaded.documentId || file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        storage: 'r2',
      };
      onDocsChange([...docs, newDoc]);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = (idx: number) => {
    const updated = docs.filter((_, i) => i !== idx);
    onDocsChange(updated);
  };

  return (
    <div className="doc-uploader-section">
      <div className="doc-uploader-header">
        <label>Identity Documents & Attachments</label>
        {!disabled && (
          <label className="doc-upload-btn">
            {uploading ? 'Uploading...' : '➕ Add Document'}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading || disabled}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {docs.length === 0 ? (
        <p className="no-docs-text">No documents attached yet.</p>
      ) : (
        <div className="doc-items-list">
          {docs.map((doc, idx) => {
            const name = typeof doc === 'string' ? doc : doc.name || doc.fileName || 'Attachment';
            const url = typeof doc === 'string' ? doc : doc.url;
            return (
              <div key={idx} className="doc-item-badge">
                <a href={url} target="_blank" rel="noopener noreferrer" className="doc-link">
                  📄 {name}
                </a>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="doc-remove-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
