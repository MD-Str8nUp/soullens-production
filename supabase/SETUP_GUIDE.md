# SoulLens AI Database Setup Guide

## Overview
This guide will help you set up your Supabase database with all the necessary tables and configurations for SoulLens AI.

## Prerequisites
- Supabase project created (✅ Done - nhmwqldsidcxfdvvcdst)
- Environment variables configured (✅ Done)
- Supabase client configured (✅ Done)

## Step 1: Apply Database Schema

1. Open your Supabase dashboard: https://supabase.com/dashboard/project/nhmwqldsidcxfdvvcdst
2. Navigate to the SQL Editor (left sidebar)
3. Create a new query
4. Copy the contents of `supabase/schema.sql` and paste it into the SQL Editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, journal_entries, conversations, etc.)
- Indexes for performance
- Row Level Security policies
- Triggers for automatic timestamp updates
- Views for common queries

## Step 2: Apply Seed Data (Optional)

1. In the SQL Editor, create another new query
2. Copy the contents of `supabase/seed.sql` and paste it
3. Click "Run" to execute the seed data

This will add:
- Sample journal questions
- Conversation categories
- AI personas
- A function to generate sample data for users

## Step 3: Enable Authentication (If not already enabled)

1. Go to Authentication → Settings in your Supabase dashboard
2. Make sure the following are enabled:
   - Enable email confirmations: OFF (for easier testing)
   - Enable sign ups: ON
   - JWT expiry: 3600 (1 hour)

## Step 4: Test the Connection

Your application should now be connected to Supabase! The API routes have been updated to:

- **Journal Entries**: Store and retrieve from `journal_entries` table
- **Conversations**: Store and retrieve from `conversations` table  
- **Insights**: Fetch real data from database (with mock data fallback)

## Database Tables Created

### Core Tables
- `profiles` - User profiles (extends auth.users)
- `journal_entries` - All journal entries with emotions, tags, etc.
- `conversations` - Chat conversations with AI
- `journal_insights` - Cached insights for performance
- `user_settings` - User preferences and settings
- `chat_sessions` - Individual chat session tracking

### Security Features
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on user signup
- Secure data isolation

## Next Steps

1. **Run the SQL files** in your Supabase dashboard as described above
2. **Test the application** - try creating journal entries and conversations
3. **Add authentication** to your frontend if not already implemented
4. **Monitor the database** in Supabase dashboard to see data being created

## Troubleshooting

### If you get permission errors:
- Make sure RLS policies are correctly applied
- Check that auth.uid() returns a valid user ID
- Verify users are properly authenticated

### If tables don't exist:
- Re-run the schema.sql file
- Check for any SQL errors in the Supabase logs

### If data isn't saving:
- Check the browser console for errors
- Verify API routes are working in your Next.js app
- Test the Supabase connection in the browser developer tools

## Environment Variables (Already Configured)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nhmwqldsidcxfdvvcdst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obXdxbGRzaWRjeGZkdnZjZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIzNjAsImV4cCI6MjA2NDYwODM2MH0.O2ccJUNXZVxUWVHG0PcwmQ2NFfQO0gjY019qeghmV3M
```

Your backend is now fully connected to Supabase! 🎉