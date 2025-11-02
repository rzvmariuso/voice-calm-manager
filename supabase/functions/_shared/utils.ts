import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

// CORS Headers - centralized
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Client Factory
export function createSupabaseClient(useServiceRole = false): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = useServiceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    : Deno.env.get('SUPABASE_ANON_KEY');
    
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// User Authentication Helper
export async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const supabase = createSupabaseClient(false);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return user;
}

// Rate Limiting (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30;

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

// Error Response Helper
export function errorResponse(message: string, status = 500) {
  return new Response(
    JSON.stringify({ error: message, success: false }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Success Response Helper
export function successResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({ ...data, success: true }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Log Admin Action Helper
export async function logAdminAction(
  supabase: SupabaseClient,
  action: string,
  resourceType: string,
  resourceId?: string
) {
  try {
    await supabase.rpc('log_admin_action', {
      _action: action,
      _resource_type: resourceType,
      _resource_id: resourceId || null,
      _old_values: null,
      _new_values: null
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

// Phone Number Validation
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

// Clean Phone Number
export function cleanPhoneNumber(phone: string): string {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (!cleanPhone.startsWith('+')) {
    if (cleanPhone.startsWith('49')) {
      cleanPhone = '+' + cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = '+49' + cleanPhone.substring(1);
    } else {
      cleanPhone = '+49' + cleanPhone;
    }
  }
  
  return cleanPhone;
}

// Sanitize String
export function sanitizeString(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

// Verify Practice Ownership
export async function verifyPracticeOwnership(
  supabase: SupabaseClient,
  practiceId: string,
  userId: string
) {
  const { data: practice, error } = await supabase
    .from('practices')
    .select('id, name')
    .eq('id', practiceId)
    .eq('owner_id', userId)
    .single();

  if (error || !practice) {
    throw new Error('Practice not found or access denied');
  }

  return practice;
}
