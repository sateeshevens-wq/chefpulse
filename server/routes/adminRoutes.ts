import { Router, Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';

export const adminRouter = Router();

// Strictly restrict all admin routes to admin and support roles
adminRouter.use(requireAuth);
adminRouter.use(requireRole(['admin', 'support']));

/**
 * GET /api/admin/audit-logs
 * Retrieves immutable audit records.
 */
adminRouter.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const offset = parseInt(req.query.offset as string) || 0;
  const eventType = req.query.eventType as string | undefined;

  const logs = await AuditService.getLogs(limit, offset, eventType);
  const totalCount = await queryOne<any>('SELECT COUNT(*) as count FROM audit_logs');

  res.json({
    success: true,
    total: totalCount?.count || 0,
    logs,
  });
});

/**
 * GET /api/admin/users
 * Returns list of platform users.
 */
adminRouter.get('/users', requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const users = await query(
    'SELECT id, name, phone, email, role, status, suspension_reason, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT 200'
  );
  res.json({ success: true, users });
});

/**
 * PUT /api/admin/users/:id/status
 * Suspends, reinstates, or marks user deleted.
 */
adminRouter.put('/users/:id/status', requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.id;
  const { status, reason } = req.body;

  if (!status || !['active', 'suspended', 'deleted'].includes(status)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be active, suspended, or deleted.' } });
    return;
  }

  // Prevent self-suspension of the current admin
  if (targetUserId === req.user!.id && status !== 'active') {
    res.status(400).json({ success: false, error: { code: 'CANNOT_SUSPEND_SELF', message: 'Admin cannot suspend their own account.' } });
    return;
  }

  await run(
    `UPDATE users
     SET status = ?, suspension_reason = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [status, reason || null, targetUserId]
  );

  await AuditService.log({
    eventType: 'account_status_changed',
    userId: req.user!.id,
    userRole: req.user!.role,
    targetType: 'user',
    targetId: targetUserId,
    details: { newStatus: status, reason },
  });

  res.json({ success: true, message: `User status updated to ${status}.` });
});

/**
 * GET /api/admin/stats
 * Overview dashboard stats.
 */
adminRouter.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  const userCount = await queryOne<any>('SELECT COUNT(*) as count FROM users');
  const chefCount = await queryOne<any>('SELECT COUNT(*) as count FROM chef_profiles');
  const bookingCount = await queryOne<any>('SELECT COUNT(*) as count FROM bookings');
  const revenue = await queryOne<any>('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid"');
  const auditLogsCount = await queryOne<any>('SELECT COUNT(*) as count FROM audit_logs');

  res.json({
    success: true,
    stats: {
      totalUsers: userCount?.count || 0,
      totalChefs: chefCount?.count || 0,
      totalBookings: bookingCount?.count || 0,
      totalPaidRevenue: revenue?.total || 0,
      totalAuditEvents: auditLogsCount?.count || 0,
    },
  });
});
