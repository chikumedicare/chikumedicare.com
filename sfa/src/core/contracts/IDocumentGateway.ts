export interface UploadedDocument {
  documentId: string;
  objectKey?: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface IDocumentGateway {
  upload(file: File, folder?: string): Promise<UploadedDocument>;
  uploadDocument(file: File, folder?: string): Promise<UploadedDocument>;
  delete(documentId: string): Promise<void>;
  getFileUrl(documentId: string): string;
}
