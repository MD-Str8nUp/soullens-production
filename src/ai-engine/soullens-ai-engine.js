// SOULLENS AI CONVERSATION ENGINE - 9.8/10 QUALITY VERSION
// Core conversation logic with Claude API integration
import { ULTRA_PERSONAS, PersonaSelector } from './soullens-ultra-personas.js';
import { ConversationMemory, EmotionalIntelligence } from './soullens-memory-system.js';
import { PerformanceOptimizer, FastEmotionalAnalysis } from './soullens-performance.js';

class SoulLensAI {
  constructor(claudeApiKey) {
    this.claudeApiKey = claudeApiKey || process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'; // Claude 3.5 Sonnet for production
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1500; // Cost optimized
    this.conversationMemory = null; // Will be initialized after userProfile
    
    // User profile structure
    this.userProfile = {
      basicInfo: {},
      preferences: {
        allowProfanity: false, // User can toggle this
        conversationStyle: 'casual' // casual, professional, friendly
      },
      emotionalPatterns: [],
      triggers: [],
      goals: [],
      relationships: {},
      beliefs: [],
      strengths: [],
      growthAreas: [],
      conversationHistory: [],
      insights: [],
      currentMood: null,
      engagementLevel: 'new', // new, developing, deep, mastery
      journalEntries: [], // Add journal entries to user profile
      journalInsights: {
        recentMoods: [],
        commonThemes: [],
        currentChallenges: [],
        strengths: [],
        moodTrend: 'stable',
        lastJournalDate: null,
        journalingFrequency: 'new'
      },
      programProgress: {
        currentPrograms: [], // Active program enrollments
        completedPrograms: [],
        currentDayLessons: [],
        recentMilestones: [],
        totalDaysCompleted: 0,
        longestStreak: 0,
        programInsights: {
          strongestAreas: [],
          challengingAreas: [],
          preferredLearningStyle: null,
          engagementPatterns: []
        }
      },
      sessionTracking: {
        currentSessionId: null,
        journalingSuggestedThisSession: false,
        lastJournalSuggestion: null,
        sessionsWithoutJournalSuggestion: 0
      }
    };
    
    // Initialize conversation memory system
    this.conversationMemory = new ConversationMemory(this.userProfile);
    
    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer();
    
    // Conversation context
    this.conversationContext = {
      sessionGoal: null,
      currentTopic: null,
      questionDepth: 1,
      persona: 'mentor', // mentor, coach, friend, challenger, therapist, sage
      followUpNeeded: false
    };
  }

  // SESSION MANAGEMENT
  generateSessionId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  initializeNewSession() {
    this.userProfile.sessionTracking.currentSessionId = this.generateSessionId();
    this.userProfile.sessionTracking.journalingSuggestedThisSession = false;
  }

  shouldSuggestJournaling() {
    const { journalingSuggestedThisSession, sessionsWithoutJournalSuggestion } = this.userProfile.sessionTracking;
    
    // Only suggest journaling once per session and not every session
    if (journalingSuggestedThisSession) {
      return false;
    }
    
    // Only suggest journaling every 3-4 sessions to avoid being pushy
    return sessionsWithoutJournalSuggestion >= 3;
  }

  markJournalingSuggested() {
    this.userProfile.sessionTracking.journalingSuggestedThisSession = true;
    this.userProfile.sessionTracking.lastJournalSuggestion = Date.now();
    this.userProfile.sessionTracking.sessionsWithoutJournalSuggestion = 0;
  }

  // PROGRAM INTEGRATION METHODS
  updateProgramProgress(programData) {
    if (!programData) return;

    // Update current programs
    this.userProfile.programProgress.currentPrograms = programData.currentPrograms || [];
    this.userProfile.programProgress.completedPrograms = programData.completedPrograms || [];
    this.userProfile.programProgress.currentDayLessons = programData.currentDayLessons || [];
    this.userProfile.programProgress.recentMilestones = programData.recentMilestones || [];
    this.userProfile.programProgress.totalDaysCompleted = programData.totalDaysCompleted || 0;
    this.userProfile.programProgress.longestStreak = programData.longestStreak || 0;

    // Update program insights
    if (programData.insights) {
      this.userProfile.programProgress.programInsights = {
        ...this.userProfile.programProgress.programInsights,
        ...programData.insights
      };
    }
  }

