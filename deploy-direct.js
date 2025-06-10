import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct SQL execution via REST API approach
const supabaseUrl = 'https://nhmwqldsidcxfdvvcdst.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obXdxbGRzaWRjeGZkdnZjZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIzNjAsImV4cCI6MjA2NDYwODM2MH0.O2ccJUNXZVxUWVHG0PcwmQ2NFfQO0gjY019qeghmV3M';

console.log('🚀 SoulLens.AI Database Schema Preparation');
console.log('==========================================');

async function prepareSchemaFiles() {
  try {
    console.log('📋 Reading and combining schema files...');
    
    // Read main schema
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Read programs migration
    const programsMigrationPath = path.join(__dirname, 'supabase', 'migrations', '20241206000000_programs_feature.sql');
    const programsMigration = fs.readFileSync(programsMigrationPath, 'utf8');
    
    // Read programs seed data
    const programsSeedPath = path.join(__dirname, 'supabase', 'programs_seed.sql');
    const programsSeed = fs.readFileSync(programsSeedPath, 'utf8');
    
    // Combine all SQL into one file for manual execution
    const combinedSQL = `
-- =========================================================================
-- SoulLens.AI Complete Database Schema
-- Generated for Production Deployment: ${new Date().toISOString()}
-- =========================================================================

-- STEP 1: Main Schema
${schema}

-- STEP 2: Programs Feature Migration
${programsMigration}

-- STEP 3: Programs Seed Data
${programsSeed}

-- =========================================================================
-- Deployment Complete!
-- =========================================================================
`;

    // Write combined SQL file
    const outputPath = path.join(__dirname, 'supabase', 'combined-deployment.sql');
    fs.writeFileSync(outputPath, combinedSQL);
    
    console.log('✅ Combined schema created at:', outputPath);
    console.log('\n📝 Manual Deployment Instructions:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of combined-deployment.sql');
    console.log('4. Execute the SQL commands');
    
    console.log('\n🌐 Supabase Project URL:', supabaseUrl);
    console.log('🔑 Dashboard URL:', supabaseUrl.replace('.supabase.co', '.supabase.co/project/dashboard'));
    
    // Also create an initialization check script
    const initCheck = `
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
`;

    const verifyPath = path.join(__dirname, 'supabase', 'verify-deployment.sql');
    fs.writeFileSync(verifyPath, initCheck);
    
    console.log('🔍 Verification queries created at:', verifyPath);
    
    return true;
    
  } catch (error) {
    console.error('💥 Schema preparation failed:', error);
    return false;
  }
}

prepareSchemaFiles();