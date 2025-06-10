import SoulLensAI from '../src/ai-engine/soullens-ai-engine.js';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌟 Welcome to SoulLens AI - Interactive Testing');
console.log('📱 Tagline: "See yourself clearly through intelligent questioning"');
console.log('🤖 Available personas: mentor, coach, friend, challenger, therapist, sage');
console.log('💬 Commands:');
console.log('   "persona [name]" - change AI personality');
console.log('   "profanity on/off" - toggle swearing');
console.log('   "style [casual/professional/friendly]" - set conversation style');
console.log('   "insights" - view your profile');
console.log('   "exit" - quit\n');

if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'your_claude_api_key_here') {
  console.log('❌ Error: Please add your Claude API key to the .env file');
  console.log('Get your API key from: https://console.anthropic.com');
  rl.close();
  process.exit(1);
}

const ai = new SoulLensAI(process.env.CLAUDE_API_KEY);

console.log('🎯 Current persona: mentor');
console.log('💭 Try sharing something about your day, feelings, or challenges...\n');

function askUser() {
  rl.question('You: ', async (input) => {
    const trimmedInput = input.trim();
    
    // Handle exit command
    if (trimmedInput.toLowerCase() === 'exit') {
      console.log('\n📊 Your SoulLens Session Summary:');
      const insights = ai.getUserInsights();
      console.log(`   • Total conversations: ${insights.profile.conversationHistory.length}`);
      console.log(`   • Engagement level: ${insights.profile.engagementLevel}`);
      console.log(`   • Emotional patterns tracked: ${insights.profile.emotionalPatterns.length}`);
      console.log(`   • Personal triggers identified: ${insights.profile.triggers.length}`);
      console.log(`   • Insights generated: ${insights.profile.insights.length}`);
      
      if (insights.profile.conversationHistory.length > 0) {
        console.log('\n🎯 Recent emotional states:');
        const recentEmotions = insights.profile.emotionalPatterns
          .slice(-3)
          .map(ep => `     - ${ep.state} (${new Date(ep.timestamp).toLocaleTimeString()})`)
          .join('\n');
        console.log(recentEmotions);
      }
      
      console.log('\n🌟 Thank you for testing SoulLens! Your data helps us improve the experience.');
      rl.close();
      return;
    }
    
    // Handle persona change command
    if (trimmedInput.toLowerCase().startsWith('persona ')) {
      const newPersona = trimmedInput.split(' ')[1];
      const response = ai.changePersona(newPersona);
      console.log(`🤖 SoulLens: ${response}\n`);
      askUser();
      return;
    }
    
    // Handle profanity toggle command
    if (trimmedInput.toLowerCase().startsWith('profanity ')) {
      const setting = trimmedInput.split(' ')[1];
      let allow = null;
      if (setting === 'on') allow = true;
      if (setting === 'off') allow = false;
      const response = ai.toggleProfanity(allow);
      console.log(`🤖 SoulLens: ${response}\n`);
      askUser();
      return;
    }
    
    // Handle style change command
    if (trimmedInput.toLowerCase().startsWith('style ')) {
      const newStyle = trimmedInput.split(' ')[1];
      const response = ai.setStyle(newStyle);
      console.log(`🤖 SoulLens: ${response}\n`);
      askUser();
      return;
    }
    
    // Handle insights command
    if (trimmedInput.toLowerCase() === 'insights') {
      console.log('\n📊 Your SoulLens Profile:');
      const insights = ai.getUserInsights();
      
      console.log(`   🎯 Engagement Level: ${insights.profile.engagementLevel}`);
      console.log(`   💭 Total Conversations: ${insights.profile.conversationHistory.length}`);
      console.log(`   😊 Current Mood: ${insights.profile.currentMood || 'Not set'}`);
      
      if (insights.profile.emotionalPatterns.length > 0) {
        const emotions = {};
        insights.profile.emotionalPatterns.forEach(ep => {
          emotions[ep.state] = (emotions[ep.state] || 0) + 1;
        });
        const topEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
        console.log(`   🎭 Most Common Emotion: ${topEmotion} (${emotions[topEmotion]} times)`);
      }
      
      if (insights.profile.triggers.length > 0) {
        console.log(`   ⚡ Triggers Identified: ${insights.profile.triggers.length}`);
        const topTrigger = insights.profile.triggers
          .sort((a, b) => b.frequency - a.frequency)[0];
        console.log(`   🎯 Most Frequent Trigger: ${topTrigger.trigger} (${topTrigger.frequency} times)`);
      }
      
      if (insights.recommendations.length > 0) {
        console.log(`   💡 AI Recommendations:`);
        insights.recommendations.forEach(rec => {
          console.log(`     - ${rec}`);
        });
      }
      
      console.log('');
      askUser();
      return;
    }
    
    // Handle empty input
    if (!trimmedInput) {
      console.log('🤖 SoulLens: I\'m here when you\'re ready to share. What\'s on your mind?\n');
      askUser();
      return;
    }
    
    // Process conversation
    try {
      const startTime = Date.now();
      const response = await ai.startConversation(trimmedInput);
      const responseTime = Date.now() - startTime;
      
      console.log(`🤖 SoulLens: ${response}`);
      console.log(`⏱️  (${responseTime}ms)\n`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('🔄 Please try again or type "exit" to quit.\n');
    }
    
    askUser();
  });
}

// Start the conversation
askUser();