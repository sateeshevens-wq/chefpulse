import { query, queryOne, run } from '../db/database.js';
import { AuditService } from './auditService.js';
import crypto from 'crypto';

export interface VerificationCheck {
  id: string;
  authority: string;
  referenceId: string;
  status: 'passed' | 'review_required' | 'flagged' | 'failed';
  score: number;
  notes: string;
  verifiedAt?: string;
}

export interface VerificationProvider {
  verifyAadhaar(maskedNumber: string, name: string): Promise<VerificationCheck>;
  verifyFssai(licenseNumber: string): Promise<VerificationCheck>;
  verifyPoliceClearance(pccNumber: string, stateJurisdiction: string): Promise<VerificationCheck>;
}

/**
 * Standard Verification Service with interface separation for future real external APIs.
 */
export class VerificationService {
  /**
   * Retrieves all verification records for a chef.
   */
  static async getChefVerifications(chefId: string): Promise<any[]> {
    return await query(
      'SELECT * FROM verifications WHERE chef_id = ? ORDER BY created_at DESC',
      [chefId]
    );
  }

  /**
   * Records or updates a verification record.
   * Logs verification status changes to the immutable audit log.
   */
  static async setVerificationStatus(
    chefId: string,
    userId: string,
    type: 'aadhaar' | 'fssai' | 'police' | 'hygiene' | 'overall',
    status: 'unverified' | 'pending' | 'verified' | 'flagged' | 'rejected',
    score: number,
    referenceId?: string,
    details?: Record<string, any>,
    actorId?: string
  ): Promise<void> {
    const existing = await queryOne<any>(
      'SELECT id, status FROM verifications WHERE chef_id = ? AND verification_type = ?',
      [chefId, type]
    );

    const detailsJson = details ? JSON.stringify(details) : null;
    const now = new Date().toISOString();

    if (existing) {
      await run(
        `UPDATE verifications
         SET status = ?, score = ?, reference_id = ?, details_json = ?, verified_at = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [status, score, referenceId || null, detailsJson, status === 'verified' ? now : null, existing.id]
      );
    } else {
      const id = `ver-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      await run(
        `INSERT INTO verifications (id, chef_id, user_id, verification_type, reference_id, status, score, details_json, verified_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [id, chefId, userId, type, referenceId || null, status, score, detailsJson, status === 'verified' ? now : null]
      );
    }

    // Update chef profile police_verified / hygiene_certified flags if relevant
    if (type === 'police') {
      await run('UPDATE chef_profiles SET police_verified = ? WHERE id = ?', [status === 'verified' ? 1 : 0, chefId]);
    } else if (type === 'hygiene' || type === 'fssai') {
      await run('UPDATE chef_profiles SET hygiene_certified = ? WHERE id = ?', [status !== 'rejected' ? 1 : 0, chefId]);
    }

    await AuditService.log({
      eventType: 'chef_verification_changed',
      userId: actorId || userId,
      userRole: 'admin',
      targetType: 'chef_profile',
      targetId: chefId,
      details: {
        verificationType: type,
        status,
        score,
        referenceId,
      },
    });
  }
}
