// Request/Response Types for Edge Functions

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VapiActionRequest {
  action: string;
  practiceId?: string;
  userPhoneId?: string;
  phoneNumber?: string;
  targetNumber?: string;
  areaCode?: string;
  countryCode?: string;
  phoneNumberId?: string;
  assistantId?: string;
  message?: string;
  callId?: string;
  reason?: string;
  priority?: string;
}

export interface Practice {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  ai_prompt?: string;
  ai_voice_settings?: any;
  n8n_webhook_url?: string;
  n8n_enabled?: boolean;
  owner_id: string;
}

export interface UserPhone {
  id: string;
  user_id: string;
  phone_number: string;
  country_code: string;
  provider: string;
  vapi_phone_id?: string;
  vapi_assistant_id?: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface Appointment {
  id: string;
  practice_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  status: string;
  notes?: string;
  duration_minutes: number;
  ai_booked: boolean;
}

export interface Patient {
  id: string;
  practice_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
}
