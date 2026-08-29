import { ApiClient } from '../../api/ApiClient';
import type { IDocumentGateway, UploadedDocument } from '../../../core/contracts/IDocumentGateway';

export class CloudflareDocumentGateway implements IDocumentGateway {
  async uploadDocument(file: File, folder?: string): Promise<UploadedDocument> { return await this.upload(file, folder); }
  async upload(file: File, folder: string = 'documents'): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = ApiClient.getAccessToken();
    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Protection': '1',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${ApiClient.baseUrl}/api/upload`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Document upload failed');
    }

    const data = (await res.json()) as { filename?: string; fileId?: string; key?: string; url?: string };
    return {
      documentId: data.filename || data.fileId || data.key || file.name,
      url: data.url || `${ApiClient.baseUrl}/api/files/${data.filename || file.name}`,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    };
  }

  async delete(documentId: string): Promise<void> {
    await ApiClient.fetch(`/api/files/${documentId}`, { method: 'DELETE' });
  }

  getFileUrl(documentId: string): string {
    return `${ApiClient.baseUrl}/api/files/${documentId}`;
  }
}
