# ChefPulse + Supabase (Free Foundation)

This folder contains the PostgreSQL schema used by ChefPulse.

## Supabase setup
1. Open the ChefPulse Supabase project.
2. Open **SQL Editor**.
3. Create a new query.
4. Copy the complete contents of `CHEFPULSE_SUPABASE_SCHEMA.sql` into the query.
5. Run the query.
6. In **Table Editor**, confirm that the ChefPulse tables were created.

Do not paste the Supabase database password, service-role key, or other secrets into the source repository or chat.

The application will connect using `DATABASE_URL` on the server. The database URL belongs only in the server's secret/environment configuration.
