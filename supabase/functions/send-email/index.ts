import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
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
    // Verificar el token de autorización
    const authHeader = req.headers.get("authorization");
    const apiKey = req.headers.get("apikey");

    if (!authHeader || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing authorization headers" }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get("PUBLIC_SUPABASE_URL") ?? "",
      Deno.env.get("PUBLIC_SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Usar Supabase para enviar el email
    const { data, error } = await supabaseClient.auth.admin.sendEmail({
      to,
      subject,
      html: html,
    });

    if (error) {
      console.error("Error al enviar email con Supabase:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Error sending email" }),
        { headers: corsHeaders, status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
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
