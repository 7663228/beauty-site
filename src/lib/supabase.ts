import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Use globalThis to ensure singleton across all module instances in the same browser context
// This prevents the GoTrueClient warning about multiple instances
const globalSupabaseKey = '__SUPABASE_CLIENT__'

function getSupabaseClient(): SupabaseClient {
  // Check if we already have a client on the global object
  if (typeof globalThis !== 'undefined' && (globalThis as any)[globalSupabaseKey]) {
    return (globalThis as any)[globalSupabaseKey] as SupabaseClient
  }

  // Create new client
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  // Store on global object for reuse
  if (typeof globalThis !== 'undefined') {
    (globalThis as any)[globalSupabaseKey] = client
  }

  return client
}

// Export as a getter to ensure singleton behavior
export const supabase: SupabaseClient = getSupabaseClient()

// Re-export types for convenience
export * from './types'
export * from './api'
