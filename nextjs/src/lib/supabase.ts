import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_price?: number
  images: string[]
  category: string
  inventory_count: number
  is_active: boolean
  cj_product_id?: string
  supplier_id?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  total_amount: number
  shipping_address: any
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string
  tracking_number?: string
  cj_order_id?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  api_key?: string
  cj_supplier_id?: string
  is_active: boolean
  created_at: string
}

export interface ShippingTracking {
  id: string
  order_id: string
  tracking_number: string
  carrier: string
  status: string
  estimated_delivery: string
  tracking_url: string
  created_at: string
  updated_at: string
}
