import { Env, AuthUser } from '../types';

export class StorageController {
  static async upload(req: Request, env: Env, authUser?: AuthUser): Promise<Response> {
    try {
      if (!env.chikusfa_storage) {
        return new Response(JSON.stringify({ error: 'R2 Storage bucket binding not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const body = (await req.json()) as any;
      const { fileName, fileData, mimeType } = body;

      if (!fileData) {
        return new Response(JSON.stringify({ error: 'fileData (Base64 string) is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      let base64String = fileData;
      let detectedMime = mimeType || 'application/octet-stream';
      if (base64String.includes(';base64,')) {
        const parts = base64String.split(';base64,');
        detectedMime = parts[0].replace('data:', '');
        base64String = parts[1];
      }

      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const cleanFileName = (fileName || 'doc').replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `docs/${Date.now()}_${Math.random().toString(36).substring(7)}_${cleanFileName}`;

      await env.chikusfa_storage.put(objectKey, bytes.buffer, {
        httpMetadata: { contentType: detectedMime },
        customMetadata: {
          originalName: fileName || 'file',
          uploadedBy: authUser?.id || 'anonymous',
        },
      });

      const keyName = objectKey.replace('docs/', '');
      const publicUrl = `https://backend.ravishankar-clinic.workers.dev/api/files/${keyName}`;

      return new Response(
        JSON.stringify({
          success: true,
          url: publicUrl,
          objectKey,
          fileName: fileName || 'file',
          mimeType: detectedMime,
          size: bytes.length,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      console.error('R2 upload error:', err);
      return new Response(JSON.stringify({ error: err?.message || 'Failed to upload file to R2' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  static async getFile(req: Request, env: Env, authUser?: AuthUser, params?: any): Promise<Response> {
    try {
      if (!env.chikusfa_storage) {
        return new Response('R2 Bucket not configured', { status: 500 });
      }

      const filename = params?.filename;
      if (!filename) {
        return new Response('Filename missing', { status: 400 });
      }

      const objectKey = `docs/${filename}`;
      const object = await env.chikusfa_storage.get(objectKey);

      if (!object) {
        return new Response('File not found in R2', { status: 404 });
      }

      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = object.httpMetadata?.contentType;
      if (!contentType || contentType === 'application/octet-stream') {
        if (ext === 'pdf') contentType = 'application/pdf';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        else if (ext === 'webp') contentType = 'image/webp';
      }

      const headers = new Headers();
      if (contentType) headers.set('Content-Type', contentType);
      headers.set('Content-Disposition', `inline; filename="${filename}"`);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

      return new Response(object.body, { headers });
    } catch (err: any) {
      return new Response('Error retrieving file', { status: 500 });
    }
  }

  static async deleteFile(req: Request, env: Env, authUser?: AuthUser, params?: any): Promise<Response> {
    try {
      if (!env.chikusfa_storage) {
        return new Response(JSON.stringify({ error: 'R2 Bucket not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const filename = params?.filename;
      if (!filename) {
        return new Response(JSON.stringify({ error: 'Filename missing' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const objectKey = filename.startsWith('docs/') ? filename : `docs/${filename}`;
      await env.chikusfa_storage.delete(objectKey);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Object '${filename}' successfully deleted from Cloudflare R2 Bucket`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      console.error('R2 delete error:', err);
      return new Response(JSON.stringify({ error: err?.message || 'Failed to delete file from R2' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