  getProgramContext() {
    const programs = this.userProfile.programProgress;
    if (!programs.currentPrograms.length) return null;

    return {
      activePrograms: programs.currentPrograms.map(p => ({
        name: p.name,
        currentDay: p.current_day,
        streak: p.streak_count,
        progress: p.completion_percentage
      })),
      recentLessons: programs.currentDayLessons,
      milestones: programs.recentMilestones,
      totalProgress: {
        daysCompleted: programs.totalDaysCompleted,
        longestStreak: programs.longestStreak
      }
    };
  }

  shouldMentionPrograms() {
    const programs = this.userProfile.programProgress;
    
    // Mention programs if user has active programs and recent activity
    if (programs.currentPrograms.length > 0) {
      // Check if user completed a lesson recently (within 24 hours)
      const recentActivity = programs.currentDayLessons.some(lesson => {
        const completedDate = new Date(lesson.completed_date);
        const now = new Date();
        const hoursDiff = (now - completedDate) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      });

      return recentActivity || programs.recentMilestones.length > 0;
    }

    return false;
  }

  generateProgramPrompt(programContext, userInput) {
    let prompt = "PROGRAM CONTEXT - Reference naturally when relevant:\n";
    
    if (programContext.activePrograms.length > 0) {
      prompt += "Active Programs:\n";
      programContext.activePrograms.forEach(program => {
        prompt += `- ${program.name}: Day ${program.currentDay}, ${program.progress}% complete`;
        if (program.streak > 0) {
          prompt += `, ${program.streak} day streak`;
        }
        prompt += "\n";
      });
    }

    if (programContext.recentLessons.length > 0) {
      prompt += "\nRecent Lesson Activity:\n";
      programContext.recentLessons.forEach(lesson => {
        prompt += `- Completed: ${lesson.title}\n`;
      });
    }

    if (programContext.milestones.length > 0) {
      prompt += "\nRecent Milestones:\n";
      programContext.milestones.forEach(milestone => {
        prompt += `- ${milestone.milestone_type}: ${milestone.milestone_data}\n`;
      });
    }

    if (programContext.totalProgress.daysCompleted > 0) {
      prompt += `\nOverall Progress: ${programContext.totalProgress.daysCompleted} total days completed`;
      if (programContext.totalProgress.longestStreak > 0) {
        prompt += `, longest streak: ${programContext.totalProgress.longestStreak} days`;
      }
      prompt += "\n";
    }

    prompt += "\nNaturally celebrate progress, encourage consistency, and connect program learnings to their current concerns when appropriate.";
    
    return prompt;
  }

  // MAIN CONVERSATION FLOW
  async startConversation(userInput, sessionType = 'check_in') {
    try {
      // 1. Analyze user input for emotional state and context
      const userAnalysis = await this.analyzeUserInput(userInput);
      
      // 2. Update user profile with new insights
      this.updateUserProfile(userAnalysis);
      
      // 3. Determine conversation strategy
      const strategy = this.determineConversationStrategy(sessionType, userAnalysis);
      
      // 4. Generate appropriate response
      const response = await this.generateResponse(strategy, userInput, userAnalysis);
      
      // 5. Log conversation for learning
      this.logConversation(userInput, response, userAnalysis);
      
      // Return structured response object
      return {
        message: response,
        analysis: userAnalysis,
        strategy: strategy,
        insights: {
          topics: userAnalysis.topics,
          needs: userAnalysis.needs,
          engagement_level: this.userProfile.engagementLevel
        }
      };
      
    } catch (error) {
      console.error('Conversation error:', error);
      return {
        message: this.getFallbackResponse(),
        analysis: { emotional_state: 'neutral', energy_level: 'medium' },
        strategy: { persona: 'mentor', approach: 'supportive' },
        insights: {}
      };
    }
  }

