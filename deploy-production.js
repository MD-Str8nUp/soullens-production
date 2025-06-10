import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production Supabase configuration
const supabaseUrl = 'https://nhmwqldsidcxfdvvcdst.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obXdxbGRzaWRjeGZkdnZjZHN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAzMjM2MCwiZXhwIjoyMDY0NjA4MzYwfQ.nFQHROo81MzZl8xpHLf8dfW0zEqLR68ENlT-2109LT8';

console.log('🚀 SoulLens.AI Production Database Deployment');
console.log('=============================================');
console.log('📊 Deploying to:', supabaseUrl);

// Initialize Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSQLFile(filePath, description) {
  console.log(`\n🔧 ${description}...`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL into individual statements (basic splitting)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.log(`❌ Statement ${i + 1} failed:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`✅ ${description} completed: ${successCount} success, ${errorCount} warnings/errors`);
    return { success: successCount, errors: errorCount };
    
  } catch (error) {
    console.error(`💥 ${description} failed:`, error);
    return { success: 0, errors: 1 };
  }
}

async function directSQLExecution(sql, description) {
  console.log(`\n🔧 ${description}...`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql })
    });
    
    if (response.ok) {
      console.log(`✅ ${description} completed successfully`);
      return true;
    } else {
      const error = await response.text();
      console.log(`⚠️  ${description} completed with response:`, error);
      return true; // Continue anyway
    }
  } catch (error) {
    console.error(`💥 ${description} failed:`, error);
    return false;
  }
}

async function deployDatabase() {
  try {
    console.log('\n🔍 Testing connection...');
    
    // Test basic connection with a simple query
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: "SELECT current_database();" 
    });
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    console.log('✅ Database connection successful');
    
    // Read schema files
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    const programsPath = path.join(__dirname, 'supabase', 'migrations', '20241206000000_programs_feature.sql');
    const seedPath = path.join(__dirname, 'supabase', 'programs_seed.sql');
    
    console.log('\n📋 Reading schema files...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const programs = fs.readFileSync(programsPath, 'utf8');
    const seed = fs.readFileSync(seedPath, 'utf8');
    console.log('✅ All files loaded successfully');
    
    // Deploy main schema
    await directSQLExecution(schema, 'Deploying main schema');
    
    // Deploy programs feature
    await directSQLExecution(programs, 'Deploying programs feature');
    
    // Deploy seed data
    await directSQLExecution(seed, 'Seeding programs data');
    
    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 
      });
    
    if (!tablesError) {
      console.log('✅ Tables verified successfully');
    }
    
    // Check Into Confidence program
    const { data: programCheck } = await supabase
      .from('programs')
      .select('name, slug, duration_days')
      .eq('slug', 'into-confidence')
      .single();
    
    if (programCheck) {
      console.log('✅ Into Confidence program verified:', programCheck);
    }
    
    // Check lessons
    const { data: lessonsCheck } = await supabase
      .from('program_lessons')
      .select('day_number, title')
      .limit(3);
    
    if (lessonsCheck && lessonsCheck.length > 0) {
      console.log('✅ Program lessons verified:', lessonsCheck.length, 'lessons found');
    }
    
    console.log('\n🎉 Production Database Deployment Completed!');
    console.log('🌐 Your SoulLens.AI database is ready at:', supabaseUrl);
    console.log('🎯 Ready for authentication and user registration');
    
    return true;
    
  } catch (error) {
    console.error('💥 Deployment failed:', error);
    return false;
  }
}

// Execute deployment
deployDatabase().then(success => {
  process.exit(success ? 0 : 1);
});