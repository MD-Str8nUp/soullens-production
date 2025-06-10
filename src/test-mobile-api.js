// Quick test script for Mobile API
// Run with: node src/test-mobile-api.js

const testMobileAPI = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Testing SoulLens Mobile API...\n')
  
  // Test data
  const testUserId = 'test-user-123'
  
  try {
    // Test 1: Trial Status Check
    console.log('1️⃣ Testing Trial Status...')
    const trialResponse = await fetch(
      `${baseUrl}/api/mobile?action=trial-status&userId=${testUserId}`
    )
    const trialData = await trialResponse.json()
    console.log('✅ Trial Status:', trialData)
    console.log('')
    
    // Test 2: Event Tracking
    console.log('2️⃣ Testing Event Tracking...')
    const eventResponse = await fetch(`${baseUrl}/api/mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'track-event',
        userId: testUserId,
        eventType: 'app_opened',
        platform: 'web',
        appVersion: '1.0.0',
        eventData: { test: true }
      })
    })
    const eventData = await eventResponse.json()
    console.log('✅ Event Tracking:', eventData)
    console.log('')
    
    // Test 3: Dashboard Data
    console.log('3️⃣ Testing Dashboard Data...')
    const dashboardResponse = await fetch(
      `${baseUrl}/api/mobile?action=dashboard&userId=${testUserId}`
    )
    const dashboardData = await dashboardResponse.json()
    console.log('✅ Dashboard Data:', dashboardData)
    console.log('')
    
    console.log('🎉 All mobile API tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure to:')
    console.log('   1. Deploy the database migrations first')
    console.log('   2. Run "npm run dev" to start the server')
    console.log('   3. Have valid user data in the database')
  }
}

// Note: This will show errors until the database is migrated
// It's a placeholder to demonstrate the API structure
console.log('📱 SoulLens Mobile API Test Suite')
console.log('⚠️  Deploy database migrations before running this test')
console.log('📖 See: supabase/MOBILE_DEPLOYMENT_GUIDE.md\n')

// Uncomment to run the test:
// testMobileAPI()

export default testMobileAPI