import { NextResponse } from 'next/server'
import { supabase } from '../../../../utils/supabase.js'

export async function GET(request) {
  try {
    // Fetch entries from Supabase, sorted by timestamp (newest first)
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch entries from database' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      entries: entries || [],
      count: entries?.length || 0
    })
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const entryData = await request.json()
    
    // Validate required fields
    if (!entryData.content || !entryData.emotion || !entryData.question) {
      return NextResponse.json(
        { error: 'Missing required fields: content, emotion, question' },
        { status: 400 }
      )
    }
    
    // Create entry object
    const entry = {
      date: entryData.date || new Date().toISOString().split('T')[0],
      timestamp: entryData.timestamp || new Date().toISOString(),
      question: entryData.question,
      content: entryData.content,
      emotion: entryData.emotion,
      category: entryData.category || 'self-awareness',
      word_count: entryData.content.split(' ').length,
      mood_score: calculateMoodScore(entryData.emotion),
      tags: extractTags(entryData.content),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Save to Supabase
    const { data: savedEntry, error } = await supabase
      .from('journal_entries')
      .insert([entry])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save entry to database' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Entry saved successfully',
      entry: savedEntry
    })
  } catch (error) {
    console.error('Error saving journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to save entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id, ...updateData } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }
    
    // Update entry in Supabase
    const { data: updatedEntry, error } = await supabase
      .from('journal_entries')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Entry not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update entry in database' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Entry updated successfully',
      entry: updatedEntry
    })
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }
    
    // Delete entry from Supabase
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Supabase error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Entry not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to delete entry from database' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Entry deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}

// Helper function to calculate mood score based on emotion
function calculateMoodScore(emotion) {
  const moodScores = {
    'happy': 5,
    'excited': 5,
    'calm': 4,
    'neutral': 3,
    'sad': 2,
    'anxious': 2
  }
  return moodScores[emotion] || 3
}

// Helper function to extract tags from content
function extractTags(content) {
  const text = content.toLowerCase()
  const tags = []
  
  // Simple keyword-based tagging
  const tagKeywords = {
    'gratitude': ['grateful', 'thankful', 'appreciate', 'blessed'],
    'growth': ['learn', 'grow', 'improve', 'develop', 'progress'],
    'challenge': ['difficult', 'challenge', 'struggle', 'hard', 'tough'],
    'relationships': ['friend', 'family', 'partner', 'relationship', 'connect'],
    'work': ['work', 'job', 'career', 'office', 'project'],
    'health': ['exercise', 'tired', 'energy', 'sleep', 'workout'],
    'creativity': ['create', 'art', 'music', 'write', 'creative'],
    'goals': ['goal', 'dream', 'plan', 'future', 'aspire']
  }
  
  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag)
    }
  })
  
  return tags
}