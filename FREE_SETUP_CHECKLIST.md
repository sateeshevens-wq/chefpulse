# ChefPulse Free Setup Checklist

## Completed by owner
- [x] Supabase project created
- [x] Firebase project created

## Safe free work in source
- [x] PostgreSQL runtime path present
- [x] Supabase-compatible PostgreSQL schema present
- [x] Capacitor configuration present for Android/iOS wrapper preparation
- [x] Customer/chef signup no longer starts with a personal/demo phone, email, name, or address
- [x] Production payment simulation remains blocked
- [x] Production requires PostgreSQL, explicit CORS, JWT secret, real payment provider, and webhook secret

## Next owner action
- [ ] Run `supabase/CHEFPULSE_SUPABASE_SCHEMA.sql` in the Supabase SQL Editor
- [ ] Confirm the tables appear in Supabase Table Editor

## Secrets to keep private
Never put these in chat, source control, or mobile builds:
- Supabase database password
- Supabase service-role key
- Database connection string
- JWT secret
- Razorpay secret
- Payment webhook secret
- Firebase service-account private key
