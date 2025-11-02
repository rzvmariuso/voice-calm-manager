import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

// Appointment Webhook Validation
export const appointmentWebhookSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  action: z.enum(['created', 'updated', 'cancelled', 'confirmed', 'rescheduled']),
  appointmentData: z.any().optional(),
  patientData: z.any().optional(),
  oldData: z.any().optional(),
});

// AI Booking Request Validation
export const aiBookingSchema = z.object({
  practiceId: z.string().uuid(),
  message: z.string().min(1).max(10000),
  callerPhone: z.string().optional(),
});

// Vapi Call Request Validation
export const vapiCallSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

// Practice ID Validation
export const practiceIdSchema = z.object({
  practiceId: z.string().uuid(),
});

// VAPI Action Schema
export const vapiActionSchema = z.object({
  action: z.enum([
    'create_assistant',
    'setup_inbound',
    'create_call',
    'get_phone_numbers',
    'buy_phone_number',
    'import_phone_number',
    'update_assistant',
    'list_assistants'
  ]),
  practiceId: z.string().uuid().optional(),
  userPhoneId: z.string().uuid().optional(),
  targetNumber: z.string().optional(),
  areaCode: z.string().optional(),
  countryCode: z.string().optional(),
  phoneNumberId: z.string().optional(),
  phoneNumber: z.string().optional(),
  assistantId: z.string().optional(),
  message: z.string().optional(),
});

// N8N Config Schema
export const n8nConfigSchema = z.object({
  practiceId: z.string().uuid(),
  webhookUrl: z.string().url().optional(),
  enabled: z.boolean().optional(),
});

// Booking Data Schema (for AI extraction)
export const bookingDataSchema = z.object({
  patient_name: z.string().min(1),
  patient_phone: z.string().min(5),
  service: z.string().min(1),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time: z.string().regex(/^\d{2}:\d{2}$/),
  confirmed: z.boolean(),
});

// Helper to validate data with Zod schema
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: messages };
    }
    return { success: false, error: 'Validation failed' };
  }
}
