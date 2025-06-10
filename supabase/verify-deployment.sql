
-- Quick verification queries to run after deployment
-- Run these in the SQL editor to verify successful deployment

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check Into Confidence program was created
SELECT name, slug, duration_days, tier_required 
FROM programs 
WHERE slug = 'into-confidence';

-- Check sample lessons were created
SELECT p.name as program_name, pl.day_number, pl.title 
FROM program_lessons pl
JOIN programs p ON pl.program_id = p.id
WHERE p.slug = 'into-confidence'
ORDER BY pl.day_number
LIMIT 5;

-- Check RLS policies are enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'programs', 'journal_entries');
