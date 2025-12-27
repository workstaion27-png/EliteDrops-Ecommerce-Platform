// Re-export all types from supabase.ts for better module resolution
// This file ensures that '@/lib/types/supabase' works correctly

export * from './supabase';

// Re-export the Database type specifically
export type { Database } from './supabase';

// Re-export all interfaces
export type { Json } from './supabase';
export type { SupabaseClient, SupabaseAdminClient } from './supabase';
