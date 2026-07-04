import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'PROJECT_URL'

const supabaseKey = 'ANON_KEY'

const supabase = createClient(
supabaseUrl,
supabaseKey
)

console.log('StudentX Connected')
