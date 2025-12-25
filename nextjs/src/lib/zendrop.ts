// Zendrop API Client - Client-side for fetching products
// This file handles product sync from Zendrop

const ZENDROP_API_URL = 'https://api.zendrop.com/v2'

interface ZendropProduct {
  id: number
  name: string
  description: string
  price: number
  compare_at_price: number | null
  images: string[]
  inventory: number
  category: string
  sku: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  variants: ZendropVariant[]
}

interface ZendropVariant {
  id: number
  name: string
  price: number
  sku: string
  inventory: number
}

interface ZendropOrder {
  id: number
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: ZendropOrderItem[]
  shipping_address: ZendropAddress
  tracking_number: string | null
  tracking_url: string | null
  created_at: string
  updated_at: string
}

interface ZendropOrderItem {
  product_id: number
  variant_id: number
  name: string
  quantity: number
  price: number
}

interface ZendropAddress {
  first_name: string
  last_name: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
}

// API Response types
interface ZendropResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

class ZendropClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${ZENDROP_API_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Zendrop API error: ${response.status}`)
    }

    return response.json()
  }

  // ============ PRODUCTS ============

  /**
   * Get all products with pagination
   */
  async getProducts(options: {
    page?: number
    per_page?: number
    category?: string
    search?: string
  } = {}): Promise<PaginatedResponse<ZendropProduct>> {
    const params = new URLSearchParams()
    
    if (options.page) params.set('page', options.page.toString())
    if (options.per_page) params.set('per_page', options.per_page.toString())
    if (options.category) params.set('category', options.category)
    if (options.search) params.set('search', options.search)

    const query = params.toString()
    return this.request<PaginatedResponse<ZendropProduct>>(
      `/products${query ? `?${query}` : ''}`
    )
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId: number): Promise<ZendropProduct> {
    return this.request<ZendropProduct>(`/products/${productId}`)
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<string[]> {
    const response = await this.request<{ categories: string[] }>('/products/categories')
    return response.categories
  }

  /**
   * Get product inventory
   */
  async getInventory(productId: number): Promise<number> {
    const product = await this.getProduct(productId)
    return product.inventory
  }

  // ============ ORDERS ============

  /**
   * Get all orders with pagination
   */
  async getOrders(options: {
    page?: number
    per_page?: number
    status?: ZendropOrder['status']
    date_from?: string
    date_to?: string
  } = {}): Promise<PaginatedResponse<ZendropOrder>> {
    const params = new URLSearchParams()
    
    if (options.page) params.set('page', options.page.toString())
    if (options.per_page) params.set('per_page', options.per_page.toString())
    if (options.status) params.set('status', options.status)
    if (options.date_from) params.set('date_from', options.date_from)
    if (options.date_to) params.set('date_to', options.date_to)

    const query = params.toString()
    return this.request<PaginatedResponse<ZendropOrder>>(
      `/orders${query ? `?${query}` : ''}`
    )
  }

  /**
   * Get a single order by ID
   */
  async getOrder(orderId: number): Promise<ZendropOrder> {
    return this.request<ZendropOrder>(`/orders/${orderId}`)
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: {
    items: {
      product_id: number
      variant_id?: number
      quantity: number
    }[]
    shipping_address: ZendropAddress
    shipping_method?: string
    notes?: string
    customer_email?: string
  }): Promise<ZendropOrder> {
    return this.request<ZendropOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: number, reason?: string): Promise<ZendropOrder> {
    return this.request<ZendropOrder>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // ============ SHIPPING ============

  /**
   * Get shipping rates for an order
   */
  async getShippingRates(orderId: number): Promise<{
    rates: {
      id: string
      name: string
      price: number
      currency: string
      estimated_days: number
    }[]
  }> {
    return this.request(`/orders/${orderId}/shipping-rates`)
  }

  /**
   * Get tracking information
   */
  async getTracking(orderId: number): Promise<{
    tracking_number: string
    tracking_url: string
    carrier: string
    status: string
    events: {
      date: string
      description: string
      location: string
    }[]
  }> {
    return this.request(`/orders/${orderId}/tracking`)
  }

  // ============ WAREHOUSES ============

  /**
   * Get available warehouses
   */
  async getWarehouses(): Promise<{
    id: number
    name: string
    country: string
    city: string
  }[]> {
    return this.request('/warehouses')
  }

  // ============ AUTH ============

  /**
   * Verify API key
   */
  async verifyConnection(): Promise<{
    connected: boolean
    account: {
      id: number
      name: string
      email: string
      plan: string
    }
  }> {
    return this.request('/account/verify')
  }
}

// Export singleton instance with lazy initialization
let zendropClient: ZendropClient | null = null

export function getZendropClient(): ZendropClient | null {
  if (!zendropClient && typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_ZENDROP_API_KEY
    if (apiKey) {
      zendropClient = new ZendropClient(apiKey)
    }
  }
  return zendropClient
}

export { ZendropClient, ZendropProduct, ZendropOrder, ZendropAddress }
export type { PaginatedResponse }
