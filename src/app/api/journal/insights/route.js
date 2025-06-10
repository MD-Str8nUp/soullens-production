import { NextResponse } from 'next/server'
import { supabase } from '../../../../utils/supabase.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30days' // 7days, 30days, 90days
    const analysisType = searchParams.get('type') || 'overview' // overview, patterns, emotions, growth
    
    // Calculate date range based on timeframe
    const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Fetch real entries from Supabase
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      // Fall back to mock data if database fetch fails
      const mockEntries = generateMockEntries(timeframe)
      const insights = generateOverviewInsights(mockEntries)
      return NextResponse.json({
        timeframe,
        analysisType,
        insights,
        entryCount: mockEntries.length,
        lastUpdated: new Date().toISOString(),
        dataSource: 'mock'
      })
    }
    
    // Use real entries or fall back to mock if no entries found
    const analysisEntries = entries && entries.length > 0 ? entries : generateMockEntries(timeframe)
    
    let insights = {}
    
    switch (analysisType) {
      case 'overview':
        insights = generateOverviewInsights(analysisEntries)
        break
      case 'patterns':
        insights = generatePatternInsights(analysisEntries)
        break
      case 'emotions':
        insights = generateEmotionalInsights(analysisEntries)
        break
      case 'growth':
        insights = generateGrowthInsights(analysisEntries)
        break
      default:
        insights = generateOverviewInsights(analysisEntries)
    }
    
    return NextResponse.json({
      timeframe,
      analysisType,
      insights,
      entryCount: analysisEntries.length,
      lastUpdated: new Date().toISOString(),
      dataSource: entries && entries.length > 0 ? 'database' : 'mock'
    })
  } catch (error) {
    console.error('Error generating journal insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { entries, focusArea } = await request.json()
    
    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Valid entries array is required' },
        { status: 400 }
      )
    }
    
    // Generate personalized insights based on actual entries
    const insights = generatePersonalizedInsights(entries, focusArea)
    
    return NextResponse.json({
      insights,
      analysisDate: new Date().toISOString(),
      entryCount: entries.length
    })
  } catch (error) {
    console.error('Error analyzing journal entries:', error)
    return NextResponse.json(
      { error: 'Failed to analyze entries' },
      { status: 500 }
    )
  }
}

function generateMockEntries(timeframe) {
  const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90
  const entries = []
  
  for (let i = 0; i < Math.min(days, 20); i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    entries.push({
      id: `mock_${i}`,
      date: date.toISOString().split('T')[0],
      emotion: ['happy', 'calm', 'excited', 'neutral', 'anxious', 'sad'][Math.floor(Math.random() * 6)],
      category: ['self-awareness', 'relationships', 'goals', 'emotions'][Math.floor(Math.random() * 4)],
      tags: ['gratitude', 'growth', 'challenge', 'relationships'].slice(0, Math.floor(Math.random() * 3) + 1),
      mood_score: Math.floor(Math.random() * 5) + 1,
      wordCount: Math.floor(Math.random() * 300) + 50
    })
  }
  
  return entries
}

function generateOverviewInsights(entries) {
  const totalEntries = entries.length
  const avgMoodScore = entries.reduce((sum, entry) => sum + entry.mood_score, 0) / totalEntries
  const avgWordCount = entries.reduce((sum, entry) => sum + entry.wordCount, 0) / totalEntries
  
  const emotionCounts = entries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1
    return acc
  }, {})
  
  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1
    return acc
  }, {})
  
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  
  return {
    totalEntries,
    avgMoodScore: Math.round(avgMoodScore * 10) / 10,
    avgWordCount: Math.round(avgWordCount),
    topEmotion: topEmotion ? { emotion: topEmotion[0], count: topEmotion[1] } : null,
    topCategory: topCategory ? { category: topCategory[0], count: topCategory[1] } : null,
    emotionDistribution: emotionCounts,
    categoryDistribution: categoryCounts,
    consistency: calculateConsistency(entries),
    summary: generateSummary(avgMoodScore, totalEntries, topEmotion?.[0])
  }
}

function generatePatternInsights(entries) {
  const patterns = {
    weeklyPatterns: analyzeWeeklyPatterns(entries),
    emotionalTrends: analyzeEmotionalTrends(entries),
    contentThemes: analyzeContentThemes(entries),
    writingHabits: analyzeWritingHabits(entries)
  }
  
  return {
    patterns,
    recommendations: generatePatternRecommendations(patterns)
  }
}

