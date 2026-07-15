import { createClient } from '@supabase/supabase-js'

export type SupabaseBindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
}

export function getSupabase(env: SupabaseBindings) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}
