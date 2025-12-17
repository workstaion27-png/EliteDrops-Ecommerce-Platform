export interface Product {
  id: string
  cj_product_id?: string
  name: string
  description?: string
  price: number
  compare_price?: number
  images: string[]
  category?: string
  variants?: ProductVariant[]
  inventory_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  name: string
  options: string[]
  price_modifier?: number
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  variant_info?: Record<string, string>
}

export interface Order {
  id: string
  customer_id?: string
  user_id?: string
  order_number: string
  status: OrderStatus
  total_amount: number
  subtotal?: number
  shipping_cost?: number
  tax_amount?: number
  currency: string
  stripe_payment_intent_id?: string
  cj_order_id?: string
  shipping_address?: Address
  billing_address?: Address
  customer_email?: string
  tracking_number?: string
  notes?: string
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  cj_product_id?: string
  product_name: string
  product_image_url?: string
  quantity: number
  price_at_time: number
  variant_info?: Record<string, string>
  created_at: string
}

export interface User {
  id: string
  email: string
  role: 'customer' | 'admin'
}
