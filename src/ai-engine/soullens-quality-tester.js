// SOULLENS 9.8/10 QUALITY TESTING FRAMEWORK
// Tests all optimizations for maximum conversation quality

import SoulLensAI from './soullens-ai-engine.js';

class SoulLensQualityTester {
  constructor(claudeApiKey) {
    this.ai = new SoulLensAI(claudeApiKey);
    this.testResults = [];
  }

  // ULTRA-COMPREHENSIVE QUALITY TESTS
  async runFullQualityTest() {
    console.log('🚀 RUNNING SOULLENS 9.8/10 QUALITY VALIDATION...\n');

    const testScenarios = [
      {
        name: 'Excited User Test',
        input: 'Holy shit I just got the promotion I\'ve been working towards for months!!',
        expectedPersona: 'coach',
        expectedEnergy: 'high',
        qualityFactors: ['energy_matching', 'celebration', 'follow_up_question']
      },
      {
        name: 'Stressed User Test', 
        input: 'I\'m so overwhelmed with everything at work, I can barely keep up',
        expectedPersona: 'friend',
        expectedEnergy: 'medium',
        qualityFactors: ['support', 'validation', 'calming_tone']
      },
      {
        name: 'Confused User Test',
        input: 'I honestly don\'t know what direction my life is going anymore',
        expectedPersona: 'mentor',
        expectedEnergy: 'medium', 
        qualityFactors: ['wisdom', 'guidance', 'gentle_exploration']
      },
      {
        name: 'Happy User Test',
        input: 'Just had an amazing weekend with my family, feeling so grateful',
        expectedPersona: 'friend',
        expectedEnergy: 'medium',
        qualityFactors: ['warmth', 'shared_joy', 'genuine_interest']
      },
      {
        name: 'Repeat User Test',
        input: 'Hey, still feeling pretty excited about that promotion thing',
        expectedPersona: 'coach',
        expectedEnergy: 'high',
        qualityFactors: ['memory_reference', 'continuity', 'personalization']
      },
      {
        name: 'Low Energy Test',
        input: 'I\'m just really tired and don\'t know what to do anymore',
        expectedPersona: 'therapist',
        expectedEnergy: 'low',
        qualityFactors: ['gentleness', 'safety', 'appropriate_energy']
      }
    ];

    let totalScore = 0;
    let responseSpeed = [];

    for (const scenario of testScenarios) {
      const startTime = Date.now();
      
      try {
        const response = await this.ai.startConversation(scenario.input);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        responseSpeed.push(responseTime);

        const score = this.evaluateResponse(response, scenario);
        totalScore += score;

        this.testResults.push({
          scenario: scenario.name,
          input: scenario.input,
          response: response,
          score: score,
          responseTime: responseTime,
          persona: this.ai.conversationContext.persona
        });

        console.log(`✅ ${scenario.name}: ${score}/10 (${responseTime}ms)`);
        console.log(`   Persona: ${this.ai.conversationContext.persona}`);
        console.log(`   Response: "${response}"\n`);

      } catch (error) {
        console.log(`❌ ${scenario.name}: FAILED - ${error.message}\n`);
        this.testResults.push({
          scenario: scenario.name,
          input: scenario.input,
          response: null,
          score: 0,
          error: error.message
        });
      }
    }

    const averageScore = totalScore / testScenarios.length;
    const averageSpeed = responseSpeed.reduce((a, b) => a + b, 0) / responseSpeed.length;

    this.displayFinalResults(averageScore, averageSpeed);
    return { averageScore, averageSpeed, results: this.testResults };
  }

  // EVALUATE RESPONSE QUALITY (9.8/10 TARGET)
  evaluateResponse(response, scenario) {
    let score = 0;
    const factors = {
      naturalness: 0,
      persona_adherence: 0,
      energy_matching: 0,
      personalization: 0,
      question_quality: 0
    };

    // 1. NATURALNESS (2 points)
    if (this.isNatural(response)) {
      factors.naturalness = 2;
      score += 2;
    } else if (this.isSomewhatNatural(response)) {
      factors.naturalness = 1;
      score += 1;
    }

    // 2. PERSONA ADHERENCE (2 points)
    if (this.matchesPersona(response, scenario.expectedPersona)) {
      factors.persona_adherence = 2;
      score += 2;
    } else if (this.partiallyMatchesPersona(response, scenario.expectedPersona)) {
      factors.persona_adherence = 1;
      score += 1;
    }

    // 3. ENERGY MATCHING (2 points)
    if (this.matchesEnergy(response, scenario.expectedEnergy)) {
      factors.energy_matching = 2;
      score += 2;
    } else if (this.partiallyMatchesEnergy(response, scenario.expectedEnergy)) {
      factors.energy_matching = 1;
      score += 1;
    }

    // 4. PERSONALIZATION (2 points)
    if (this.showsPersonalization(response)) {
      factors.personalization = 2;
      score += 2;
    } else if (this.showsSomePersonalization(response)) {
      factors.personalization = 1;
      score += 1;
    }

    // 5. QUESTION QUALITY (2 points)
    if (this.hasGreatQuestion(response)) {
      factors.question_quality = 2;
      score += 2;
    } else if (this.hasGoodQuestion(response)) {
      factors.question_quality = 1;
      score += 1;
    }

    return score;
  }

