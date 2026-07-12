const SUPABASE_URL = "https://acragelglvdnqhvbjcgx.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_O2kgvCZ8CxPKghH7MJn7nw_R-l61YuH;

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
