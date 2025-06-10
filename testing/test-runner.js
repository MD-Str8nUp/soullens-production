import SoulLensAI from '../src/ai-engine/soullens-ai-engine.js';
import dotenv from 'dotenv';

dotenv.config();

// Test Scenarios for SoulLens AI
const testScenarios = [
  {
    name: "First Time User - Work Stress",
    input: "I've been really stressed lately with work and don't know what to do",
    sessionType: "check_in"
  },
  {
    name: "Returning User - Promotion Excitement", 
    input: "I got that promotion I was hoping for! I'm so excited but also nervous about the new responsibilities.",
    sessionType: "check_in"
  },
  {
    name: "Deep User - Relationship Pattern",
    input: "My partner and I had another fight about the same thing. I feel like we're stuck in this cycle and I don't know how to break it.",
    sessionType: "deep_reflection"
  },
  {
    name: "Casual Check-in",
    input: "Hey, just checking in. Had an okay day, nothing too exciting happening.",
    sessionType: "check_in"
  },
  {
    name: "Breakthrough Moment",
    input: "I just realized something important about myself - I think I've been afraid of success because part of me doesn't believe I deserve good things.",
    sessionType: "breakthrough"
  },
  {
    name: "Family Dynamics",
    input: "Family dinner was rough again. My mom made her usual comments about my life choices and I just shut down. I hate that I still react this way.",
    sessionType: "family_work"
  }
];

async function runSoulLensTests() {
  console.log('🌟 Starting SoulLens AI Conversation Tests...\n');
  console.log('Testing tagline: "See yourself clearly through intelligent questioning"\n');
  console.log('─'.repeat(80) + '\n');
  
  if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'your_claude_api_key_here') {
    console.log('❌ Error: Please add your Claude API key to the .env file');
    console.log('Get your API key from: https://console.anthropic.com\n');
    return;
  }
  
  const ai = new SoulLensAI(process.env.CLAUDE_API_KEY);
  let totalScore = 0;
  let successfulTests = 0;
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`📋 Test ${i + 1}: ${scenario.name}`);
    console.log(`👤 User: "${scenario.input}"`);
    
    try {
      const startTime = Date.now();
      const response = await ai.startConversation(scenario.input, scenario.sessionType);
      const responseTime = Date.now() - startTime;
      
      console.log(`🤖 SoulLens: "${response}"`);
      console.log(`⏱️  Response time: ${responseTime}ms`);
      
      // Evaluate response quality
      const quality = evaluateResponse(response, scenario);
      console.log(`📊 Quality Score: ${quality.score}/10`);
      console.log(`💡 Feedback: ${quality.feedback}`);
      
      totalScore += quality.score;
      successfulTests++;
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(80) + '\n');
  }
  
  // Print summary
  const avgScore = totalScore / successfulTests;
  console.log('🎯 SOULLENS AI TEST SUMMARY');
  console.log('═'.repeat(50));
  console.log(`📊 Average Quality Score: ${avgScore.toFixed(1)}/10`);
  console.log(`✅ Successful Tests: ${successfulTests}/${testScenarios.length}`);
  console.log(`🧠 Total Conversations: ${ai.userProfile.conversationHistory.length}`);
  console.log(`📈 Engagement Level: ${ai.userProfile.engagementLevel}`);
  
  if (avgScore >= 8.5) {
    console.log('\n🏆 EXCELLENT - SoulLens is ready for user testing!');
    console.log('   • Conversations feel genuinely personalized');
    console.log('   • Strong emotional intelligence and insight');
    console.log('   • Users will likely return for more sessions');
  } else if (avgScore >= 7) {
    console.log('\n🎯 GOOD - Strong foundation with room for improvement');
    console.log('   • Core functionality working well');
    console.log('   • Some areas need refinement before user testing');
  } else if (avgScore >= 5) {
    console.log('\n⚠️  NEEDS WORK - Core issues to address');
    console.log('   • Basic functionality present but needs improvement');
    console.log('   • Focus on personalization and emotional intelligence');
  } else {
    console.log('\n🔧 MAJOR ISSUES - Requires significant debugging');
    console.log('   • Core conversation logic needs revision');
    console.log('   • Review AI prompts and response generation');
  }
  
  // Show final user profile
  console.log('\n👤 USER PROFILE DEVELOPMENT:');
  console.log(`   • Emotional patterns: ${ai.userProfile.emotionalPatterns.length}`);
  console.log(`   • Triggers identified: ${ai.userProfile.triggers.length}`);
  console.log(`   • Insights generated: ${ai.userProfile.insights.length}`);
  
  console.log('\n🎯 NEXT STEPS:');
  if (avgScore >= 8) {
    console.log('   1. Test with real users for feedback');
    console.log('   2. Set up Supabase database');
    console.log('   3. Build React frontend');
    console.log('   4. Deploy to SoulLens.ai');
  } else {
    console.log('   1. Improve AI conversation prompts');
    console.log('   2. Enhance personalization logic');
    console.log('   3. Re-test until quality score > 8');
    console.log('   4. Then proceed with full development');
  }
  
  console.log('\n' + '═'.repeat(50));
}

function evaluateResponse(response, scenario) {
  let score = 0;
  let feedback = [];
  
  // Check for personal acknowledgment
  if (response.includes('I') || response.includes('you')) {
    score += 2;
    feedback.push('✓ Personal connection');
  } else {
    feedback.push('✗ Lacks personal touch');
  }
  
  // Check for follow-up questions
  if (response.includes('?')) {
    score += 3;
    feedback.push('✓ Engaging question');
  } else {
    feedback.push('✗ Missing question');
  }
  
  // Check response length
  if (response.length > 75 && response.length < 400) {
    score += 2;
    feedback.push('✓ Good length');
  } else {
    feedback.push('◐ Length needs work');
  }
  
  // Check for emotional intelligence
  const emotionalWords = ['feel', 'understand', 'sense', 'notice', 'experience', 'hear'];
  if (emotionalWords.some(word => response.toLowerCase().includes(word))) {
    score += 2;
    feedback.push('✓ Emotionally aware');
  } else {
    feedback.push('✗ Needs emotional intelligence');
  }
  
  // Check for personalization attempts
  if (response.includes('based on') || response.includes('pattern') || response.includes('notice')) {
    score += 1;
    feedback.push('✓ Personalized');
  }
  
  return {
    score: score,
    feedback: feedback.join(', ')
  };
}

runSoulLensTests().catch(console.error);