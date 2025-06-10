const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Production Supabase configuration
const supabaseUrl = 'https://nhmwqldsidcxfdvvcdst.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-service-key';

console.log('🚀 SoulLens.AI Database Deployment Script');
console.log('=========================================');
console.log('📊 Deploying to production Supabase...');

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function deployDatabase() {
  try {
    console.log('\n📋 Reading schema files...');
    
    // Read main schema
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Read programs migration
    const programsMigrationPath = path.join(__dirname, 'supabase', 'migrations', '20241206000000_programs_feature.sql');
    const programsMigration = fs.readFileSync(programsMigrationPath, 'utf8');
    
    // Read programs seed data
    const programsSeedPath = path.join(__dirname, 'supabase', 'programs_seed.sql');
    const programsSeed = fs.readFileSync(programsSeedPath, 'utf8');
    
    console.log('✅ Schema files loaded successfully');
    
    // Deploy main schema
    console.log('\n🏗️  Deploying main schema...');
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schema });
    if (schemaError) {
      console.error('❌ Schema deployment failed:', schemaError);
    } else {
      console.log('✅ Main schema deployed successfully');
    }
    
    // Deploy programs feature migration
    console.log('\n📚 Deploying programs feature...');
    const { error: programsError } = await supabase.rpc('exec_sql', { sql: programsMigration });
    if (programsError) {
      console.error('❌ Programs migration failed:', programsError);
    } else {
      console.log('✅ Programs feature deployed successfully');
    }
    
    // Deploy programs seed data
    console.log('\n🌱 Seeding programs data...');
    const { error: seedError } = await supabase.rpc('exec_sql', { sql: programsSeed });
    if (seedError) {
      console.error('❌ Programs seed failed:', seedError);
    } else {
      console.log('✅ Programs seeded successfully');
    }
    
    // Test database connection and verify tables
    console.log('\n🔍 Verifying deployment...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Verification failed:', tablesError);
    } else {
      console.log('✅ Database verification successful');
      console.log('📊 Tables created:', tables.map(t => t.table_name).join(', '));
    }
    
    // Check if Into Confidence program was created
    const { data: programs, error: programsCheckError } = await supabase
      .from('programs')
      .select('name, slug')
      .eq('slug', 'into-confidence');
    
    if (programsCheckError) {
      console.error('❌ Programs check failed:', programsCheckError);
    } else if (programs && programs.length > 0) {
      console.log('✅ Into Confidence program created successfully');
      console.log('🎯 Program details:', programs[0]);
    } else {
      console.log('⚠️  Into Confidence program not found - check seed data');
    }
    
    console.log('\n🎉 Database deployment completed!');
    console.log('🌐 Your SoulLens.AI database is now ready at:', supabaseUrl);
    
  } catch (error) {
    console.error('💥 Deployment failed with error:', error);
    process.exit(1);
  }
}

// Run deployment
deployDatabase();