function generateEmotionalInsights(entries) {
  const emotions = entries.map(e => e.emotion)
  const moodScores = entries.map(e => e.mood_score)
  
  const emotionFrequency = emotions.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1
    return acc
  }, {})
  
  const moodTrend = calculateMoodTrend(moodScores)
  const emotionalBalance = calculateEmotionalBalance(emotionFrequency)
  
  return {
    emotionFrequency,
    moodTrend,
    emotionalBalance,
    averageMood: moodScores.reduce((a, b) => a + b, 0) / moodScores.length,
    moodVariability: calculateVariability(moodScores),
    insights: generateEmotionalRecommendations(emotionFrequency, moodTrend)
  }
}

function generateGrowthInsights(entries) {
  const growthIndicators = {
    selfAwarenessGrowth: calculateCategoryGrowth(entries, 'self-awareness'),
    relationshipGrowth: calculateCategoryGrowth(entries, 'relationships'),
    goalProgress: calculateCategoryGrowth(entries, 'goals'),
    emotionalIntelligence: calculateEmotionalIntelligenceGrowth(entries)
  }
  
  return {
    growthIndicators,
    milestones: identifyMilestones(entries),
    recommendations: generateGrowthRecommendations(growthIndicators)
  }
}

function generatePersonalizedInsights(entries, focusArea) {
  if (!entries.length) return { message: 'No entries to analyze' }
  
  const baseInsights = generateOverviewInsights(entries)
  let focusedInsights = {}
  
  if (focusArea) {
    switch (focusArea) {
      case 'emotional_wellbeing':
        focusedInsights = generateEmotionalInsights(entries)
        break
      case 'personal_growth':
        focusedInsights = generateGrowthInsights(entries)
        break
      case 'patterns':
        focusedInsights = generatePatternInsights(entries)
        break
      default:
        focusedInsights = {}
    }
  }
  
  return {
    overview: baseInsights,
    focused: focusedInsights,
    chatIntegration: generateChatIntegrationData(entries)
  }
}

function generateChatIntegrationData(entries) {
  // This data will be used to inform AI chat responses
  const recentMoods = entries.slice(0, 5).map(e => e.emotion)
  const commonThemes = extractCommonThemes(entries)
  const currentChallenges = identifyCurrentChallenges(entries)
  const strengths = identifyStrengths(entries)
  
  return {
    recentMoods,
    commonThemes,
    currentChallenges,
    strengths,
    lastJournalDate: entries[0]?.date,
    journalingFrequency: calculateJournalingFrequency(entries),
    moodTrend: entries.slice(0, 7).map(e => e.mood_score)
  }
}

// Helper functions
function calculateConsistency(entries) {
  if (entries.length < 7) return 'insufficient_data'
  
  const daysWithEntries = new Set(entries.map(e => e.date)).size
  const totalDays = Math.min(30, entries.length)
  const consistency = daysWithEntries / totalDays
  
  if (consistency > 0.8) return 'excellent'
  if (consistency > 0.6) return 'good'
  if (consistency > 0.3) return 'moderate'
  return 'low'
}

function generateSummary(avgMood, totalEntries, topEmotion) {
  let summary = `You've written ${totalEntries} journal entries. `
  
  if (avgMood >= 4) {
    summary += 'Your overall mood has been quite positive! '
  } else if (avgMood >= 3) {
    summary += 'Your mood has been balanced overall. '
  } else {
    summary += 'You might be going through some challenging times. '
  }
  
  if (topEmotion) {
    summary += `You've been feeling ${topEmotion} most frequently.`
  }
  
  return summary
}

function analyzeWeeklyPatterns(entries) {
  // Simplified weekly pattern analysis
  return {
    mostActiveDay: 'Sunday',
    leastActiveDay: 'Wednesday',
    avgEntriesPerWeek: Math.round(entries.length / 4)
  }
}

function analyzeEmotionalTrends(entries) {
  const recent = entries.slice(0, 7)
  const previous = entries.slice(7, 14)
  
  const recentAvg = recent.reduce((sum, e) => sum + e.mood_score, 0) / recent.length
  const previousAvg = previous.length ? previous.reduce((sum, e) => sum + e.mood_score, 0) / previous.length : recentAvg
  
  return {
    trend: recentAvg > previousAvg ? 'improving' : recentAvg < previousAvg ? 'declining' : 'stable',
    change: Math.round((recentAvg - previousAvg) * 10) / 10
  }
}

