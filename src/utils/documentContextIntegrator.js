// SOULLENS DOCUMENT CONTEXT INTEGRATOR
// Integrates imported documents into AI memory for ultra-personalized conversations

export class DocumentContextIntegrator {
  
  static async addDocumentToAIMemory(parsedDocument, userAI) {
    const { content, metadata } = parsedDocument;
    
    try {
      // Split content into manageable chunks for processing
      const chunks = this.chunkContent(content, 1000); // 1000 char chunks
      
      // Process each chunk for contextual insights
      const processedChunks = [];
      for (const chunk of chunks) {
        const processedChunk = await this.processChunkForContext(chunk, metadata, userAI);
        processedChunks.push(processedChunk);
      }
      
      // Extract document-level patterns and insights
      const documentInsights = this.extractDocumentInsights(content, metadata);
      
      // Update user profile with import information
      this.updateUserProfileWithDocument(userAI, metadata, documentInsights);
      
      // Add to conversation memory as imported context
      this.addToConversationMemory(userAI, processedChunks, metadata);
      
      // Generate comprehensive document summary
      const summary = await this.generateDocumentSummary(content, documentInsights);
      
      return {
        success: true,
        chunksProcessed: chunks.length,
        summary: summary,
        insights: documentInsights,
        importedAt: new Date().toISOString(),
        metadata: {
          title: metadata.title,
          type: metadata.type,
          wordCount: metadata.wordCount,
          size: metadata.size
        }
      };
      
    } catch (error) {
      console.error('Document integration error:', error);
      throw new Error(`Failed to integrate document: ${error.message}`);
    }
  }
  
  // INTELLIGENT CONTENT CHUNKING
  static chunkContent(content, maxLength) {
    if (!content || content.length === 0) return [];
    
    const chunks = [];
    let currentChunk = '';
    
    // Split by paragraphs first for better context preservation
    const paragraphs = content.split(/\n\s*\n/);
    
    for (const paragraph of paragraphs) {
      // If paragraph is too long, split by sentences
      if (paragraph.length > maxLength) {
        const sentences = paragraph.split(/[.!?]+/);
        
        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;
          
          if ((currentChunk + trimmedSentence).length > maxLength && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = trimmedSentence + '. ';
          } else {
            currentChunk += trimmedSentence + '. ';
          }
        }
      } else {
        // Add whole paragraph if it fits
        if ((currentChunk + paragraph).length > maxLength && currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = paragraph + '\n\n';
        } else {
          currentChunk += paragraph + '\n\n';
        }
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 50); // Filter out tiny chunks
  }
  
  // PROCESS INDIVIDUAL CHUNKS FOR CONTEXT
  static async processChunkForContext(chunk, metadata, userAI) {
    // Extract emotional patterns, themes, and insights from chunk
    const analysis = {
      emotions: this.extractEmotions(chunk),
      themes: this.extractThemes(chunk),
      goals: this.extractGoals(chunk),
      challenges: this.extractChallenges(chunk),
      relationships: this.extractRelationships(chunk),
      insights: this.extractPersonalInsights(chunk)
    };
    
    return {
      content: chunk,
      source: metadata.title,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      type: 'imported_document'
    };
  }
  
  // EXTRACT EMOTIONAL PATTERNS
  static extractEmotions(text) {
    const emotionKeywords = {
      joy: ['happy', 'excited', 'thrilled', 'amazing', 'fantastic', 'awesome', 'love', 'wonderful', 'great', 'delighted'],
      sadness: ['sad', 'depressed', 'down', 'low', 'hurt', 'disappointed', 'devastated', 'heartbroken', 'miserable'],
      anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'panic', 'fear', 'scared', 'terrified'],
      anger: ['angry', 'frustrated', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'pissed'],
      gratitude: ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate', 'lucky'],
      confidence: ['confident', 'proud', 'accomplished', 'strong', 'capable', 'successful'],
      confusion: ['confused', 'lost', 'uncertain', 'unclear', 'mixed up', 'don\'t know']
    };
    
