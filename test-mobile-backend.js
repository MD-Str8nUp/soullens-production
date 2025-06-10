// TEST SOULLENS MOBILE BACKEND DEPLOYMENT
// Run this to verify your $50M infrastructure works

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// TEST 1: Check trial status function (CRITICAL for mobile app)
async function testTrialStatus() {
  console.log('🔍 Testing trial status function...')
  
  const { data, error } = await supabase.rpc('check_trial_status')
  
  if (error) {
    console.error('❌ Trial status error:', error)
  } else {
    console.log('✅ Trial status works:', data)
    // Should return: { is_trial_active, days_remaining, can_send_message, trial_limits }
  }
}

// TEST 2: Test mobile usage tracking
async function testUsageTracking() {
  console.log('🔍 Testing mobile usage tracking...')
  
  const { error } = await supabase.rpc('track_mobile_usage', {
    p_event_type: 'app_opened',
    p_platform: 'web',
    p_app_version: '1.0.0',
    p_event_data: { test: 'deployment_verification' }
  })
  
  if (error) {
    console.error('❌ Usage tracking error:', error)
  } else {
    console.log('✅ Usage tracking works!')
  }
}

// TEST 3: Test dashboard data
async function testDashboard() {
  console.log('🔍 Testing mobile dashboard...')
  
  const { data, error } = await supabase.rpc('get_mobile_dashboard')
  
  if (error) {
    console.error('❌ Dashboard error:', error)
  } else {
    console.log('✅ Dashboard works:', data)
  }
}

// TEST 4: Test database tables
async function testTables() {
  console.log('🔍 Testing database tables...')
  
  // Test users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('count')
    .limit(1)
  
  if (usersError) {
    console.error('❌ Users table error:', usersError)
  } else {
    console.log('✅ Users table works')
  }
  
  // Test conversations table
  const { data: conversations, error: convoError } = await supabase
    .from('conversations')
    .select('count')
    .limit(1)
  
  if (convoError) {
    console.error('❌ Conversations table error:', convoError)
  } else {
    console.log('✅ Conversations table works')
  }
}

// RUN ALL TESTS
export async function testMobileBackend() {
  console.log('🚀 TESTING SOULLENS MOBILE BACKEND DEPLOYMENT')
  console.log('=' .repeat(50))
  
  await testTables()
  await testTrialStatus()
  await testUsageTracking()
  await testDashboard()
  
  console.log('=' .repeat(50))
  console.log('🎉 MOBILE BACKEND TESTING COMPLETE!')
  console.log('💰 Ready for $50M mobile platform!')
}

// For browser testing
if (typeof window !== 'undefined') {
  window.testMobileBackend = testMobileBackend
}
