// ============================================================================
// Supabase Database Types - Vercel Build Compatible Version
// Last Updated: 2025-12-28 04:46
// ============================================================================

// Json type for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Main Database interface
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
          compare_at_price: number | null
          cost_price: number | null
          images: string[]
          category: string
          tags: string[]
          stock_quantity: number
          status: 'active' | 'draft' | 'archived'
          sku: string
          source: string | null
          cj_product_id: string | null
          ai_score: number | null
          is_ai_selected: boolean | null
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
          compare_at_price?: number | null
          cost_price?: number | null
          images: string[]
          category: string
          tags?: string[]
          stock_quantity: number
          status?: 'active' | 'draft' | 'archived'
          sku: string
          source?: string | null
          cj_product_id?: string | null
          ai_score?: number | null
          is_ai_selected?: boolean | null
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
          compare_at_price?: number | null
          cost_price?: number | null
          images?: string[]
          category?: string
          tags?: string[]
          stock_quantity?: number
          status?: 'active' | 'draft' | 'archived'
          sku?: string
          source?: string | null
          cj_product_id?: string | null
          ai_score?: number | null
          is_ai_selected?: boolean | null
          zendrop_id?: string
          appscenic_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_notifications: {
        Row: {
          id: string
          created_at: string
          title: string
          message: string | null
          type: 'order' | 'product' | 'customer' | 'system' | 'payment' | 'shipping'
          priority: 'low' | 'normal' | 'high' | 'critical'
          is_read: boolean
          link: string | null
          related_entity_id: string | null
          recipient_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          message?: string | null
          type: 'order' | 'product' | 'customer' | 'system' | 'payment' | 'shipping'
          priority?: 'low' | 'normal' | 'high' | 'critical'
          is_read?: boolean
          link?: string | null
          related_entity_id?: string | null
          recipient_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          message?: string | null
          type?: 'order' | 'product' | 'customer' | 'system' | 'payment' | 'shipping'
          priority?: 'low' | 'normal' | 'high' | 'critical'
          is_read?: boolean
          link?: string | null
          related_entity_id?: string | null
          recipient_id?: string | null
          metadata?: Json | null
        }
      }
    }
  }
}

// Notification types
export type NotificationType = 'order' | 'product' | 'customer' | 'system' | 'payment' | 'shipping';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface AdminNotification {
  id: string;
  created_at: string;
  title: string;
  message: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  link: string | null;
  related_entity_id: string | null;
  recipient_id: string | null;
  metadata: Json | null;
}

// Helper type for creating Supabase client with full type safety
export type SupabaseClient<T extends Database> = import('@supabase/supabase-js').SupabaseClient<T>
export type SupabaseAdminClient<T extends Database> = import('@supabase/supabase-js').SupabaseAdminClient<T>
