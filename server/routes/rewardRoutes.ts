import { Router, Response } from 'express';
import { query } from '../db/database.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { RewardService } from '../services/rewardService.js';

export const rewardRouter = Router();

/**
 * GET /api/rewards
 * Returns current authenticated user's reward account and transaction history.
 */
rewardRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const account = await RewardService.getOrCreateAccount(req.user!.id);
  const transactions = await query(
    'SELECT * FROM reward_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user!.id]
  );

  res.json({
    success: true,
    rewards: {
      totalPoints: account.total_points,
      pointsSpent: account.points_spent,
      currentTier: account.current_tier,
      cateringDiscountPercentage: account.catering_discount_percentage,
      completedBookingsCount: account.completed_bookings_count,
      transactions,
    },
  });
});

/**
 * POST /api/rewards/redeem
 * Redeems points for perks with server-authoritative balance validation.
 */
rewardRouter.post('/redeem', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { pointsCost, perkTitle } = req.body;

  if (!pointsCost || typeof pointsCost !== 'number' || pointsCost <= 0) {
    res.status(400).json({ success: false, error: { code: 'INVALID_POINTS', message: 'Valid points cost required.' } });
    return;
  }

  const result = await RewardService.debitPoints(
    req.user!.id,
    pointsCost,
    `Redeemed perk: ${perkTitle || 'Reward Perk'}`
  );

  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'INSUFFICIENT_POINTS', message: result.error } });
    return;
  }

  res.json({
    success: true,
    message: 'Perk redeemed successfully',
    newTotalPoints: result.newTotal,
  });
});

/**
 * POST /api/rewards/credit
 * Admin-only: grants loyalty points or compensation credits.
 */
rewardRouter.post('/credit', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { targetUserId, points, reason = 'Administrative Loyalty Credit' } = req.body;

  if (!targetUserId || !points || points <= 0) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'targetUserId and positive points required' } });
    return;
  }

  const result = await RewardService.creditPoints(
    targetUserId,
    points,
    'adjustment',
    reason
  );

  res.json({ success: true, newTotalPoints: result.newTotal });
});
