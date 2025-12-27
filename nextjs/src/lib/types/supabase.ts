// Supabase Database Types - Updated for Vercel Build
// This file provides TypeScript type definitions for Supabase database tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          customer_id: string
          order_number: string
          total: number
          status: string
          payment_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          order_number: string
          total: number
          status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          order_number?: string
          total?: number
          status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      notification_templates: {
        Row: {
          id: string
          template_name: string
          channel: 'sms' | 'email' | 'whatsapp'
          subject?: string
          content: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_name: string
          channel: 'sms' | 'email' | 'whatsapp'
          subject?: string
          content: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_name?: string
          channel?: 'sms' | 'email' | 'whatsapp'
          subject?: string
          content?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      communication_logs: {
        Row: {
          id: string
          order_id?: string
          customer_id?: string
          channel: 'sms' | 'email' | 'whatsapp'
          message_type: string
          status: string
          content_snapshot: string
          recipient: string
          error_message?: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string
          customer_id?: string
          channel: 'sms' | 'email' | 'whatsapp'
          message_type: string
          status: string
          content_snapshot: string
          recipient: string
          error_message?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          customer_id?: string
          channel?: 'sms' | 'email' | 'whatsapp'
          message_type?: string
          status?: string
          content_snapshot?: string
          recipient?: string
          error_message?: string
          created_at?: string
        }
      }
      order_tracking: {
        Row: {
          id: string
          order_id: string
          tracking_number: string
          carrier: string
          tracking_url?: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          tracking_number: string
          carrier: string
          tracking_url?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          tracking_number?: string
          carrier?: string
          tracking_url?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          images: string[]
          category: string
          inventory_count: number
          is_active: boolean
          zendrop_id?: string
          appscenic_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          images: string[]
          category: string
          inventory_count: number
          is_active?: boolean
          zendrop_id?: string
          appscenic_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          images?: string[]
          category?: string
          inventory_count?: number
          is_active?: boolean
          zendrop_id?: string
          appscenic_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper type for creating Supabase client with full type safety
export type SupabaseClient<T extends Database> = import('@supabase/supabase-js').SupabaseClient<T>
export type SupabaseAdminClient<T extends Database> = import('@supabase/supabase-js').SupabaseAdminClient<T>
