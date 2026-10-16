import { Router, Response } from 'express';
import crypto from 'crypto';
import { query, run } from '../db/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const notificationRouter = Router();

/**
 * POST /api/notifications/push-token
 * Registers/refreshes a user's FCM device token. Tokens are unique per user/platform.
 */
notificationRouter.post('/push-token', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { token, platform, deviceId } = req.body || {};

  if (typeof token !== 'string' || token.length < 20 || token.length > 4096) {
    res.status(400).json({ success: false, error: { code: 'INVALID_PUSH_TOKEN', message: 'A valid notification token is required.' } });
    return;
  }

  if (!['web', 'android', 'ios'].includes(platform)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_PUSH_PLATFORM', message: 'Unsupported notification platform.' } });
    return;
  }

  const id = `push-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  await run(
    `INSERT INTO push_tokens (id, user_id, token, platform, device_id, active, last_seen_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, TRUE, ?, ?, ?)
     ON CONFLICT(token) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       platform = EXCLUDED.platform,
       device_id = EXCLUDED.device_id,
       active = TRUE,
       last_seen_at = EXCLUDED.last_seen_at,
       updated_at = EXCLUDED.updated_at`,
    [id, req.user!.id, token, platform, deviceId || null, now, now, now]
  );

  res.status(201).json({ success: true });
});


/**
 * GET /api/notifications
 * Lists recent notifications for authenticated user.
 */
notificationRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user!.id]
  );
  res.json({ success: true, notifications });
});

/**
 * PUT /api/notifications/:id/read
 * Marks a notification as read.
 */
notificationRouter.put('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const notifId = req.params.id;
  await run('UPDATE notifications SET read = TRUE WHERE id = ? AND user_id = ?', [notifId, req.user!.id]);
  res.json({ success: true });
});

/**
 * POST /api/notifications/dispatch
 * Internal dispatcher for test or system alerts.
 */
notificationRouter.post('/dispatch', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { title, message, type = 'system', metadata } = req.body;
  const id = `notif-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  await run(
    `INSERT INTO notifications (id, user_id, title, message, type, read, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, FALSE, ?, datetime('now'))`,
    [id, req.user!.id, title, message, type, metadata ? JSON.stringify(metadata) : null]
  );

  res.status(201).json({ success: true, notificationId: id });
});
