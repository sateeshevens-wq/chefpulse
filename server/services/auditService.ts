import { run, query } from '../db/database.js';
import crypto from 'crypto';

export interface AuditLogEntry {
  id: string;
  eventType: string;
  userId?: string | null;
  userRole?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, any>;
  createdAt?: string;
}

export class AuditService {
  /**
   * Appends an immutable audit log record.
   * This table is INSERT-only by design.
   */
  static async log(entry: {
    eventType: string;
    userId?: string | null;
    userRole?: string | null;
    targetType?: string | null;
    targetId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    details?: Record<string, any>;
  }): Promise<string> {
    const id = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const detailsJson = entry.details ? JSON.stringify(entry.details) : null;

    await run(
      `INSERT INTO audit_logs (id, event_type, user_id, user_role, target_type, target_id, ip_address, user_agent, details_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        id,
        entry.eventType,
        entry.userId || null,
        entry.userRole || null,
        entry.targetType || null,
        entry.targetId || null,
        entry.ipAddress || null,
        entry.userAgent || null,
        detailsJson,
      ]
    );

    return id;
  }

  /**
   * Retrieves recent audit logs (Admin/Support audit trail).
   */
  static async getLogs(limit = 100, offset = 0, eventType?: string): Promise<any[]> {
    if (eventType) {
      return await query(
        `SELECT * FROM audit_logs WHERE event_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [eventType, limit, offset]
      );
    }
    return await query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }
}
