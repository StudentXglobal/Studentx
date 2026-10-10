```ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://acragelglvdnqhvbjcgx.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_O2kgvCZ8CxPKghH7MJn7nw_R-l61YuH";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
```
