// SOULLENS CONVERSATION MEMORY SYSTEM
// Provides context and personalization based on chat history

export class ConversationMemory {
  constructor(userProfile) {
    this.userProfile = userProfile;
  }

  // GET RELEVANT CONTEXT FOR CURRENT CONVERSATION
  getRelevantContext(userInput, currentEmotion) {
    const context = {
      recentPatterns: this.getRecentPatterns(),
      similarConversations: this.findSimilarConversations(userInput),
      emotionalTrends: this.getEmotionalTrends(),
      personalDetails: this.getPersonalDetails(),
      conversationCount: this.userProfile.conversationHistory.length,
      importedContext: this.getRelevantImportedContext(userInput, currentEmotion)
    };

    return this.formatContextForAI(context);
  }

  // FIND RECENT EMOTIONAL/BEHAVIORAL PATTERNS
  getRecentPatterns() {
    const recent = this.userProfile.conversationHistory.slice(-10);
    const patterns = {
      emotions: {},
      topics: {},
      timeOfDay: {}
    };

    recent.forEach(conv => {
      if (conv.emotionalState) {
        patterns.emotions[conv.emotionalState] = (patterns.emotions[conv.emotionalState] || 0) + 1;
      }

      if (conv.topics) {
        conv.topics.forEach(topic => {
          patterns.topics[topic] = (patterns.topics[topic] || 0) + 1;
        });
      }

      const hour = new Date(conv.timestamp).getHours();
      const timeCategory = this.categorizeTime(hour);
      patterns.timeOfDay[timeCategory] = (patterns.timeOfDay[timeCategory] || 0) + 1;
    });

    return patterns;
  }

  // FIND SIMILAR PAST CONVERSATIONS
  findSimilarConversations(userInput) {
    const inputLower = userInput.toLowerCase();
    const similar = [];

    this.userProfile.conversationHistory.forEach(conv => {
      const userInputLower = conv.userInput.toLowerCase();
      const commonWords = this.findCommonWords(inputLower, userInputLower);
      if (commonWords.length > 0) {
        similar.push({
          input: conv.userInput,
          response: conv.aiResponse,
          emotion: conv.emotionalState,
          timestamp: conv.timestamp,
          similarity: commonWords.length
        });
      }
    });

    return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  }

  // GET EMOTIONAL TRENDS OVER TIME
  getEmotionalTrends() {
    const emotions = this.userProfile.emotionalPatterns;
    if (emotions.length < 3) return null;

    const recent = emotions.slice(-7);
    const trending = { improving: 0, stable: 0, concerning: 0 };

    recent.forEach(emotion => {
      if (['excited', 'happy', 'motivated', 'content'].includes(emotion.state)) {
        trending.improving++;
      } else if (['stressed', 'anxious', 'overwhelmed', 'sad'].includes(emotion.state)) {
        trending.concerning++;
      } else {
        trending.stable++;
      }
    });

    return trending;
  }

  // FORMAT CONTEXT FOR AI CONSUMPTION
  formatContextForAI(context) {
    if (context.conversationCount === 0 && (!context.importedContext || context.importedContext.length === 0)) {
      return "This is the user's first conversation with SoulLens. Be welcoming and establish rapport.";
    }

    let contextPrompt = `CONVERSATION CONTEXT (${context.conversationCount} previous chats):\n`;

    if (Object.keys(context.recentPatterns.emotions).length > 0) {
      const topEmotion = Object.entries(context.recentPatterns.emotions)
        .sort((a, b) => b[1] - a[1])[0];
      contextPrompt += `Recent emotional pattern: Often feeling ${topEmotion[0]} (${topEmotion[1]} times recently)\n`;
    }

    if (context.similarConversations.length > 0) {
      const mostSimilar = context.similarConversations[0];
      contextPrompt += `Similar past conversation: User said "${mostSimilar.input}" and felt ${mostSimilar.emotion}\n`;
    }

    if (context.emotionalTrends) {
      if (context.emotionalTrends.improving > context.emotionalTrends.concerning) {
        contextPrompt += `Emotional trend: Generally improving mood recently\n`;
      } else if (context.emotionalTrends.concerning > context.emotionalTrends.improving) {
        contextPrompt += `Emotional trend: Some challenging emotions recently - be extra supportive\n`;
      }
    }

    // ADD IMPORTED DOCUMENT CONTEXT
    if (context.importedContext && context.importedContext.length > 0) {
      contextPrompt += `\nIMPORTED DOCUMENT INSIGHTS:\n`;
      context.importedContext.forEach(imported => {
        contextPrompt += `From "${imported.source}": ${imported.content.substring(0, 200)}...\n`;
        if (imported.analysis && imported.analysis.emotions && imported.analysis.emotions.length > 0) {
          const emotions = imported.analysis.emotions.map(e => e.emotion).join(', ');
          contextPrompt += `  Emotions found: ${emotions}\n`;
        }
        if (imported.analysis && imported.analysis.themes && imported.analysis.themes.length > 0) {
          const themes = imported.analysis.themes.map(t => t.theme).join(', ');
          contextPrompt += `  Key themes: ${themes}\n`;
        }
      });
    }

    // ADD IMPORTED DOCUMENT SUMMARY IF AVAILABLE
    if (this.userProfile.importedDocuments && this.userProfile.importedDocuments.length > 0) {
      const recentImports = this.userProfile.importedDocuments.slice(-3);
      contextPrompt += `\nRecently imported documents: ${recentImports.map(doc => doc.title).join(', ')}\n`;
    }

    contextPrompt += `\nUse this context to make your response feel personally relevant and show you remember them.`;
    return contextPrompt;
  }

