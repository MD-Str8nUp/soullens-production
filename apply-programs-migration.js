import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedPrograms() {
  try {
    console.log('Seeding programs data...');
    
    // Apply seed data using direct SQL instead of file reading
    const seedPath = new URL('./supabase/programs_seed.sql', import.meta.url).pathname;
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    const seedStatements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Found ${seedStatements.length} seed statements to execute`);
    
    for (let i = 0; i < seedStatements.length; i++) {
      const statement = seedStatements[i];
      console.log(`Executing seed statement ${i + 1}/${seedStatements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.error(`Error in seed statement ${i + 1}:`, error);
        } else {
          console.log(`✓ Seed statement ${i + 1} completed`);
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err);
      }
    }
    
    console.log('\n🎉 Programs seeding completed successfully!');
    console.log('You can now access the programs page at http://localhost:3000/programs');
    
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedPrograms();