import { Env, AuthUser } from '../types';
import { ApprovalService } from '../services/ApprovalService';

export class ApprovalController {
  static async request(request: Request, env: Env, authUser: AuthUser) {
    try {
      const body = (await request.json()) as any;
      const { type, entityData, managerId, remarks } = body;

      if (!type || !entityData) {
        return new Response(JSON.stringify({ error: 'Missing required fields: type, entityData' }), { status: 400 });
      }

      // Safe requester identity from authenticated token
      const requesterId = authUser.userId || authUser.id;
      const requesterRole = authUser.role;
      const requesterHqId = authUser.hqId || '';

      const id = `appr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date().toISOString();

      await env.chikusfa_db
        .prepare(
          `INSERT INTO approvals (id, type, requested_by, manager_id, requester_role, requester_hq_id, entity_data, status, manager_remarks, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          id,
          type,
          requesterId,
          managerId || authUser.reportsToId || null,
          requesterRole,
          requesterHqId,
          typeof entityData === 'string' ? entityData : JSON.stringify(entityData),
          'PENDING',
          remarks || '',
          now,
          now
        )
        .run();

      return new Response(JSON.stringify({ success: true, id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      console.error('[Approval Request Error]', err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async getPending(request: Request, env: Env, authUser: AuthUser) {
    try {
      let query = "SELECT * FROM approvals WHERE status = 'PENDING'";
      const params: any[] = [];

      if (authUser.role !== 'OWNER' && authUser.role !== 'ADMIN') {
        query += ' AND (manager_id = ? OR manager_id = ?)';
        params.push(authUser.id, authUser.userId || authUser.id);
      }

      query += ' ORDER BY created_at DESC';
      const { results } = await env.chikusfa_db.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async getMy(request: Request, env: Env, authUser: AuthUser) {
    try {
      const myId = authUser.userId || authUser.id;
      const { results } = await env.chikusfa_db
        .prepare('SELECT * FROM approvals WHERE requested_by = ? OR requested_by = ? ORDER BY created_at DESC')
        .bind(myId, authUser.id)
        .all();
      return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async deleteMy(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
    try {
      const { id } = params;
      const myId = authUser.userId || authUser.id;

      // Can only delete own pending requests
      const result = await env.chikusfa_db
        .prepare("DELETE FROM approvals WHERE id = ? AND (requested_by = ? OR requested_by = ?) AND status = 'PENDING'")
        .bind(id, myId, authUser.id)
        .run();

      if (result.meta.changes === 0) {
        return new Response(JSON.stringify({ error: 'Cannot delete request (not found, not yours, or already processed)' }), { status: 400 });
      }

      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async updateMy(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
    try {
      const { id } = params;
      const body = (await request.json()) as any;
      const myId = authUser.userId || authUser.id;

      const result = await env.chikusfa_db
        .prepare(
          "UPDATE approvals SET entity_data = ?, updated_at = ? WHERE id = ? AND (requested_by = ? OR requested_by = ?) AND status = 'PENDING'"
        )
        .bind(
          typeof body.entityData === 'string' ? body.entityData : JSON.stringify(body.entityData),
          new Date().toISOString(),
          id,
          myId,
          authUser.id
        )
        .run();

      if (result.meta.changes === 0) {
        return new Response(JSON.stringify({ error: 'Cannot update request (not found, not yours, or already processed)' }), { status: 400 });
      }

      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async action(request: Request, env: Env, authUser: AuthUser) {
    try {
      const { id, action, remarks } = (await request.json()) as { id: string; action: string; remarks?: string };

      if (!id || !action || !['APPROVED', 'REJECTED'].includes(action)) {
        return new Response(JSON.stringify({ error: 'Invalid action payload. Must specify id and action (APPROVED/REJECTED).' }), { status: 400 });
      }

      // Fetch the approval record
      const approval: any = await env.chikusfa_db.prepare('SELECT * FROM approvals WHERE id = ?').bind(id).first();
      if (!approval) {
        return new Response(JSON.stringify({ error: 'Approval request not found.' }), { status: 404 });
      }

      // Double-approval check: verify it is still PENDING
      if (approval.status !== 'PENDING') {
        return new Response(
          JSON.stringify({ error: `409 Conflict: Approval request was already processed with status '${approval.status}'.` }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Self-Approval Prevention: A user cannot approve their own requests
      if (authUser.role !== 'OWNER' && (approval.requested_by === authUser.id || approval.requested_by === authUser.userId)) {
        return new Response(
          JSON.stringify({ error: '403 Forbidden: Self-approval is strictly prohibited. Requests must be reviewed by your manager.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Manager Authorization Verification: Only assigned manager or OWNER/ADMIN can action
      if (authUser.role !== 'OWNER' && authUser.role !== 'ADMIN') {
        const isAssigned =
          approval.manager_id === authUser.id ||
          approval.manager_id === authUser.userId;
        if (!isAssigned) {
          return new Response(
            JSON.stringify({ error: '403 Forbidden: You are not authorized to action this approval request.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const now = new Date().toISOString();
      // Atomic State Guard (CAS): UPDATE ONLY IF status = 'PENDING'
      const updateResult = await env.chikusfa_db
        .prepare(
          "UPDATE approvals SET status = ?, manager_remarks = ?, updated_at = ? WHERE id = ? AND status = 'PENDING'"
        )
        .bind(action, remarks || '', now, id)
        .run();

      if (updateResult.meta.changes === 0) {
        return new Response(
          JSON.stringify({ error: '409 Conflict: Concurrent modification detected. Approval request is no longer in PENDING state.' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Apply changes to database with automatic rollback on application failure
      const service = new ApprovalService();
      try {
        if (action === 'APPROVED') {
          await service.applyApproval(env, approval, authUser);
        } else if (action === 'REJECTED') {
          await service.rejectApproval(env, approval, authUser, remarks);
        }
      } catch (applyErr: any) {
        // Roll back approval status back to PENDING so record is not left corrupted
        await env.chikusfa_db
          .prepare("UPDATE approvals SET status = 'PENDING', manager_remarks = ?, updated_at = ? WHERE id = ?")
          .bind(`[Failed: ${applyErr.message}]`, new Date().toISOString(), id)
          .run();
        throw applyErr;
      }

      return new Response(JSON.stringify({ success: true, status: action }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      console.error('[Approval Action Error]', err);
      const status = err.message.includes('409 Conflict') ? 409 : 500;
      return new Response(JSON.stringify({ error: err.message }), { status });
    }
  }

  static async batchAction(request: Request, env: Env, authUser: AuthUser) {
    try {
      const { ids, action, remarks } = (await request.json()) as { ids: string[]; action: string; remarks?: string };
      if (!ids || !Array.isArray(ids) || ids.length === 0 || !['APPROVED', 'REJECTED'].includes(action)) {
        return new Response(JSON.stringify({ error: 'Invalid batch action payload' }), { status: 400 });
      }

      // 1. Fetch only records that are currently PENDING
      const placeholders = ids.map(() => '?').join(',');
      const { results: pendingRecords } = await env.chikusfa_db
        .prepare(`SELECT * FROM approvals WHERE id IN (${placeholders}) AND status = 'PENDING'`)
        .bind(...ids)
        .all();

      const pendingList = pendingRecords || [];
      if (pendingList.length === 0) {
        return new Response(
          JSON.stringify({ error: '409 Conflict: None of the selected approval requests are in PENDING status.' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Authorization & Self-Approval verification
      if (authUser.role !== 'OWNER' && authUser.role !== 'ADMIN') {
        const forbidden = pendingList.some(
          (row: any) =>
            (row.manager_id !== authUser.id && row.manager_id !== authUser.userId) ||
            row.requested_by === authUser.id ||
            row.requested_by === authUser.userId
        );
        if (forbidden) {
          return new Response(
            JSON.stringify({ error: '403 Forbidden: You are not authorized to action some of these requests (or attempted self-approval).' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const pendingIds = pendingList.map((r: any) => r.id);
      const now = new Date().toISOString();
      const stmt = env.chikusfa_db.prepare(
        "UPDATE approvals SET status = ?, manager_remarks = ?, updated_at = ? WHERE id = ? AND status = 'PENDING'"
      );
      const stmts = pendingIds.map((id: string) => stmt.bind(action, remarks || '', now, id));
      await env.chikusfa_db.batch(stmts);

      if (action === 'APPROVED') {
        const service = new ApprovalService();
        for (const app of pendingList) {
          try {
            await service.applyApproval(env, app, authUser);
          } catch (e: any) {
            console.error('Failed to apply approval in batch:', app.id, e);
            // Roll back failed record to PENDING
            await env.chikusfa_db
              .prepare("UPDATE approvals SET status = 'PENDING', manager_remarks = ?, updated_at = ? WHERE id = ?")
              .bind(`[Batch apply failed: ${e.message}]`, new Date().toISOString(), app.id)
              .run();
          }
        }
      }

      return new Response(JSON.stringify({ success: true, processedCount: pendingIds.length }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
}