  // ANALYZE USER INPUT FOR EMOTIONAL STATE AND PATTERNS (ULTRA-FAST)
  async analyzeUserInput(userInput) {
    // Use fast emotional analysis for speed
    const emotionalState = FastEmotionalAnalysis.quickAnalyze(userInput);
    const energyLevel = FastEmotionalAnalysis.quickEnergyLevel(userInput);
    
    // Simple topic extraction (faster than AI)
    const topics = this.extractTopicsQuickly(userInput);
    
    // Only use AI for complex analysis if needed
    const needs = this.determineNeedsQuickly(emotionalState, energyLevel);
    
    return {
      emotionalState,
      energyLevel,
      topics,
      needs
    };
  }

  // UPDATE USER PROFILE WITH NEW INSIGHTS
  updateUserProfile(analysis) {
    if (!analysis) return;
    
    // Update emotional patterns
    if (analysis.emotionalState) {
      this.userProfile.emotionalPatterns.push({
        state: analysis.emotionalState,
        timestamp: new Date().toISOString(),
        context: analysis.topics || []
      });
      
      // Keep only last 50 emotional patterns for performance
      if (this.userProfile.emotionalPatterns.length > 50) {
        this.userProfile.emotionalPatterns = this.userProfile.emotionalPatterns.slice(-50);
      }
    }
    
    // Update current state
    this.userProfile.currentMood = analysis.emotionalState;
    
    // Update engagement level
    this.updateEngagementLevel();
  }

  // DETERMINE CONVERSATION STRATEGY (ULTRA-SMART PERSONA SELECTION)
  determineConversationStrategy(sessionType, userAnalysis) {
    let strategy = {
      approach: 'conversational',
      persona: this.conversationContext.persona,
      depth: 1
    };
    
    // Use ultra-smart persona selection
    if (userAnalysis.emotionalState) {
      strategy.persona = PersonaSelector.selectPersona(
        userAnalysis.emotionalState,
        userAnalysis.energyLevel || 'medium',
        { sessionType }
      );
    }
    
    // Update context for consistency
    this.conversationContext.persona = strategy.persona;
    
    return strategy;
  }

  // GENERATE ULTRA-PERSONALIZED RESPONSE (9.8/10 QUALITY)
  async generateResponse(strategy, userInput, userAnalysis) {
    const profanityAllowed = this.userProfile.preferences.allowProfanity;
    
    // Get conversation memory context
    const memoryContext = this.conversationMemory.getRelevantContext(userInput, userAnalysis.emotionalState);
    
    // Get program context if relevant
    const programContext = this.getProgramContext();
    const shouldMentionPrograms = this.shouldMentionPrograms();
    
    // Get ultra-detailed persona prompt
    const userState = {
      emotion: userAnalysis.emotionalState || 'neutral',
      energy: userAnalysis.energyLevel || 'medium'
    };
    
    const personaPrompt = PersonaSelector.getPersonaPrompt(
      strategy.persona, 
      userInput, 
      userState, 
      profanityAllowed
    );
    
    if (!personaPrompt) {
      return await this.callClaude(`Respond naturally to: "${userInput}"`, { maxTokens: 150 });
    }

    // Check cache first for speed
    const cacheKey = `${strategy.persona}_${userInput}_${userState.emotion}`;
    const cached = this.performanceOptimizer.getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Optimize prompt for speed
    const optimizedPersonaPrompt = this.performanceOptimizer.optimizePrompt(personaPrompt);
    const optimizedMemoryContext = this.performanceOptimizer.optimizePrompt(memoryContext);
    
    // Combine persona prompt with memory context and program context for ultimate personalization
    let enhancedPrompt = `${optimizedPersonaPrompt}

${optimizedMemoryContext}`;

    // Add program context if relevant
    if (shouldMentionPrograms && programContext) {
      const programPrompt = this.generateProgramPrompt(programContext, userInput);
      enhancedPrompt += `\n\n${programPrompt}`;
    }

    enhancedPrompt += '\n\nUse all context to make response personally relevant and naturally reference their growth journey when appropriate!';

    // Calculate optimal tokens for speed
    const optimalTokens = this.performanceOptimizer.calculateOptimalTokens(enhancedPrompt.length, 'standard');
    
    const response = await this.callClaude(enhancedPrompt, { maxTokens: optimalTokens });
    
    // Cache successful response
    this.performanceOptimizer.cacheResponse(cacheKey, response);
    
    return response;
  }

