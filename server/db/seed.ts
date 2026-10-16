import bcrypt from 'bcryptjs';
import { queryOne, run } from './database.js';
import { INITIAL_CHEFS } from '../../src/data/mockData.js';
import { AuditService } from '../services/auditService.js';
import { VerificationService } from '../services/verificationService.js';
import { RewardService } from '../services/rewardService.js';

export async function seedInitialData(): Promise<void> {
  // Demo seed data is for local development/tests only. Never seed fake accounts or chefs in production.
  if (process.env.NODE_ENV === 'production' && process.env.SEED_DEMO_DATA !== 'true') return;
  const existingAdmin = await queryOne("SELECT id FROM users WHERE role = 'admin'");
  if (existingAdmin) {
    // Already seeded
    return;
  }

  console.log('[Seed] Database is clean. Seeding production-ready baseline accounts & chefs...');

  const commonPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(commonPassword, salt);

  // 1. Admin Account
  const adminId = 'usr-admin-01';
  await run(
    `INSERT INTO users (
      id, email, phone, password_hash, role, status, name, avatar,
      verified, city_id, city_name, address, lat, lng, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'admin', 'active', ?, ?, TRUE, 'blr', 'Bengaluru', 'ChefPulse Command Center, Bengaluru', 12.9716, 77.5946, datetime('now'), datetime('now'))`,
    [
      adminId,
      'admin@chefpulse.in',
      '+919999999999',
      passwordHash,
      'ChefPulse Admin Command Desk',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    ]
  );

  // 2. Support Account
  const supportId = 'usr-support-01';
  await run(
    `INSERT INTO users (
      id, email, phone, password_hash, role, status, name, avatar,
      verified, city_id, city_name, address, lat, lng, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'support', 'active', ?, ?, TRUE, 'blr', 'Bengaluru', 'Safety Sentinel Dispatch, Bengaluru', 12.9716, 77.5946, datetime('now'), datetime('now'))`,
    [
      supportId,
      'support@chefpulse.in',
      '+918888888888',
      passwordHash,
      'Priya N. (Safety Operations)',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    ]
  );

  // 3. Customer Account (Rahul & Tanya Verma)
  const customerId = 'user-default';
  await run(
    `INSERT INTO users (
      id, email, phone, password_hash, role, status, name, avatar,
      verified, city_id, city_name, address, lat, lng, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'customer', 'active', ?, ?, TRUE, 'blr', 'Bengaluru', '100ft Road, Indiranagar, Bengaluru', 12.9755, 77.6432, datetime('now'), datetime('now'))`,
    [
      customerId,
      'rahul.verma@chefpulse.in',
      '+919845091234',
      passwordHash,
      'Rahul & Tanya Verma',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    ]
  );

  await run(
    `INSERT INTO customer_profiles (id, user_id, dietary_preference, household_size, favorite_cuisines)
     VALUES ('cp-default', ?, 'all', '2-4 People', ?)`,
    [customerId, JSON.stringify(['North Indian', 'South Indian', 'Tandoor & Kebabs'])]
  );

  // Initialize customer reward account with 650 points
  await RewardService.getOrCreateAccount(customerId);
  await RewardService.creditPoints(customerId, 650, 'earn', 'Welcome & Past Completed Bookings');

  // 4. Seed Chefs from INITIAL_CHEFS
  for (const chef of INITIAL_CHEFS) {
    const chefUserId = `usr-${chef.id}`;
    const cleanPhone = chef.phone ? chef.phone.replace(/[^\d+]/g, '') : `+9198450${Math.floor(10000 + Math.random() * 90000)}`;

    await run(
      `INSERT INTO users (
        id, email, phone, password_hash, role, status, name, avatar,
        verified, city_id, city_name, address, lat, lng, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'chef', 'active', ?, ?, TRUE, 'blr', 'Bengaluru', ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        chefUserId,
        `${chef.id}@chefpulse.in`,
        cleanPhone,
        passwordHash,
        chef.name,
        chef.avatar,
        chef.currentLocation.area,
        chef.currentLocation.lat,
        chef.currentLocation.lng,
      ]
    );

    await run(
      `INSERT INTO chef_profiles (
        id, user_id, experience_years, specialties, bio, languages,
        hourly_rate, sos_rate, day_prep_rate, shift_rate, signature_dishes,
        gallery_images, rating, reviews_count, is_online, status, distance_km,
        current_lat, current_lng, current_area, hygiene_certified, police_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'available', ?, ?, ?, ?, TRUE, TRUE)`,
      [
        chef.id,
        chefUserId,
        chef.experienceYears,
        JSON.stringify(chef.specialties),
        chef.bio,
        JSON.stringify(chef.languages),
        chef.hourlyRate,
        chef.sosRate,
        chef.dayPrepRate,
        chef.shiftRate,
        JSON.stringify(chef.signatureDishes),
        JSON.stringify(chef.galleryImages || []),
        chef.rating,
        chef.reviewsCount,
        chef.distanceKm,
        chef.currentLocation.lat,
        chef.currentLocation.lng,
        chef.currentLocation.area,
      ]
    );

    // Seed verifications
    await VerificationService.setVerificationStatus(
      chef.id,
      chefUserId,
      'police',
      'verified',
      98,
      `CCTNS-KA-BLR-${chef.id}`,
      { jurisdiction: 'Indiranagar Police Station', crimeRecordClear: true }
    );
    await VerificationService.setVerificationStatus(
      chef.id,
      chefUserId,
      'fssai',
      'verified',
      96,
      `FSSAI-1122334455${chef.id}`,
      { category: 'Private Culinary Caterer', hygieneAuditScore: 98 }
    );
    await VerificationService.setVerificationStatus(
      chef.id,
      chefUserId,
      'aadhaar',
      'verified',
      99,
      `UIDAI-${chef.id}`,
      { maskedAadhaar: 'XXXX-XXXX-4819', biometricMatched: true }
    );
  }

  // 5. Seed an Initial Sample Booking
  const sampleBookingId = 'book-sample-01';
  await run(
    `INSERT INTO bookings (
      id, booking_number, type, customer_id, chef_id, service_address, area,
      lat, lng, scheduled_time, guest_count, cuisines, dishes_requested,
      special_instructions, subtotal, surge_amount, platform_fee, gst_amount,
      total_amount, status, payment_status, otp_code, eta_minutes, created_at, updated_at
    ) VALUES (?, 'BK-991201', 'sos_quick_fix', ?, 'chef-01', '100ft Road, Indiranagar, Bengaluru', 'Indiranagar',
      12.9755, 77.6432, NOW(), 2, ?, 'Royal Dum Biryani & Galouti Kebabs', 'Mild spicy',
      850, 0, 49, 162, 1061, 'accepted', 'paid', '5821', 12, datetime('now'), datetime('now'))`,
    [
      sampleBookingId,
      customerId,
      JSON.stringify(['North Indian / Mughlai', 'Tandoor & Kebabs']),
    ]
  );

  await run(
    `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason, timestamp)
     VALUES ('hist-init-01', ?, 'requested', 'paid', ?, 'system', 'Escrow pre-authorization', datetime('now'))`,
    [sampleBookingId, customerId]
  );
  await run(
    `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, changed_by_user_id, changed_by_role, reason, timestamp)
     VALUES ('hist-init-02', ?, 'paid', 'accepted', 'usr-chef-01', 'chef', 'Chef accepted booking on radar', datetime('now'))`,
    [sampleBookingId]
  );

  await AuditService.log({
    eventType: 'database_seeded',
    userId: adminId,
    userRole: 'admin',
    details: { message: 'Baseline accounts and chefs seeded successfully.' },
  });

  console.log('[Seed] Database successfully seeded with baseline accounts and sample chefs.');
}
