# ChefPulse Supabase mobile setup

The mobile app is initialized for Supabase using `mobile/supabaseClient.js`.

Set these Expo environment variables before running the app:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

The publishable/anon key is intended for the client. Never put a Supabase service-role key in the mobile app.

Apply the SQL migration in `supabase/migrations/202610180001_core_tables.sql` after linking the Supabase project.
