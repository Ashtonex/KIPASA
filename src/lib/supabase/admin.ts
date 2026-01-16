import { createClient } from '@supabase/supabase-js'

export const createAdminClient = async () => {
  // This uses the SERVICE_ROLE_KEY which bypasses RLS
  // NEVER use this in a Client Component. Only in Server Actions/API.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}