function analyzeContentThemes(entries) {
  const allTags = entries.flatMap(e => e.tags || [])
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }))
}

function analyzeWritingHabits(entries) {
  return {
    avgWordCount: Math.round(entries.reduce((sum, e) => sum + e.wordCount, 0) / entries.length),
    longestEntry: Math.max(...entries.map(e => e.wordCount)),
    shortestEntry: Math.min(...entries.map(e => e.wordCount))
  }
}

function calculateMoodTrend(moodScores) {
  if (moodScores.length < 2) return 'insufficient_data'
  
  const firstHalf = moodScores.slice(Math.floor(moodScores.length / 2))
  const secondHalf = moodScores.slice(0, Math.floor(moodScores.length / 2))
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  
  if (firstAvg > secondAvg + 0.5) return 'improving'
  if (firstAvg < secondAvg - 0.5) return 'declining'
  return 'stable'
}

function calculateEmotionalBalance(emotionFreq) {
  const total = Object.values(emotionFreq).reduce((a, b) => a + b, 0)
  const balance = {}
  
  Object.entries(emotionFreq).forEach(([emotion, count]) => {
    balance[emotion] = Math.round((count / total) * 100)
  })
  
  return balance
}

function calculateVariability(scores) {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  return Math.round(Math.sqrt(variance) * 10) / 10
}

function calculateCategoryGrowth(entries, category) {
  const categoryEntries = entries.filter(e => e.category === category)
  return {
    count: categoryEntries.length,
    percentage: Math.round((categoryEntries.length / entries.length) * 100),
    trend: 'stable' // Simplified
  }
}

function calculateEmotionalIntelligenceGrowth(entries) {
  // Simplified EI calculation based on emotion variety and self-awareness entries
  const emotionVariety = new Set(entries.map(e => e.emotion)).size
  const selfAwarenessEntries = entries.filter(e => e.category === 'self-awareness').length
  
  return {
    emotionVariety,
    selfAwarenessCount: selfAwarenessEntries,
    score: Math.min(10, emotionVariety + Math.floor(selfAwarenessEntries / 2))
  }
}

function identifyMilestones(entries) {
  const milestones = []
  
  if (entries.length >= 7) milestones.push('First week of journaling')
  if (entries.length >= 30) milestones.push('One month of journaling')
  if (entries.length >= 100) milestones.push('100 journal entries')
  
  return milestones
}

function generatePatternRecommendations(patterns) {
  return [
    'Consider journaling at the same time each day to build consistency',
    'Explore writing about different emotional states to increase self-awareness',
    'Try varying your writing locations or times to see how it affects your entries'
  ]
}

function generateEmotionalRecommendations(emotionFreq, moodTrend) {
  const recommendations = []
  
  if (moodTrend === 'declining') {
    recommendations.push('Consider incorporating more gratitude practices into your journaling')
  }
  
  if (emotionFreq.anxious > emotionFreq.calm || 0) {
    recommendations.push('Try writing about calming activities or peaceful moments')
  }
  
  return recommendations
}

function generateGrowthRecommendations(growthIndicators) {
  return [
    'Continue exploring self-awareness topics to deepen self-understanding',
    'Consider setting specific goals to track in your journal',
    'Reflect on your relationships and how they contribute to your growth'
  ]
}

function extractCommonThemes(entries) {
  const allTags = entries.flatMap(e => e.tags || [])
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag)
}

function identifyCurrentChallenges(entries) {
  const recentEntries = entries.slice(0, 5)
  const challengeTags = recentEntries.flatMap(e => e.tags || []).filter(tag => 
    ['challenge', 'struggle', 'difficult'].includes(tag)
  )
  
  return [...new Set(challengeTags)]
}

function identifyStrengths(entries) {
  const strengthTags = entries.flatMap(e => e.tags || []).filter(tag => 
    ['growth', 'gratitude', 'creativity', 'relationships'].includes(tag)
  )
  
  return [...new Set(strengthTags)]
}

function calculateJournalingFrequency(entries) {
  if (entries.length < 7) return 'new'
  
  const daysSinceFirst = Math.floor((new Date() - new Date(entries[entries.length - 1].date)) / (1000 * 60 * 60 * 24))
  const frequency = entries.length / daysSinceFirst
  
  if (frequency > 0.8) return 'daily'
  if (frequency > 0.4) return 'regular'
  if (frequency > 0.2) return 'occasional'
  return 'infrequent'
}