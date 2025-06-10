import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Start with base query
    let query = supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    
    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Apply search filter (basic text search)
    if (search) {
      query = query.or(`title.ilike.%${search}%,messages.cs.${JSON.stringify([{content: search}])}`);
    }
    
    // Apply limit
    query = query.limit(limit);
    
    const { data: conversations, error, count } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations from database' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      conversations: conversations || [],
      total: count || conversations?.length || 0
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title, messages, category, relatedJournalEntries = [] } = await request.json();
    
    const newConversation = {
      title: title || generateConversationTitle(messages),
      category: category || categorizeConversation(messages),
      messages,
      related_journal_entries: relatedJournalEntries,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: savedConversation, error } = await supabase
      .from('conversations')
      .insert([newConversation])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save conversation to database' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(savedConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, title, messages, category, relatedJournalEntries } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (title !== undefined) updateData.title = title;
    if (messages !== undefined) updateData.messages = messages;
    if (category !== undefined) updateData.category = category;
    if (relatedJournalEntries !== undefined) updateData.related_journal_entries = relatedJournalEntries;
    
    const { data: updatedConversation, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update conversation in database' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

function generateConversationTitle(messages) {
  if (!messages || messages.length === 0) return 'New Conversation';
  
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (!firstUserMessage) return 'New Conversation';
  
  // Extract first meaningful phrase from user message
  const content = firstUserMessage.content.trim();
  const words = content.split(' ').slice(0, 6).join(' ');
  return words.length > 50 ? words.substring(0, 50) + '...' : words;
}

function categorizeConversation(messages) {
  if (!messages || messages.length === 0) return 'General';
  
  const allText = messages.map(msg => msg.content.toLowerCase()).join(' ');
  
  const categories = {
    'Advice': ['advice', 'help', 'should i', 'what do you think', 'recommend', 'suggestion'],
    'Venting': ['frustrated', 'angry', 'upset', 'annoyed', 'hate', 'can\'t believe', 'so tired'],
    'Goals': ['goal', 'want to', 'plan', 'achieve', 'improve', 'better at', 'work on'],
    'Relationships': ['relationship', 'friend', 'family', 'partner', 'boyfriend', 'girlfriend', 'marriage'],
    'Work': ['job', 'work', 'career', 'boss', 'colleague', 'office', 'professional'],
    'Health': ['health', 'exercise', 'diet', 'sleep', 'stress', 'anxiety', 'depression'],
    'Ideas': ['idea', 'thinking about', 'what if', 'creative', 'project', 'start']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      return category;
    }
  }
  
  return 'General';
}