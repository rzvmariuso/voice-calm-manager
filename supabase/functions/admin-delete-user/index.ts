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

    const { email, user_id }: Payload = await req.json();

    if (!email && !user_id) {
      return new Response(
        JSON.stringify({ error: "Provide email or user_id" }),
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

    // Delete the auth user
    const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId);
    if (delErr) throw delErr;

    // Best-effort cleanup in public tables
    if (email) {
      await admin.from("subscribers").delete().eq("email", email);
    }

    return new Response(
      JSON.stringify({ success: true, user_id: targetUserId }),
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