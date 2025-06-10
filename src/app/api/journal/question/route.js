import { NextResponse } from 'next/server'

// Question categories with different types of questions
const questionCategories = {
  'self-awareness': [
    "What's one thing you learned about yourself today?",
    "How did you handle a challenging situation recently, and what does that reveal about your character?",
    "What patterns do you notice in your thoughts or behaviors this week?",
    "If you could give your past self one piece of advice, what would it be?",
    "What's something you're avoiding, and why do you think that is?",
    "What does success mean to you right now in your life?",
    "How do you typically respond to stress, and is this serving you well?",
    "What's a belief about yourself that you'd like to challenge or explore?",
    "What aspects of your personality do you appreciate most?",
    "How have your priorities changed over the past year?"
  ],
  'relationships': [
    "How did you connect with someone meaningful today?",
    "What's one way you showed love or appreciation to someone recently?",
    "How do you feel most supported by the people in your life?",
    "What's a relationship that brings you joy, and why?",
    "How do you handle conflict in your relationships?",
    "What's something you'd like to communicate better to someone you care about?",
    "How do you show up for the people who matter to you?",
    "What have you learned from a difficult relationship experience?",
    "How do you maintain boundaries while staying connected to others?",
    "What qualities do you most value in your friendships?"
  ],
  'goals': [
    "What's one small step you took toward a goal today?",
    "What dream or aspiration is calling to you right now?",
    "How do you stay motivated when progress feels slow?",
    "What's something you accomplished recently that you're proud of?",
    "What obstacles are you facing in pursuing your goals, and how might you overcome them?",
    "How do your current goals align with your values?",
    "What's a skill you'd like to develop, and why?",
    "How do you define progress in your personal growth?",
    "What's holding you back from pursuing something you want?",
    "What would you attempt if you knew you couldn't fail?"
  ],
  'emotions': [
    "What emotion have you been experiencing most frequently lately?",
    "How do you typically process difficult emotions?",
    "What brought you genuine joy or happiness recently?",
    "How do you show yourself compassion during tough times?",
    "What's something you're grateful for today, and how does it make you feel?",
    "How do you honor your emotions without being overwhelmed by them?",
    "What helps you feel grounded when life feels chaotic?",
    "How do you celebrate your wins, both big and small?",
    "What emotion do you find most challenging to experience, and why?",
    "How has your emotional awareness grown over time?"
  ]
}

// Store used questions to avoid repetition (in a real app, this would be in a database)
let usedQuestions = new Set()

function getPersonalizedQuestion(userHistory = []) {
  // Analyze user's journal history to determine preferred categories
  const categoryScores = {
    'self-awareness': 0,
    'relationships': 0,
    'goals': 0,
    'emotions': 0
  }

  // Score categories based on past entries (simplified logic)
  userHistory.forEach(entry => {
    if (entry.category) {
      categoryScores[entry.category] += 1
    }
  })

  // Determine which category to focus on
  let selectedCategory
  const totalEntries = userHistory.length

  if (totalEntries === 0) {
    // For new users, start with self-awareness
    selectedCategory = 'self-awareness'
  } else if (totalEntries < 5) {
    // Cycle through different categories for new users
    const categories = Object.keys(questionCategories)
    selectedCategory = categories[totalEntries % categories.length]
  } else {
    // For experienced users, prefer less explored categories
    const sortedCategories = Object.entries(categoryScores)
      .sort((a, b) => a[1] - b[1])
      .map(([category]) => category)
    
    // Pick from the least used categories
    selectedCategory = sortedCategories[Math.floor(Math.random() * 2)]
  }

  // Get available questions from the selected category
  const categoryQuestions = questionCategories[selectedCategory]
  const availableQuestions = categoryQuestions.filter(q => !usedQuestions.has(q))

  // If all questions in category are used, reset and pick any
  if (availableQuestions.length === 0) {
    usedQuestions.clear()
    return {
      question: categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)],
      category: selectedCategory
    }
  }

  // Select random question from available ones
  const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
  usedQuestions.add(selectedQuestion)

  return {
    question: selectedQuestion,
    category: selectedCategory
  }
}

export async function GET(request) {
  try {
    // In a real app, you'd get user's journal history from database
    // For now, we'll use a simple question selection
    const questionData = getPersonalizedQuestion([])
    
    return NextResponse.json({
      question: questionData.question,
      category: questionData.category,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating question:', error)
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { regenerate, userHistory } = await request.json()
    
    if (regenerate) {
      // Force a new question generation
      const questionData = getPersonalizedQuestion(userHistory || [])
      
      return NextResponse.json({
        question: questionData.question,
        category: questionData.category,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error handling question request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}