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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Crear cliente de Supabase con la clave de servicio
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { to, subject, content } = await req.json();

    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Usar el servicio de email incorporado
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(to, {
      data: {
        message: content,
      },
    });

    if (error) {
      console.error("Error al enviar email:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: corsHeaders,
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
