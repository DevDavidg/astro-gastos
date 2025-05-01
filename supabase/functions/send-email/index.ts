import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

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

    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!sendgridApiKey) {
      throw new Error("Missing SendGrid API key");
    }

    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Usar SendGrid para enviar el email
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sendgridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: "noreply@yourdomain.com", // Cambia esto por tu email verificado
          name: "Sistema de Gastos",
        },
        subject,
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({ error: error.message || "Error sending email" }),
        { headers: corsHeaders, status: response.status }
      );
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
