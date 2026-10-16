import { Router, Request, Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { VerificationService } from '../services/verificationService.js';
import { AuditService } from '../services/auditService.js';

export const chefRouter = Router();

/**
 * GET /api/chefs
 * Public/Customer directory of active chefs.
 */
chefRouter.get('/', async (req: Request, res: Response) => {
  const { cityId, specialty, minRating, search, availableOnly } = req.query;

  let sql = `
    SELECT cp.*, u.name, u.avatar, u.city_id, u.city_name, u.status as user_status
    FROM chef_profiles cp
    JOIN users u ON cp.user_id = u.id
    WHERE u.status = 'active'
  `;
  const params: any[] = [];

  if (cityId) {
    sql += ' AND u.city_id = ?';
    params.push(cityId);
  }

  if (minRating) {
    sql += ' AND cp.rating >= ?';
    params.push(Number(minRating));
  }

  if (specialty) {
    sql += ' AND CAST(cp.specialties AS TEXT) LIKE ?';
    params.push(`%${String(specialty)}%`);
  }

  if (search) {
    sql += ' AND (u.name LIKE ? OR cp.bio LIKE ? OR CAST(cp.specialties AS TEXT) LIKE ?)';
    const q = `%${String(search)}%`;
    params.push(q, q, q);
  }

  if (availableOnly === 'true') {
    sql += ` AND cp.is_online = TRUE AND cp.status = 'available'`;
  }

  sql += ' ORDER BY cp.is_online DESC, cp.rating DESC, cp.reviews_count DESC';

  const rows = await query(sql, params);

  // Format JSON fields
  const formattedChefs = rows.map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    name: c.name,
    avatar: c.avatar,
    cityId: c.city_id,
    cityName: c.city_name,
    rating: c.rating,
    reviewsCount: c.reviews_count,
    experienceYears: c.experience_years,
    specialties: typeof c.specialties === 'string' ? JSON.parse(c.specialties) : c.specialties,
    currentLocation: {
      lat: c.current_lat || 12.9716,
      lng: c.current_lng || 77.5946,
      area: c.current_area || 'Indiranagar',
    },
    distanceKm: c.distance_km || 1.2,
    isOnline: Boolean(c.is_online),
    status: c.status,
    hourlyRate: c.hourly_rate,
    sosRate: c.sos_rate,
    dayPrepRate: c.day_prep_rate,
    shiftRate: c.shift_rate,
    bio: c.bio,
    languages: typeof c.languages === 'string' ? JSON.parse(c.languages) : c.languages,
    hygieneCertified: Boolean(c.hygiene_certified),
    policeVerified: Boolean(c.police_verified),
    signatureDishes: typeof c.signature_dishes === 'string' ? JSON.parse(c.signature_dishes) : c.signature_dishes,
  }));

  res.json({ success: true, chefs: formattedChefs });
});

/**
 * GET /api/chefs/:id
 * Detailed profile with verifications and reviews.
 */
chefRouter.get('/:id', async (req: Request, res: Response) => {
  const chefId = req.params.id;
  const chef = await queryOne<any>(
    `SELECT cp.*, u.name, u.avatar, u.city_id, u.city_name, u.status as user_status
     FROM chef_profiles cp
     JOIN users u ON cp.user_id = u.id
     WHERE cp.id = ? AND u.status = 'active'`,
    [chefId]
  );

  if (!chef) {
    res.status(404).json({ success: false, error: { code: 'CHEF_NOT_FOUND', message: 'Chef not found' } });
    return;
  }

  const verifications = await VerificationService.getChefVerifications(chefId);
  const reviews = await query('SELECT * FROM reviews WHERE chef_id = ? ORDER BY created_at DESC', [chefId]);

  res.json({
    success: true,
    chef: {
      ...chef,
      specialties: typeof chef.specialties === 'string' ? JSON.parse(chef.specialties) : chef.specialties,
      signatureDishes: typeof chef.signature_dishes === 'string' ? JSON.parse(chef.signature_dishes) : chef.signature_dishes,
      languages: typeof chef.languages === 'string' ? JSON.parse(chef.languages) : chef.languages,
      verifications,
      reviews,
    },
  });
});

/**
 * PUT /api/chefs/:id/status
 * Chef updates their availability status (online/busy/offline).
 */
chefRouter.put('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const chefId = req.params.id;
  const { isOnline, status } = req.body;

  const chef = await queryOne<any>('SELECT * FROM chef_profiles WHERE id = ?', [chefId]);
  if (!chef) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chef profile not found' } });
    return;
  }

  // Ensure owner or admin
  if (chef.user_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized chef update' } });
    return;
  }

  const newIsOnline = isOnline !== undefined ? (isOnline ? 1 : 0) : chef.is_online;
  const newStatus = status || chef.status;

  await run(
    `UPDATE chef_profiles
     SET is_online = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [newIsOnline, newStatus, chefId]
  );

  await AuditService.log({
    eventType: 'chef_availability_changed',
    userId: req.user!.id,
    userRole: req.user!.role,
    targetType: 'chef_profile',
    targetId: chefId,
    details: { isOnline: newIsOnline, status: newStatus },
  });

  res.json({ success: true, isOnline: Boolean(newIsOnline), status: newStatus });
});

/**
 * POST /api/chefs/:id/verification
 * Admin or Verification Engine updates a chef's background check status.
 */
chefRouter.post(
  '/:id/verification',
  requireAuth,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    const chefId = req.params.id;
    const { type, status, score = 95, referenceId, details } = req.body;

    const chef = await queryOne<any>('SELECT user_id FROM chef_profiles WHERE id = ?', [chefId]);
    if (!chef) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chef not found' } });
      return;
    }

    await VerificationService.setVerificationStatus(
      chefId,
      chef.user_id,
      type,
      status,
      score,
      referenceId,
      details,
      req.user!.id
    );

    res.json({ success: true, message: `Verification '${type}' updated to '${status}'.` });
  }
);