    const lowercaseText = text.toLowerCase();
    const detectedEmotions = [];
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowercaseText.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions.push({
          emotion,
          intensity: matches.length,
          keywords: matches
        });
      }
    });
    
    return detectedEmotions;
  }
  
  // EXTRACT THEMES AND TOPICS
  static extractThemes(text) {
    const themeKeywords = {
      career: ['work', 'job', 'career', 'boss', 'office', 'meeting', 'project', 'promotion', 'salary'],
      relationships: ['relationship', 'partner', 'boyfriend', 'girlfriend', 'spouse', 'family', 'friend', 'social'],
      health: ['health', 'exercise', 'workout', 'diet', 'sleep', 'tired', 'energy', 'fitness'],
      personal_growth: ['growth', 'learning', 'development', 'improve', 'better', 'change', 'progress'],
      finances: ['money', 'budget', 'savings', 'debt', 'financial', 'income', 'expense'],
      education: ['school', 'university', 'study', 'learn', 'education', 'course', 'degree'],
      creativity: ['creative', 'art', 'music', 'writing', 'design', 'project', 'inspiration'],
      spirituality: ['spiritual', 'meditation', 'prayer', 'faith', 'meaning', 'purpose']
    };
    
    const lowercaseText = text.toLowerCase();
    const detectedThemes = [];
    
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const matches = keywords.filter(keyword => lowercaseText.includes(keyword));
      if (matches.length > 0) {
        detectedThemes.push({
          theme,
          relevance: matches.length,
          keywords: matches
        });
      }
    });
    
    return detectedThemes;
  }
  
  // EXTRACT GOALS AND ASPIRATIONS
  static extractGoals(text) {
    const goalPatterns = [
      /want to (.+?)[\.\,\!]/gi,
      /goal(?:s)? (?:is|are) to (.+?)[\.\,\!]/gi,
      /hoping to (.+?)[\.\,\!]/gi,
      /plan(?:ning)? to (.+?)[\.\,\!]/gi,
      /dream(?:ing)? of (.+?)[\.\,\!]/gi,
      /would love to (.+?)[\.\,\!]/gi
    ];
    
    const goals = [];
    goalPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 5) {
          goals.push({
            goal: match[1].trim(),
            confidence: 0.8,
            context: match[0]
          });
        }
      });
    });
    
    return goals;
  }
  
  // EXTRACT CHALLENGES AND STRUGGLES
  static extractChallenges(text) {
    const challengeKeywords = [
      'struggle', 'struggling', 'difficult', 'difficulty', 'challenge', 'challenging',
      'problem', 'issue', 'trouble', 'hard', 'tough', 'overwhelming', 'stuck',
      'can\'t', 'unable', 'fail', 'failing', 'obstacle', 'barrier'
    ];
    
    const lowercaseText = text.toLowerCase();
    const challenges = [];
    
    // Find sentences containing challenge keywords
    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      const matchedKeywords = challengeKeywords.filter(keyword => 
        lowerSentence.includes(keyword)
      );
      
      if (matchedKeywords.length > 0) {
        challenges.push({
          challenge: sentence.trim(),
          keywords: matchedKeywords,
          severity: matchedKeywords.length
        });
      }
    });
    
    return challenges;
  }
  
  // EXTRACT RELATIONSHIP MENTIONS
  static extractRelationships(text) {
    const relationshipKeywords = {
      romantic: ['partner', 'boyfriend', 'girlfriend', 'spouse', 'husband', 'wife', 'relationship'],
      family: ['mom', 'dad', 'mother', 'father', 'sister', 'brother', 'family', 'parents'],
      professional: ['boss', 'colleague', 'coworker', 'manager', 'team', 'client'],
      social: ['friend', 'friends', 'buddy', 'social circle', 'peer']
    };
    
    const lowercaseText = text.toLowerCase();
    const relationships = [];
    
    Object.entries(relationshipKeywords).forEach(([type, keywords]) => {
      keywords.forEach(keyword => {
        if (lowercaseText.includes(keyword)) {
          relationships.push({
            type,
            keyword,
            mentions: (lowercaseText.match(new RegExp(keyword, 'g')) || []).length
          });
        }
      });
    });
    
    return relationships;
  }
  
  // EXTRACT PERSONAL INSIGHTS
  static extractPersonalInsights(text) {
    const insightPatterns = [
      /I (?:realized|learned|discovered|found out) (.+?)[\.\,\!]/gi,
      /(?:realized|learned|discovered) that (.+?)[\.\,\!]/gi,
      /(?:insight|realization)(?:\:)? (.+?)[\.\,\!]/gi
    ];
    
    const insights = [];
    insightPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 10) {
          insights.push({
            insight: match[1].trim(),
            type: 'self_discovery',
            context: match[0]
          });
        }
      });
    });
    
    return insights;
  }
  
  // EXTRACT DOCUMENT-LEVEL INSIGHTS
  static extractDocumentInsights(content, metadata) {
    return {
      overallTone: this.analyzeOverallTone(content),
      keyTopics: this.extractKeyTopics(content),
      emotionalJourney: this.analyzeEmotionalJourney(content),
      personalGrowthIndicators: this.extractGrowthIndicators(content),
      documentType: this.classifyDocumentType(content, metadata)
    };
  }
  
  static analyzeOverallTone(content) {
    const positiveWords = ['good', 'great', 'amazing', 'wonderful', 'excellent', 'fantastic', 'love', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'sad', 'angry', 'frustrated'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'negative';
    return 'neutral';
  }
  
  static extractKeyTopics(content) {
    // Simple frequency analysis of meaningful words
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);
    
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }
  
  static analyzeEmotionalJourney(content) {
    // Analyze emotional progression through the document
    const chunks = content.split(/\n\s*\n/);
    const journey = chunks.map((chunk, index) => {
      const emotions = this.extractEmotions(chunk);
      return {
        section: index + 1,
        emotions: emotions.map(e => e.emotion)
      };
    });
    
    return journey;
  }
  
  static extractGrowthIndicators(content) {
    const growthKeywords = [
      'learned', 'grew', 'improved', 'developed', 'progressed', 'achieved',
      'overcame', 'breakthrough', 'insight', 'realization', 'understanding'
    ];
    
    const lowercaseContent = content.toLowerCase();
    const indicators = growthKeywords.filter(keyword => 
      lowercaseContent.includes(keyword)
    );
    
    return indicators;
  }
  
  static classifyDocumentType(content, metadata) {
    const patterns = {
      therapy_notes: ['therapy', 'therapist', 'session', 'counseling', 'treatment'],
      journal: ['dear diary', 'today i', 'feeling', 'mood', 'reflection'],
      book_highlights: ['highlight', 'quote', 'author', 'chapter', 'page'],
      work_notes: ['meeting', 'project', 'deadline', 'team', 'work'],
      personal_development: ['goal', 'growth', 'improve', 'development', 'progress']
    };
    
    const lowercaseContent = content.toLowerCase();
    const scores = {};
    
    Object.entries(patterns).forEach(([type, keywords]) => {
      scores[type] = keywords.filter(keyword => 
        lowercaseContent.includes(keyword)
      ).length;
    });
    
    const bestMatch = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return bestMatch[1] > 0 ? bestMatch[0] : 'general_document';
  }
  
  // UPDATE USER PROFILE WITH DOCUMENT
  static updateUserProfileWithDocument(userAI, metadata, insights) {
    // Initialize imported documents array if it doesn't exist
    if (!userAI.userProfile.importedDocuments) {
      userAI.userProfile.importedDocuments = [];
    }
    
    // Add document to imported list
    userAI.userProfile.importedDocuments.push({
      title: metadata.title,
      type: metadata.type,
      importedAt: new Date().toISOString(),
      wordCount: metadata.wordCount,
      summary: insights.keyTopics?.slice(0, 3).map(t => t.word).join(', ') || 'Document imported',
      documentType: insights.documentType,
      overallTone: insights.overallTone
    });
    
    // Initialize imported patterns if they don't exist
    if (!userAI.userProfile.importedPatterns) {
      userAI.userProfile.importedPatterns = [];
    }
    
    // Add growth indicators to user profile
    if (insights.personalGrowthIndicators?.length > 0) {
      insights.personalGrowthIndicators.forEach(indicator => {
        userAI.userProfile.importedPatterns.push({
          type: 'growth_indicator',
          content: indicator,
          source: metadata.title,
          importedAt: new Date().toISOString()
        });
      });
    }
    
    // Keep only last 100 imported patterns for performance
    if (userAI.userProfile.importedPatterns.length > 100) {
      userAI.userProfile.importedPatterns = userAI.userProfile.importedPatterns.slice(-100);
    }
  }
  
  // ADD TO CONVERSATION MEMORY
  static addToConversationMemory(userAI, processedChunks, metadata) {
    // Add method to conversation memory for imported context
    if (!userAI.conversationMemory.importedContext) {
      userAI.conversationMemory.importedContext = [];
    }
    
    processedChunks.forEach(chunk => {
      userAI.conversationMemory.importedContext.push({
        content: chunk.content,
        source: metadata.title,
        analysis: chunk.analysis,
        importedAt: chunk.timestamp,
        type: 'document_import'
      });
    });
    
    // Keep only last 200 imported contexts for performance
    if (userAI.conversationMemory.importedContext.length > 200) {
      userAI.conversationMemory.importedContext = 
        userAI.conversationMemory.importedContext.slice(-200);
    }
  }
  
  // GENERATE COMPREHENSIVE DOCUMENT SUMMARY
  static async generateDocumentSummary(content, insights) {
    const wordCount = content.split(' ').filter(w => w.length > 0).length;
    
    let summary = '';
    
    // Document type and length
    summary += `${insights.documentType.replace('_', ' ')} (${wordCount} words). `;
    
    // Overall tone
    summary += `Overall tone: ${insights.overallTone}. `;
    
    // Key topics
    if (insights.keyTopics?.length > 0) {
      const topTopics = insights.keyTopics.slice(0, 3).map(t => t.word);
      summary += `Key topics: ${topTopics.join(', ')}. `;
    }
    
    // Growth indicators
    if (insights.personalGrowthIndicators?.length > 0) {
      summary += `Growth themes: ${insights.personalGrowthIndicators.slice(0, 3).join(', ')}. `;
    }
    
    // Add context for AI conversations
    summary += 'This content has been integrated into your AI companion\'s memory for more personalized conversations.';
    
    return summary;
  }
}