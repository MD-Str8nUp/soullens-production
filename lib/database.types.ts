export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          archived_at: string | null
          conversation_title: string | null
          device_platform: string | null
          id: string
          is_synced: boolean | null
          last_message_at: string | null
          message_count: number | null
          persona_used: string | null
          session_type: string | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          conversation_title?: string | null
          device_platform?: string | null
          id?: string
          is_synced?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          persona_used?: string | null
          session_type?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          conversation_title?: string | null
          device_platform?: string | null
          id?: string
          is_synced?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          persona_used?: string | null
          session_type?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          action_taken: boolean | null
          category: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          insight_text: string
          is_read: boolean | null
          relevance_score: number | null
          source: string | null
          triggered_by_message_id: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: boolean | null
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insight_text: string
          is_read?: boolean | null
          relevance_score?: number | null
          source?: string | null
          triggered_by_message_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: boolean | null
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insight_text?: string
          is_read?: boolean | null
          relevance_score?: number | null
          source?: string | null
          triggered_by_message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_triggered_by_message_id_fkey"
            columns: ["triggered_by_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          ai_insights: string[] | null
          content: string
          created_at: string | null
          id: string
          is_synced: boolean | null
          local_id: string | null
          location_context: string | null
          mood: number | null
          mood_tags: string[] | null
          photos_attached: string[] | null
          reflection_prompts: string[] | null
          user_id: string | null
          word_count: number | null
        }
        Insert: {
          ai_insights?: string[] | null
          content: string
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          local_id?: string | null
          location_context?: string | null
          mood?: number | null
          mood_tags?: string[] | null
          photos_attached?: string[] | null
          reflection_prompts?: string[] | null
          user_id?: string | null
          word_count?: number | null
        }
        Update: {
          ai_insights?: string[] | null
          content?: string
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          local_id?: string | null
          location_context?: string | null
          mood?: number | null
          mood_tags?: string[] | null
          photos_attached?: string[] | null
          reflection_prompts?: string[] | null
          user_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          edited_at: string | null
          id: string
          is_synced: boolean | null
          local_id: string | null
          parent_message_id: string | null
          persona: string | null
          response_time_ms: number | null
          role: string
          sentiment_score: number | null
          timestamp: string | null
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          edited_at?: string | null
          id?: string
          is_synced?: boolean | null
          local_id?: string | null
          parent_message_id?: string | null
          persona?: string | null
          response_time_ms?: number | null
          role: string
          sentiment_score?: number | null
          timestamp?: string | null
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          edited_at?: string | null
          id?: string
          is_synced?: boolean | null
          local_id?: string | null
          parent_message_id?: string | null
          persona?: string | null
          response_time_ms?: number | null
          role?: string
          sentiment_score?: number | null
          timestamp?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_analytics: {
        Row: {
          app_version: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          platform: string | null
          screen_name: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          platform?: string | null
          screen_name?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          platform?: string | null
          screen_name?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          body: string
          data: Json | null
          device_tokens: string[] | null
          failure_reason: string | null
          id: string
          notification_type: string | null
          opened_at: string | null
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          data?: Json | null
          device_tokens?: string[] | null
          failure_reason?: string | null
          id?: string
          notification_type?: string | null
          opened_at?: string | null
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          data?: Json | null
          device_tokens?: string[] | null
          failure_reason?: string | null
          id?: string
          notification_type?: string | null
          opened_at?: string | null
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      program_lessons: {
        Row: {
          completion_criteria: Json | null
          created_at: string | null
          day_number: number
          estimated_duration: number | null
          id: string
          integration_prompts: Json | null
          learning_objectives: string[] | null
          lesson_content: Json
          program_id: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completion_criteria?: Json | null
          created_at?: string | null
          day_number: number
          estimated_duration?: number | null
          id?: string
          integration_prompts?: Json | null
          learning_objectives?: string[] | null
          lesson_content: Json
          program_id?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completion_criteria?: Json | null
          created_at?: string | null
          day_number?: number
          estimated_duration?: number | null
          id?: string
          integration_prompts?: Json | null
          learning_objectives?: string[] | null
          lesson_content?: Json
          program_id?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_lessons_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_lessons_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "user_program_dashboard"
            referencedColumns: ["program_id"]
          },
        ]
      }
      program_milestones: {
        Row: {
          achieved_date: string
          celebration_shown: boolean | null
          created_at: string | null
          id: string
          milestone_data: Json
          milestone_type: string
          user_id: string | null
          user_program_id: string | null
        }
        Insert: {
          achieved_date?: string
          celebration_shown?: boolean | null
          created_at?: string | null
          id?: string
          milestone_data: Json
          milestone_type: string
          user_id?: string | null
          user_program_id?: string | null
        }
        Update: {
          achieved_date?: string
          celebration_shown?: boolean | null
          created_at?: string | null
          id?: string
          milestone_data?: Json
          milestone_type?: string
          user_id?: string | null
          user_program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_milestones_user_program_id_fkey"
            columns: ["user_program_id"]
            isOneToOne: false
            referencedRelation: "user_program_dashboard"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "program_milestones_user_program_id_fkey"
            columns: ["user_program_id"]
            isOneToOne: false
            referencedRelation: "user_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_progress: {
        Row: {
          ai_integration_used: boolean | null
          completed_date: string | null
          completion_data: Json | null
          completion_status: string
          created_at: string | null
          id: string
          journal_entry_id: string | null
          lesson_id: string | null
          lesson_rating: number | null
          reflection_notes: string | null
          time_spent: number | null
          updated_at: string | null
          user_id: string | null
          user_program_id: string | null
        }
        Insert: {
          ai_integration_used?: boolean | null
          completed_date?: string | null
          completion_data?: Json | null
          completion_status?: string
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          lesson_id?: string | null
          lesson_rating?: number | null
          reflection_notes?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_program_id?: string | null
        }
        Update: {
          ai_integration_used?: boolean | null
          completed_date?: string | null
          completion_data?: Json | null
          completion_status?: string
          created_at?: string | null
          id?: string
          journal_entry_id?: string | null
          lesson_id?: string | null
          lesson_rating?: number | null
          reflection_notes?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_progress_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "program_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_progress_user_program_id_fkey"
            columns: ["user_program_id"]
            isOneToOne: false
            referencedRelation: "user_program_dashboard"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "program_progress_user_program_id_fkey"
            columns: ["user_program_id"]
            isOneToOne: false
            referencedRelation: "user_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          category: string
          created_at: string | null
          description: string
          detailed_description: string | null
          difficulty_level: string
          duration_days: number
          id: string
          is_active: boolean | null
          learning_outcomes: string[] | null
          name: string
          prerequisites: string[] | null
          preview_content: Json | null
          sample_structure: Json | null
          slug: string
          sort_order: number | null
          success_metrics: Json | null
          tagline: string | null
          tier_required: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          detailed_description?: string | null
          difficulty_level: string
          duration_days: number
          id?: string
          is_active?: boolean | null
          learning_outcomes?: string[] | null
          name: string
          prerequisites?: string[] | null
          preview_content?: Json | null
          sample_structure?: Json | null
          slug: string
          sort_order?: number | null
          success_metrics?: Json | null
          tagline?: string | null
          tier_required?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          detailed_description?: string | null
          difficulty_level?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          learning_outcomes?: string[] | null
          name?: string
          prerequisites?: string[] | null
          preview_content?: Json | null
          sample_structure?: Json | null
          slug?: string
          sort_order?: number | null
          success_metrics?: Json | null
          tagline?: string | null
          tier_required?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          data: Json | null
          event_type: string | null
          id: string
          platform: string | null
          subscription_period_end: string | null
          subscription_period_start: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          data?: Json | null
          event_type?: string | null
          id?: string
          platform?: string | null
          subscription_period_end?: string | null
          subscription_period_start?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          data?: Json | null
          event_type?: string | null
          id?: string
          platform?: string | null
          subscription_period_end?: string | null
          subscription_period_start?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_queue: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          last_error: string | null
          operation: string | null
          record_id: string
          retry_count: number | null
          synced_at: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          last_error?: string | null
          operation?: string | null
          record_id: string
          retry_count?: number | null
          synced_at?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          last_error?: string | null
          operation?: string | null
          record_id?: string
          retry_count?: number | null
          synced_at?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          ai_calls_made: number | null
          app_opens: number | null
          background_time_minutes: number | null
          crash_count: number | null
          date: string | null
          features_accessed: string[] | null
          id: string
          insights_generated: number | null
          journal_entries: number | null
          messages_sent: number | null
          personas_used: string[] | null
          push_notifications_opened: number | null
          session_count: number | null
          total_time_minutes: number | null
          user_id: string | null
        }
        Insert: {
          ai_calls_made?: number | null
          app_opens?: number | null
          background_time_minutes?: number | null
          crash_count?: number | null
          date?: string | null
          features_accessed?: string[] | null
          id?: string
          insights_generated?: number | null
          journal_entries?: number | null
          messages_sent?: number | null
          personas_used?: string[] | null
          push_notifications_opened?: number | null
          session_count?: number | null
          total_time_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          ai_calls_made?: number | null
          app_opens?: number | null
          background_time_minutes?: number | null
          crash_count?: number | null
          date?: string | null
          features_accessed?: string[] | null
          id?: string
          insights_generated?: number | null
          journal_entries?: number | null
          messages_sent?: number | null
          personas_used?: string[] | null
          push_notifications_opened?: number | null
          session_count?: number | null
          total_time_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_patterns: {
        Row: {
          confidence_score: number | null
          data_points: number | null
          description: string
          evidence_messages: string[] | null
          id: string
          identified_at: string | null
          is_active: boolean | null
          last_updated: string | null
          pattern_type: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          data_points?: number | null
          description: string
          evidence_messages?: string[] | null
          id?: string
          identified_at?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          pattern_type?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          data_points?: number | null
          description?: string
          evidence_messages?: string[] | null
          id?: string
          identified_at?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          pattern_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          ai_companion_name: string | null
          created_at: string | null
          goals: string[] | null
          name: string | null
          onboarding_complete: boolean | null
          preferred_notification_time: string | null
          privacy_settings: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          ai_companion_name?: string | null
          created_at?: string | null
          goals?: string[] | null
          name?: string | null
          onboarding_complete?: boolean | null
          preferred_notification_time?: string | null
          privacy_settings?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          ai_companion_name?: string | null
          created_at?: string | null
          goals?: string[] | null
          name?: string | null
          onboarding_complete?: boolean | null
          preferred_notification_time?: string | null
          privacy_settings?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_programs: {
        Row: {
          completed_date: string | null
          completion_percentage: number | null
          created_at: string | null
          current_day: number | null
          id: string
          last_activity_date: string | null
          program_id: string | null
          settings: Json | null
          started_date: string
          status: string
          streak_count: number | null
          total_time_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_date?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          current_day?: number | null
          id?: string
          last_activity_date?: string | null
          program_id?: string | null
          settings?: Json | null
          started_date?: string
          status?: string
          streak_count?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_date?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          current_day?: number | null
          id?: string
          last_activity_date?: string | null
          program_id?: string | null
          settings?: Json | null
          started_date?: string
          status?: string
          streak_count?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "user_program_dashboard"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "user_programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          app_version: string | null
          crash_occurred: boolean | null
          device_model: string | null
          id: string
          messages_sent: number | null
          network_type: string | null
          os_version: string | null
          pages_visited: string[] | null
          platform: string | null
          push_notification_source: string | null
          session_duration_seconds: number | null
          session_end: string | null
          session_start: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          crash_occurred?: boolean | null
          device_model?: string | null
          id?: string
          messages_sent?: number | null
          network_type?: string | null
          os_version?: string | null
          pages_visited?: string[] | null
          platform?: string | null
          push_notification_source?: string | null
          session_duration_seconds?: number | null
          session_end?: string | null
          session_start?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          crash_occurred?: boolean | null
          device_model?: string | null
          id?: string
          messages_sent?: number | null
          network_type?: string | null
          os_version?: string | null
          pages_visited?: string[] | null
          platform?: string | null
          push_notification_source?: string | null
          session_duration_seconds?: number | null
          session_end?: string | null
          session_start?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          app_version: string | null
          apple_id: string | null
          created_at: string | null
          deletion_requested_at: string | null
          device_tokens: string[] | null
          email: string | null
          google_id: string | null
          id: string
          is_banned: boolean | null
          last_active: string | null
          phone: string | null
          platform: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
        }
        Insert: {
          app_version?: string | null
          apple_id?: string | null
          created_at?: string | null
          deletion_requested_at?: string | null
          device_tokens?: string[] | null
          email?: string | null
          google_id?: string | null
          id?: string
          is_banned?: boolean | null
          last_active?: string | null
          phone?: string | null
          platform?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          app_version?: string | null
          apple_id?: string | null
          created_at?: string | null
          deletion_requested_at?: string | null
          device_tokens?: string[] | null
          email?: string | null
          google_id?: string | null
          id?: string
          is_banned?: boolean | null
          last_active?: string | null
          phone?: string | null
          platform?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_program_dashboard: {
        Row: {
          completed_today: boolean | null
          completion_percentage: number | null
          current_day: number | null
          difficulty_level: string | null
          duration_days: number | null
          enrollment_id: string | null
          last_activity_date: string | null
          next_lesson_title: string | null
          program_id: string | null
          program_name: string | null
          program_slug: string | null
          started_date: string | null
          status: string | null
          streak_count: number | null
          tagline: string | null
          tier_required: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_program_access: {
        Args: { program_tier: string; user_subscription_tier: string }
        Returns: boolean
      }
      check_trial_status: {
        Args: { user_uuid?: string }
        Returns: {
          is_trial_active: boolean
          days_remaining: number
          messages_today: number
          can_send_message: boolean
          trial_limits: Json
          subscription_tier: string
        }[]
      }
      get_mobile_dashboard: {
        Args: { user_uuid?: string }
        Returns: Json
      }
      schedule_mobile_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      track_mobile_usage: {
        Args: {
          p_event_type: string
          p_platform?: string
          p_app_version?: string
          p_event_data?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
