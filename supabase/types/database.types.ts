// TypeScript types for Marvin AR Morning Assistant database
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string | null
          preferences: Json
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name?: string | null
          preferences?: Json
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string | null
          preferences?: Json
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      object_interactions: {
        Row: {
          id: string
          user_id: string
          object_type: string
          interaction_type: string
          spatial_data: Json | null
          confidence_score: number
          context: Json
          timestamp: string
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          object_type: string
          interaction_type: string
          spatial_data?: Json | null
          confidence_score?: number
          context?: Json
          timestamp?: string
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          object_type?: string
          interaction_type?: string
          spatial_data?: Json | null
          confidence_score?: number
          context?: Json
          timestamp?: string
          session_id?: string | null
          created_at?: string
        }
      }
      learning_data: {
        Row: {
          id: string
          user_id: string
          pattern_type: string
          pattern_data: Json
          confidence_score: number
          context: Json
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pattern_type: string
          pattern_data: Json
          confidence_score?: number
          context?: Json
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pattern_type?: string
          pattern_data?: Json
          confidence_score?: number
          context?: Json
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      medication_schedules: {
        Row: {
          id: string
          user_id: string
          medication_name: string
          dosage: string | null
          schedule_times: string[]
          days_of_week: number[]
          is_active: boolean
          reminder_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          medication_name: string
          dosage?: string | null
          schedule_times: string[]
          days_of_week?: number[]
          is_active?: boolean
          reminder_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          medication_name?: string
          dosage?: string | null
          schedule_times?: string[]
          days_of_week?: number[]
          is_active?: boolean
          reminder_settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      health_reminders: {
        Row: {
          id: string
          user_id: string
          medication_schedule_id: string
          scheduled_time: string
          status: string
          taken_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          medication_schedule_id: string
          scheduled_time: string
          status?: string
          taken_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          medication_schedule_id?: string
          scheduled_time?: string
          status?: string
          taken_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          food_item: string
          quantity: string | null
          calories: number | null
          nutritional_data: Json
          meal_type: string | null
          logged_at: string
          detection_confidence: number | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_item: string
          quantity?: string | null
          calories?: number | null
          nutritional_data?: Json
          meal_type?: string | null
          logged_at?: string
          detection_confidence?: number | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_item?: string
          quantity?: string | null
          calories?: number | null
          nutritional_data?: Json
          meal_type?: string | null
          logged_at?: string
          detection_confidence?: number | null
          image_url?: string | null
          created_at?: string
        }
      }
      nutrition_analysis: {
        Row: {
          id: string
          user_id: string
          date: string
          total_calories: number
          nutritional_breakdown: Json
          recommendations: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_calories?: number
          nutritional_breakdown?: Json
          recommendations?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_calories?: number
          nutritional_breakdown?: Json
          recommendations?: Json
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          external_event_id: string | null
          title: string
          description: string | null
          start_time: string
          end_time: string
          location: string | null
          event_type: string | null
          preparation_data: Json
          sync_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          external_event_id?: string | null
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location?: string | null
          event_type?: string | null
          preparation_data?: Json
          sync_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          external_event_id?: string | null
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          event_type?: string | null
          preparation_data?: Json
          sync_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      meeting_prep: {
        Row: {
          id: string
          user_id: string
          calendar_event_id: string
          preparation_items: Json
          status: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calendar_event_id: string
          preparation_items?: Json
          status?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calendar_event_id?: string
          preparation_items?: Json
          status?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      object_locations: {
        Row: {
          id: string
          user_id: string
          object_type: string
          object_identifier: string | null
          last_known_location: Json
          confidence_score: number
          last_seen_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          object_type: string
          object_identifier?: string | null
          last_known_location: Json
          confidence_score?: number
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          object_type?: string
          object_identifier?: string | null
          last_known_location?: Json
          confidence_score?: number
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      spatial_memory: {
        Row: {
          id: string
          user_id: string
          room_identifier: string
          layout_data: Json
          object_relationships: Json
          confidence_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_identifier: string
          layout_data: Json
          object_relationships?: Json
          confidence_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_identifier?: string
          layout_data?: Json
          object_relationships?: Json
          confidence_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_interactions: {
        Row: {
          id: string
          user_id: string
          interaction_type: string
          input_data: Json
          response_data: Json | null
          context: Json
          embedding: number[] | null
          session_id: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interaction_type: string
          input_data: Json
          response_data?: Json | null
          context?: Json
          embedding?: number[] | null
          session_id?: string | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interaction_type?: string
          input_data?: Json
          response_data?: Json | null
          context?: Json
          embedding?: number[] | null
          session_id?: string | null
          timestamp?: string
          created_at?: string
        }
      }
      learning_patterns: {
        Row: {
          id: string
          user_id: string
          pattern_type: string
          pattern_description: string | null
          pattern_data: Json
          confidence_score: number
          frequency: number
          last_observed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pattern_type: string
          pattern_description?: string | null
          pattern_data: Json
          confidence_score?: number
          frequency?: number
          last_observed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pattern_type?: string
          pattern_description?: string | null
          pattern_data?: Json
          confidence_score?: number
          frequency?: number
          last_observed?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_object_interaction: {
        Args: {
          p_user_id: string
          p_object_type: string
          p_interaction_type: string
          p_spatial_data?: Json
          p_confidence_score?: number
          p_context?: Json
        }
        Returns: string
      }
      analyze_interaction_patterns: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      update_object_location: {
        Args: {
          p_user_id: string
          p_object_type: string
          p_object_identifier: string
          p_location: Json
          p_confidence_score?: number
        }
        Returns: undefined
      }
      get_upcoming_health_reminders: {
        Args: {
          p_user_id: string
          p_hours_ahead?: number
        }
        Returns: {
          reminder_id: string
          medication_name: string
          scheduled_time: string
          time_until_reminder: unknown
        }[]
      }
      create_daily_medication_reminders: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      calculate_daily_nutrition: {
        Args: {
          p_user_id: string
          p_date?: string
        }
        Returns: Json
      }
      find_similar_interactions: {
        Args: {
          p_user_id: string
          p_embedding: number[]
          p_limit?: number
        }
        Returns: {
          interaction_id: string
          similarity: number
          interaction_type: string
          input_data: Json
          response_data: Json
          interaction_timestamp: string
        }[]
      }
      update_user_preferences: {
        Args: {
          p_user_id: string
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
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never