  // LOG CONVERSATION FOR LEARNING
  logConversation(userInput, aiResponse, analysis) {
    this.userProfile.conversationHistory.push({
      timestamp: new Date().toISOString(),
      userInput: userInput,
      aiResponse: aiResponse,
      emotionalState: analysis?.emotionalState,
      topics: analysis?.topics || [],
      strategy: this.conversationContext
    });
    
    // Keep last 50 conversations for performance
    if (this.userProfile.conversationHistory.length > 50) {
      this.userProfile.conversationHistory = this.userProfile.conversationHistory.slice(-50);
    }
  }

  // UPDATE ENGAGEMENT LEVEL
  updateEngagementLevel() {
    const convCount = this.userProfile.conversationHistory.length;
    
    if (convCount < 3) {
      this.userProfile.engagementLevel = 'new';
    } else if (convCount < 10) {
      this.userProfile.engagementLevel = 'developing';
    } else {
      this.userProfile.engagementLevel = 'deep';
    }
  }

  // CLAUDE API CALL
  async callClaude(prompt, options = {}) {
    try {
      // Always use direct API call (no recursion)
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: options.maxTokens || 300,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Claude API HTTP Error:', response.status, data);
        throw new Error(`Claude API HTTP ${response.status}: ${data.error?.message || 'Unknown error'}`);
      }
      
      if (data.content && data.content[0] && data.content[0].text) {
        const text = data.content[0].text.trim();
        
        // Try to parse as JSON if it looks like JSON
        if (text.startsWith('{') && text.endsWith('}')) {
          try {
            return JSON.parse(text);
          } catch (e) {
            return text;
          }
        }
        
        return text;
      }
      
      console.error('Invalid Claude API response structure:', data);
      throw new Error('Invalid response from Claude API');
      
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  // FALLBACK RESPONSE
  getFallbackResponse() {
    const fallbacks = [
      "Yo, what's going on?",
      "Tell me more about that!",
      "That sounds interesting, what's up?",
      "I'm listening, bro!"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // CHANGE AI PERSONA
  changePersona(newPersona) {
    const validPersonas = ['mentor', 'coach', 'friend', 'challenger', 'therapist', 'sage'];
    if (validPersonas.includes(newPersona)) {
      this.conversationContext.persona = newPersona;
      return `Switched to ${newPersona} mode! What's up?`;
    }
    return "Try: mentor, coach, friend, challenger, therapist, or sage";
  }

  // TOGGLE PROFANITY SETTING
  toggleProfanity(allow = null) {
    if (allow === null) {
      this.userProfile.preferences.allowProfanity = !this.userProfile.preferences.allowProfanity;
    } else {
      this.userProfile.preferences.allowProfanity = allow;
    }
    
    const status = this.userProfile.preferences.allowProfanity ? 'ON' : 'OFF';
    return `Profanity is now ${status}. ${this.userProfile.preferences.allowProfanity ? 'I can swear for emphasis!' : 'Keeping it clean!'}`;
  }

  // SET CONVERSATION STYLE
  setStyle(style) {
    const validStyles = ['casual', 'professional', 'friendly'];
    if (validStyles.includes(style)) {
      this.userProfile.preferences.conversationStyle = style;
      return `Conversation style set to ${style}!`;
    }
    return "Try: casual, professional, or friendly";
  }

  // GET USER INSIGHTS SUMMARY
  getUserInsights() {
    return {
      profile: this.userProfile,
      patterns: this.identifyPatterns(),
      recommendations: []
    };
  }

  // IDENTIFY PATTERNS FROM USER HISTORY
  identifyPatterns() {
    const patterns = {
      emotional: {},
      topical: {}
    };
    
    // Emotional patterns
    this.userProfile.emotionalPatterns.forEach(ep => {
      patterns.emotional[ep.state] = (patterns.emotional[ep.state] || 0) + 1;
    });
    
    return patterns;
  }

  // FAST TOPIC EXTRACTION (NO AI NEEDED)
  extractTopicsQuickly(userInput) {
    const topicKeywords = {
      work: ['work', 'job', 'career', 'boss', 'office', 'meeting'],
      relationships: ['girlfriend', 'boyfriend', 'partner', 'family', 'friend'],
      health: ['tired', 'sick', 'workout', 'exercise', 'sleep'],
      goals: ['goal', 'dream', 'want to', 'planning', 'future'],
      emotions: ['feeling', 'feel', 'emotion', 'mood', 'happy', 'sad']
    };

    const input = userInput.toLowerCase();
    const topics = [];

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => input.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics.length > 0 ? topics : ['general'];
  }

  // FAST NEEDS DETERMINATION
  determineNeedsQuickly(emotionalState, energyLevel) {
    const needsMap = {
      excited: ['hype', 'celebration', 'encouragement'],
      stressed: ['support', 'calming', 'guidance'],
      confused: ['clarity', 'direction', 'perspective'],
      sad: ['comfort', 'understanding', 'support'],
      angry: ['validation', 'calming', 'perspective'],
      happy: ['celebration', 'sharing', 'encouragement']
    };

    return needsMap[emotionalState] || ['support', 'understanding'];
  }

  // JOURNAL INTEGRATION METHODS
  async updateJournalInsights() {
    // Simplified journal insights - no API call needed
    const entries = this.userProfile.journalEntries || [];
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const daysSinceLastEntry = Math.floor((Date.now() - new Date(lastEntry.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      this.userProfile.journalInsights = {
        lastJournalDate: lastEntry.createdAt,
        daysSinceLastEntry,
        shouldSuggestJournal: daysSinceLastEntry > 2
      };
    } else {
      this.userProfile.journalInsights = {
        hasJournal: false,
        shouldSuggestJournal: true
      };
    }
    return true;
  }

  getJournalContext() {
    const insights = this.userProfile.journalInsights;
    
    if (!insights || !insights.lastJournalDate) {
      return {
        hasJournal: false,
        context: "User hasn't started journaling yet."
      };
    }
    
    const daysSinceLastEntry = Math.floor(
      (new Date() - new Date(insights.lastJournalDate)) / (1000 * 60 * 60 * 24)
    );
    
    let contextString = `Journal context: `;
    
    // Recent mood context
    if (insights.recentMoods && insights.recentMoods.length > 0) {
      const moodSummary = insights.recentMoods.slice(0, 3).join(', ');
      contextString += `Recent emotions: ${moodSummary}. `;
    }
    
    // Current challenges
    if (insights.currentChallenges && insights.currentChallenges.length > 0) {
      contextString += `Current challenges: ${insights.currentChallenges.join(', ')}. `;
    }
    
    // Strengths and themes
    if (insights.strengths && insights.strengths.length > 0) {
      contextString += `Strengths: ${insights.strengths.join(', ')}. `;
    }
    
    if (insights.commonThemes && insights.commonThemes.length > 0) {
      contextString += `Common themes: ${insights.commonThemes.join(', ')}. `;
    }
    
    // Journaling frequency
    contextString += `Journaling frequency: ${insights.journalingFrequency}. `;
    
    // Time since last entry
    if (daysSinceLastEntry === 0) {
      contextString += `Last journaled today.`;
    } else if (daysSinceLastEntry === 1) {
      contextString += `Last journaled yesterday.`;
    } else if (daysSinceLastEntry > 7) {
      contextString += `Haven't journaled in ${daysSinceLastEntry} days - might want to encourage journaling.`;
    } else {
      contextString += `Last journaled ${daysSinceLastEntry} days ago.`;
    }
    
    return {
      hasJournal: true,
      context: contextString,
      insights: insights
    };
  }

  shouldRecommendJournaling(userInput, emotionalState) {
    // Use the new session-based logic - only suggest journaling rarely
    if (!this.shouldSuggestJournaling()) {
      return {
        shouldRecommend: false,
        reason: 'session_limit',
        daysSinceLastEntry: 0
      };
    }
    
    // Only suggest if user explicitly mentions journaling, reflection, or deep emotional processing
    const strongTriggers = [
      'journal', 'write', 'reflect', 'think through', 'process this',
      'confused about', 'overwhelmed by', 'need to figure out'
    ];
    
    const hasStrongTrigger = strongTriggers.some(trigger =>
      userInput.toLowerCase().includes(trigger)
    );
    
    if (hasStrongTrigger) {
      this.markJournalingSuggested();
      return {
        shouldRecommend: true,
        reason: 'explicit_reflection_need',
        daysSinceLastEntry: 0
      };
    }
    
    return {
      shouldRecommend: false,
      reason: 'no_strong_signal',
      daysSinceLastEntry: 0
    };
  }

  generateJournalPrompt(userContext) {
    const prompts = {
      emotional_processing: [
        "It sounds like you have a lot on your mind. Have you considered writing about these feelings in your journal?",
        "Journaling might help you process these thoughts. Would you like me to suggest a reflection question?",
        "Writing about what you're experiencing could provide some clarity. Want to explore this in your journal?"
      ],
      consistency: [
        "You haven't journaled in a while. Sometimes writing down our thoughts can be really helpful.",
        "I notice it's been a few days since your last journal entry. How about taking a moment to reflect?",
        "Regular journaling can be a great way to check in with yourself. Would you like to write something today?"
      ],
      celebration: [
        "This sounds like something worth reflecting on in your journal!",
        "What a great insight! You might want to capture this in your journal.",
        "This could be a meaningful entry for your journal - want to write about it?"
      ]
    };
    
    const category = userContext.reason || 'emotional_processing';
    const categoryPrompts = prompts[category] || prompts.emotional_processing;
    
    return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
  }

  integrateJournalIntoPrompt(basePrompt, userInput) {
    const journalContext = this.getJournalContext();
    
    if (!journalContext.hasJournal) {
      return basePrompt + `\n\nNote: User hasn't started journaling yet. Consider mentioning the benefits of journaling if appropriate to the conversation.`;
    }
    
    const journalRecommendation = this.shouldRecommendJournaling(userInput);
    
    let enhancedPrompt = basePrompt + `\n\nJournal Context: ${journalContext.context}`;
    
    if (journalRecommendation.shouldRecommend) {
      enhancedPrompt += `\n\nConsider gently suggesting journaling as this seems like a good opportunity for reflection.`;
    }
    
    // Add specific guidance based on insights
    const insights = journalContext.insights;
    if (insights) {
      if (insights.moodTrend && insights.moodTrend.length > 1) {
        const recentMoods = insights.moodTrend.slice(0, 3);
        const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
        
        if (avgMood < 3) {
          enhancedPrompt += `\n\nNote: Recent journal entries show lower mood scores. Be extra supportive and empathetic.`;
        } else if (avgMood > 4) {
          enhancedPrompt += `\n\nNote: Recent journal entries show positive mood. You can celebrate and build on this positivity.`;
        }
      }
      
      if (insights.currentChallenges && insights.currentChallenges.length > 0) {
        enhancedPrompt += `\n\nNote: Be aware of current challenges user has written about: ${insights.currentChallenges.join(', ')}.`;
      }
      
      if (insights.strengths && insights.strengths.length > 0) {
        enhancedPrompt += `\n\nNote: User's strengths from journal entries: ${insights.strengths.join(', ')}. You can reference these when appropriate.`;
      }
    }
    
    return enhancedPrompt;
  }
}

// EXPORT FOR USE
export default SoulLensAI;