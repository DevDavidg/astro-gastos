import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

const supabaseServiceKey = import.meta.env.PUBLIC_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (!supabaseUrl) {
  console.error("Missing Supabase URL");
}
if (!supabaseServiceKey) {
  console.error("Missing Supabase service role key");
}

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

export { supabaseAdmin };
