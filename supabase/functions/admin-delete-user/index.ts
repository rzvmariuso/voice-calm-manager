import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  email?: string;
  user_id?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token and user info for authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase env vars" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // Verify JWT token using the service role client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await admin
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !userRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requestBody = await req.json();
    const { email, user_id }: Payload = requestBody;

    // Input validation
    if (!email && !user_id) {
      return new Response(
        JSON.stringify({ error: "Provide email or user_id" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate user_id format if provided
    if (user_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid user_id format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find user id by email if needed
    let targetUserId = user_id || "";

    if (!targetUserId && email) {
      // Iterate through users to find the matching email (up to 10 pages)
      let page = 1;
      const perPage = 1000;
      for (page = 1; page <= 10; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (found) {
          targetUserId = found.id;
          break;
        }
        if (data.users.length < perPage) break; // no more pages
      }

      if (!targetUserId) {
        return new Response(
          JSON.stringify({ error: "User with this email not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Log the admin action before deletion
    await admin.rpc('log_admin_action', {
      _action: 'delete_user',
      _resource_type: 'auth_user',
      _resource_id: targetUserId,
      _old_values: JSON.stringify({ email: email || 'unknown', user_id: targetUserId }),
      _new_values: null
    });

    // Delete the auth user
    const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId);
    if (delErr) {
      console.error('Failed to delete user:', delErr);
      // Log the failure
      await admin.rpc('log_admin_action', {
        _action: 'delete_user_failed',
        _resource_type: 'auth_user',
        _resource_id: targetUserId,
        _old_values: JSON.stringify({ error: delErr.message }),
        _new_values: null
      });
      throw delErr;
    }

    // Best-effort cleanup in public tables
    if (email) {
      const { error: cleanupError } = await admin.from("subscribers").delete().eq("email", email);
      if (cleanupError) {
        console.error('Failed to cleanup subscriber:', cleanupError);
      }
    }

    console.log(`Admin ${user.email} deleted user ${targetUserId} (${email || 'no email'})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: targetUserId,
        message: "User deleted successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    console.error("admin-delete-user error", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});