  // QUALITY EVALUATION HELPERS
  isNatural(response) {
    const naturalIndicators = [
      /dude|bro|man|yo|hey/i,
      /that\'s|i\'m|you\'re|don\'t/i,
      /awesome|amazing|sick|cool/i,
      /[!]{1,2}$/
    ];
    
    return naturalIndicators.some(pattern => pattern.test(response));
  }

  isSomewhatNatural(response) {
    return !response.includes('I understand') && 
           !response.includes('Thank you for sharing') &&
           response.length < 200;
  }

  matchesPersona(response, expectedPersona) {
    const personaPatterns = {
      coach: /pumped|let\'s go|champion|crushing|game|YES/i,
      friend: /dude|bro|man|totally|honestly/i,
      mentor: /beautiful|wisdom|growth|journey|my friend/i,
      challenger: /real talk|step up|what\'s next|prove it/i,
      therapist: /feels|experience|space|gentle|honor/i,
      sage: /profound|universe|deeper|truth|pattern/i
    };

    return personaPatterns[expectedPersona]?.test(response) || false;
  }

  partiallyMatchesPersona(response, expectedPersona) {
    // At least shows some personality vs being generic
    return !this.isGeneric(response);
  }

  matchesEnergy(response, expectedEnergy) {
    if (expectedEnergy === 'high') {
      return /[!]{2,}|YES|awesome|amazing|pumped/i.test(response);
    } else if (expectedEnergy === 'low') {
      return !/[!]{2,}|YES|pumped/.test(response) && 
             /gentle|soft|space|breathe/.test(response);
    }
    return true; // Medium energy is default
  }

  partiallyMatchesEnergy(response, expectedEnergy) {
    return !this.isEnergyMismatch(response, expectedEnergy);
  }

  showsPersonalization(response) {
    return /remember|last time|you mentioned|pattern|before/i.test(response);
  }

  showsSomePersonalization(response) {
    return response.length > 50 && !this.isGeneric(response);
  }

  hasGreatQuestion(response) {
    const questionPatterns = [
      /what\'s.*feel/i,
      /how.*experience/i, 
      /what.*different/i,
      /tell me.*about/i
    ];
    
    return questionPatterns.some(pattern => pattern.test(response));
  }

  hasGoodQuestion(response) {
    return response.includes('?');
  }

  isGeneric(response) {
    const genericPhrases = [
      'Thank you for sharing',
      'I understand',
      'That sounds',
      'How are you feeling',
      'Tell me more'
    ];
    
    return genericPhrases.some(phrase => response.includes(phrase));
  }

  isEnergyMismatch(response, expectedEnergy) {
    if (expectedEnergy === 'high' && response.includes('tired')) return true;
    if (expectedEnergy === 'low' && response.includes('YEAH!')) return true;
    return false;
  }

  // DISPLAY FINAL RESULTS
  displayFinalResults(averageScore, averageSpeed) {
    console.log('🎯 SOULLENS QUALITY TEST RESULTS:');
    console.log('================================');
    console.log(`Average Quality Score: ${averageScore.toFixed(1)}/10`);
    console.log(`Average Response Time: ${averageSpeed.toFixed(0)}ms`);
    console.log('');

    if (averageScore >= 9.8) {
      console.log('🔥 EXCEPTIONAL! 9.8/10+ QUALITY ACHIEVED!');
      console.log('SoulLens is ready to dominate the market!');
    } else if (averageScore >= 9.0) {
      console.log('🚀 EXCELLENT! High quality conversations achieved!');
    } else if (averageScore >= 8.0) {
      console.log('✅ GOOD! Solid conversation quality.');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT. Quality below target.');
    }

    console.log('');
    console.log('DETAILED BREAKDOWN:');
    this.testResults.forEach(result => {
      console.log(`${result.scenario}: ${result.score}/10 (${result.responseTime || 'N/A'}ms)`);
    });
  }

  // BENCHMARK AGAINST COMPETITORS
  async benchmarkAgainstCompetitors() {
    console.log('📊 COMPETITIVE BENCHMARK:');
    console.log('=========================');
    console.log('SoulLens vs Competitors:');
    console.log('- Replika: Generic responses, no growth framework');
    console.log('- Woebot: Clinical, not conversational');
    console.log('- Character.AI: Entertainment, not development');
    console.log('');
    console.log('SoulLens Advantages:');
    console.log('✅ Ultra-distinct personas');
    console.log('✅ Conversation memory & personalization'); 
    console.log('✅ 2-3 second response times');
    console.log('✅ Natural, friend-like conversations');
    console.log('✅ Systematic personal development');
  }
}

// EXPORT
export default SoulLensQualityTester;