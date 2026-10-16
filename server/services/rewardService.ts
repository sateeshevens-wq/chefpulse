import { queryOne, run } from '../db/database.js';
import { AuditService } from './auditService.js';
import crypto from 'crypto';

export class RewardService {
  /**
   * Ensures a user has a reward account initialized.
   */
  static async getOrCreateAccount(userId: string): Promise<any> {
    let account = await queryOne<any>('SELECT * FROM reward_accounts WHERE user_id = ?', [userId]);
    if (!account) {
      const id = `rew-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      await run(
        `INSERT INTO reward_accounts (id, user_id, total_points, points_spent, current_tier, catering_discount_percentage, completed_bookings_count)
         VALUES (?, ?, 0, 0, 'Bronze Epicure', 5.0, 0)`,
        [id, userId]
      );
      account = await queryOne<any>('SELECT * FROM reward_accounts WHERE user_id = ?', [userId]);
    }
    return account;
  }

  /**
   * Authoritatively credits points (e.g. from completed booking, referral, or admin credit).
   */
  static async creditPoints(
    userId: string,
    points: number,
    type: 'earn' | 'adjustment' | 'dispute_credit',
    description: string,
    bookingId?: string
  ): Promise<{ success: boolean; newTotal: number }> {
    if (points <= 0) {
      throw new Error('Points to credit must be strictly positive');
    }

    const account = await this.getOrCreateAccount(userId);
    const newTotal = account.total_points + points;
    const newTier = this.calculateTier(newTotal);

    await run(
      `UPDATE reward_accounts
       SET total_points = ?, current_tier = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [newTotal, newTier, account.id]
    );

    const txId = `rtx-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await run(
      `INSERT INTO reward_transactions (id, reward_account_id, user_id, booking_id, points, type, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [txId, account.id, userId, bookingId || null, points, type, description]
    );

    await AuditService.log({
      eventType: 'reward_transaction',
      userId,
      userRole: 'customer',
      targetType: 'reward_account',
      targetId: account.id,
      details: { points, type, description, newTotal, newTier },
    });

    return { success: true, newTotal };
  }

  /**
   * Authoritatively debits points (e.g. perk redemption).
   * Strictly prevents overdraft/negative balance.
   */
  static async debitPoints(
    userId: string,
    points: number,
    description: string
  ): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    if (points <= 0) {
      return { success: false, error: 'Points to debit must be strictly positive' };
    }

    const account = await this.getOrCreateAccount(userId);
    if (account.total_points < points) {
      return {
        success: false,
        error: `Insufficient reward balance. Available: ${account.total_points}, Required: ${points}`,
      };
    }

    const newTotal = account.total_points - points;
    const newSpent = account.points_spent + points;

    await run(
      `UPDATE reward_accounts
       SET total_points = ?, points_spent = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [newTotal, newSpent, account.id]
    );

    const txId = `rtx-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await run(
      `INSERT INTO reward_transactions (id, reward_account_id, user_id, points, type, description, created_at)
       VALUES (?, ?, ?, ?, 'redeem', ?, datetime('now'))`,
      [txId, account.id, userId, -points, description]
    );

    await AuditService.log({
      eventType: 'reward_transaction',
      userId,
      userRole: 'customer',
      targetType: 'reward_account',
      targetId: account.id,
      details: { pointsDebited: points, description, newTotal },
    });

    return { success: true, newTotal };
  }

  private static calculateTier(points: number): string {
    if (points >= 5000) return 'Platinum Grand Cru';
    if (points >= 2500) return 'Gold Connoisseur';
    if (points >= 1000) return 'Silver Gourmet';
    return 'Bronze Epicure';
  }
}
