export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_call_logs: {
        Row: {
          appointment_id: string | null
          call_duration: number | null
          caller_phone: string | null
          created_at: string
          id: string
          outcome: string | null
          practice_id: string
          provider: string | null
          transcript: string | null
        }
        Insert: {
          appointment_id?: string | null
          call_duration?: number | null
          caller_phone?: string | null
          created_at?: string
          id?: string
          outcome?: string | null
          practice_id: string
          provider?: string | null
          transcript?: string | null
        }
        Update: {
          appointment_id?: string | null
          call_duration?: number | null
          caller_phone?: string | null
          created_at?: string
          id?: string
          outcome?: string | null
          practice_id?: string
          provider?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_call_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_call_logs_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "mv_practice_stats"
            referencedColumns: ["practice_id"]
          },
          {
            foreignKeyName: "ai_call_logs_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          ai_booked: boolean | null
          appointment_date: string
          appointment_time: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          practice_id: string
          service: string
          service_id: string | null
          sms_reminder_sent: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_booked?: boolean | null
          appointment_date: string
          appointment_time: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          practice_id: string
          service: string
          service_id?: string | null
          sms_reminder_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_booked?: boolean | null
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          practice_id?: string
          service?: string
          service_id?: string | null
          sms_reminder_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "mv_practice_stats"
            referencedColumns: ["practice_id"]
          },
          {
            foreignKeyName: "appointments_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "practice_services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string | null
          practice_id: string
          request_type: string
          requested_by_email: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          practice_id: string
          request_type: string
          requested_by_email: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          practice_id?: string
          request_type?: string
          requested_by_email?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_requests_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "mv_practice_stats"
            referencedColumns: ["practice_id"]
          },
          {
            foreignKeyName: "data_requests_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          note_type: string
          patient_id: string
          practice_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          note_type?: string
          patient_id: string
          practice_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          note_type?: string
          patient_id?: string
          practice_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          consent_date: string | null
          country: string | null
          created_at: string
          data_retention_until: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          postal_code: string | null
          practice_id: string
          privacy_consent: boolean
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          consent_date?: string | null
          country?: string | null
          created_at?: string
          data_retention_until?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          postal_code?: string | null
          practice_id: string
          privacy_consent?: boolean
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          consent_date?: string | null
          country?: string | null
          created_at?: string
          data_retention_until?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          practice_id?: string
          privacy_consent?: boolean
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "mv_practice_stats"
            referencedColumns: ["practice_id"]
          },
          {
            foreignKeyName: "patients_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          name: string
          practice_id: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name: string
          practice_id: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          name?: string
          practice_id?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      practices: {
        Row: {
          address: string | null
          ai_prompt: string | null
          ai_voice_settings: Json | null
          business_hours: Json | null
          created_at: string
          email: string | null
          id: string
          n8n_enabled: boolean | null
          n8n_webhook_url: string | null
          name: string
          owner_id: string
          phone: string | null
          practice_type: string
          retell_agent_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          ai_prompt?: string | null
          ai_voice_settings?: Json | null
          business_hours?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          n8n_enabled?: boolean | null
          n8n_webhook_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          practice_type?: string
          retell_agent_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          ai_prompt?: string | null
          ai_voice_settings?: Json | null
          business_hours?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          n8n_enabled?: boolean | null
          n8n_webhook_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          practice_type?: string
          retell_agent_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recurring_appointments: {
        Row: {
          created_at: string
          day_of_month: number | null
          days_of_week: number[] | null
          duration_minutes: number | null
          end_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          patient_id: string
          practice_id: string
          recurrence_interval: number
          recurrence_type: string
          service: string
          start_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          days_of_week?: number[] | null
          duration_minutes?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id: string
          practice_id: string
          recurrence_interval?: number
          recurrence_type: string
          service: string
          start_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          days_of_week?: number[] | null
          duration_minutes?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id?: string
          practice_id?: string
          recurrence_interval?: number
          recurrence_type?: string
          service?: string
          start_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recurring_appointments_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recurring_appointments_practice_id"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "mv_practice_stats"
            referencedColumns: ["practice_id"]
          },
          {
            foreignKeyName: "fk_recurring_appointments_practice_id"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_reminders: {
        Row: {
          appointment_id: string
          created_at: string
          error_message: string | null
          id: string
          message: string
          patient_phone: string
          practice_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          patient_phone: string
          practice_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          patient_phone?: string
          practice_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_features_enabled: boolean | null
          created_at: string
          features: Json
          id: string
          max_patients: number | null
          max_practices: number | null
          name: string
          price_monthly: number
          price_yearly: number
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          ai_features_enabled?: boolean | null
          created_at?: string
          features?: Json
          id?: string
          max_patients?: number | null
          max_practices?: number | null
          name: string
          price_monthly: number
          price_yearly: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          ai_features_enabled?: boolean | null
          created_at?: string
          features?: Json
          id?: string
          max_patients?: number | null
          max_practices?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_phone_numbers: {
        Row: {
          area_code: string | null
          country_code: string
          created_at: string
          id: string
          is_active: boolean
          is_verified: boolean
          phone_number: string
          provider: string | null
          retell_phone_id: string | null
          updated_at: string
          user_id: string
          vapi_assistant_id: string | null
          vapi_phone_id: string | null
        }
        Insert: {
          area_code?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number: string
          provider?: string | null
          retell_phone_id?: string | null
          updated_at?: string
          user_id: string
          vapi_assistant_id?: string | null
          vapi_phone_id?: string | null
        }
        Update: {
          area_code?: string | null
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number?: string
          provider?: string | null
          retell_phone_id?: string | null
          updated_at?: string
          user_id?: string
          vapi_assistant_id?: string | null
          vapi_phone_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_practice_stats: {
        Row: {
          ai_booked_count: number | null
          appointments_next_7d: number | null
          avg_duration_minutes: number | null
          cancelled_appointments: number | null
          completed_appointments: number | null
          last_appointment_update: string | null
          new_patients_30d: number | null
          pending_appointments: number | null
          practice_id: string | null
          practice_name: string | null
          total_appointments: number | null
          total_patients: number | null
          upcoming_appointments: number | null
        }
        Relationships: []
      }
      public_pricing: {
        Row: {
          ai_features_enabled: boolean | null
          has_advanced_analytics: boolean | null
          has_custom_branding: boolean | null
          has_premium_support: boolean | null
          id: string | null
          max_patients: number | null
          max_practices: number | null
          name: string | null
          price_monthly: number | null
          price_yearly: number | null
        }
        Insert: {
          ai_features_enabled?: boolean | null
          has_advanced_analytics?: never
          has_custom_branding?: never
          has_premium_support?: never
          id?: string | null
          max_patients?: number | null
          max_practices?: number | null
          name?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Update: {
          ai_features_enabled?: boolean | null
          has_advanced_analytics?: never
          has_custom_branding?: never
          has_premium_support?: never
          id?: string | null
          max_patients?: number | null
          max_practices?: number | null
          name?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_expired_patient_data: { Args: never; Returns: undefined }
      cleanup_expired_patient_data: { Args: never; Returns: undefined }
      cleanup_old_ai_call_logs: { Args: never; Returns: undefined }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_within_business_hours: {
        Args: { _current_time?: string; _practice_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _new_values?: Json
          _old_values?: Json
          _resource_id?: string
          _resource_type: string
        }
        Returns: string
      }
      refresh_practice_stats: { Args: never; Returns: undefined }
      user_owns_practice: { Args: { _practice_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
