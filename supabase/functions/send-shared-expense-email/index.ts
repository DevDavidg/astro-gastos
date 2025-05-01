import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("PUBLIC_SUPABASE_URL") ?? "",
      Deno.env.get("PUBLIC_SUPABASE_ANON_KEY") ?? ""
    );

    // Parse request body
    const { to, subject, content } = await req.json();

    // Validate required fields
    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: corsHeaders,
          status: 400,
        }
      );
    }

    // Send email using Supabase
    const { data, error } = await supabaseClient.auth.admin.sendEmail({
      to,
      subject,
      html: content,
    });

    if (error) {
      console.error("Error al enviar email:", error);
      return new Response(
        JSON.stringify({
          error: "Error sending email",
          details: error.message,
        }),
        {
          headers: corsHeaders,
          status: 500,
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        headers: corsHeaders,
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error en send-shared-expense-email:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
});
