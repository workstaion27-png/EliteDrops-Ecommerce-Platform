// Supabase Database Types Index
// هذا الملف يضمن حل صحيح لجميع أنواع Supabase

// إعادة تصدير من supabase.ts
export * from './supabase';

// إعادة تصدير Database type
export type { Database } from './supabase';

// إعادة تصدير أنواع JSON
export type { Json } from './supabase';

// إعادة تصدير أنواع SupabaseClient
export type { SupabaseClient, SupabaseAdminClient } from './supabase';