  // HELPER METHODS
  categorizeTime(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  findCommonWords(str1, str2) {
    const words1 = str1.split(' ').filter(w => w.length > 3);
    const words2 = str2.split(' ').filter(w => w.length > 3);
    return words1.filter(word => words2.includes(word));
  }

  getPersonalDetails() {
    const details = { relationships: [], interests: [], goals: [], challenges: [] };
    
    this.userProfile.conversationHistory.forEach(conv => {
      const input = conv.userInput.toLowerCase();
      
      if (input.includes('girlfriend') || input.includes('boyfriend') || 
          input.includes('partner') || input.includes('spouse')) {
        details.relationships.push('romantic partner');
      }
      if (input.includes('family') || input.includes('mom') || 
          input.includes('dad') || input.includes('sister') || input.includes('brother')) {
        details.relationships.push('family');
      }
      
      if (input.includes('want to') || input.includes('goal') || 
          input.includes('dream') || input.includes('hope')) {
        details.goals.push(conv.userInput);
      }
    });

    return details;
  }

  // GET RELEVANT IMPORTED DOCUMENT CONTEXT
  getRelevantImportedContext(userInput, currentEmotion) {
    if (!this.importedContext || this.importedContext.length === 0) {
      return [];
    }

    const inputLower = userInput.toLowerCase();
    const relevantContext = [];

    // Find imported context that matches current input or emotion
    this.importedContext.forEach(context => {
      const contentLower = context.content.toLowerCase();
      let relevanceScore = 0;

      // Check for keyword matches
      const commonWords = this.findCommonWords(inputLower, contentLower);
      relevanceScore += commonWords.length * 2;

      // Check for emotional relevance
      if (context.analysis && context.analysis.emotions) {
        const hasMatchingEmotion = context.analysis.emotions.some(emotion => 
          emotion.emotion === currentEmotion
        );
        if (hasMatchingEmotion) {
          relevanceScore += 5;
        }
      }

      // Check for thematic relevance
      if (context.analysis && context.analysis.themes) {
        const inputThemes = this.extractTopicsQuickly(userInput);
        const hasMatchingTheme = context.analysis.themes.some(theme =>
          inputThemes.includes(theme.theme)
        );
        if (hasMatchingTheme) {
          relevanceScore += 3;
        }
      }

      if (relevanceScore > 0) {
        relevantContext.push({
          ...context,
          relevanceScore
        });
      }
    });

    // Sort by relevance and return top 3
    return relevantContext
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  }

  // ADD IMPORTED CONTEXT TO MEMORY
  addImportedContext(context) {
    if (!this.importedContext) {
      this.importedContext = [];
    }
    this.importedContext.push(context);

    // Keep only last 200 imported contexts for performance
    if (this.importedContext.length > 200) {
      this.importedContext = this.importedContext.slice(-200);
    }
  }

  // EXTRACT TOPICS QUICKLY (HELPER METHOD)
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
}

// ENHANCED EMOTIONAL ANALYSIS
export class EmotionalIntelligence {
  static analyzeEmotionalComplexity(userInput) {
    const emotions = {
      joy: ['happy', 'excited', 'thrilled', 'amazing', 'fantastic', 'awesome', 'pumped'],
      stress: ['stressed', 'overwhelmed', 'anxious', 'worried', 'pressure', 'crazy'],
      confusion: ['confused', 'lost', 'unclear', 'don\'t know', 'uncertain', 'mixed'],
      anger: ['angry', 'frustrated', 'pissed', 'annoyed', 'mad', 'irritated'],
      sadness: ['sad', 'down', 'depressed', 'low', 'hurt', 'disappointed'],
      fear: ['scared', 'afraid', 'nervous', 'worried', 'terrified', 'anxious'],
      love: ['love', 'adore', 'care about', 'cherish', 'appreciate'],
      pride: ['proud', 'accomplished', 'achieved', 'succeeded', 'won']
    };

    const detected = [];
    const inputLower = userInput.toLowerCase();

    Object.entries(emotions).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (inputLower.includes(keyword)) {
          detected.push({ emotion, keyword, confidence: 0.8 });
        }
      });
    });

    if (detected.length === 0) return 'neutral';
    if (detected.length === 1) return detected[0].emotion;
    if (detected.length > 1) return 'mixed';
    
    return detected[0].emotion;
  }

  static detectEnergyLevel(userInput) {
    const highEnergy = ['!!', 'amazing', 'incredible', 'awesome', 'pumped', 'excited', 'YES'];
    const lowEnergy = ['tired', 'exhausted', 'drained', 'low', 'can\'t', 'struggling'];
    
    const inputUpper = userInput.toUpperCase();
    
    if (highEnergy.some(word => inputUpper.includes(word.toUpperCase()))) return 'high';
    if (lowEnergy.some(word => inputUpper.includes(word.toUpperCase()))) return 'low';
    
    return 'medium';
  }
}