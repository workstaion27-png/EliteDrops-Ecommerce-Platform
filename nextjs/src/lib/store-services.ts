import { supabase, Product, Order, Customer, OrderItem } from './supabase'
import { cjAPI } from './cjdropshipping'

export class StoreServices {
  
  // Product Management
  static async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async getProducts(filters?: {
    category?: string
    is_active?: boolean
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase.from('products').select('*')

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Order Management
  static async createOrder(orderData: {
    customer_id: string
    total_amount: number
    shipping_address: any
    payment_method: string
    items: Array<{
      product_id: string
      quantity: number
      price: number
    }>
  }) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: orderData.customer_id,
        order_number: this.generateOrderNumber(),
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  }

  static async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updatePaymentStatus(orderId: string, paymentStatus: Order['payment_status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getOrders(filters?: {
    status?: Order['status']
    payment_status?: Order['payment_status']
    customer_id?: string
    date_from?: string
    date_to?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        customers (*)
      `)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status)
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  // CJdropshipping Integration
  static async syncProductFromCJ(cjProductId: string) {
    try {
      const cjProduct = await cjAPI.getProduct(cjProductId)
      
      if (!cjProduct) {
        throw new Error('Product not found in CJ Dropshipping')
      }
      
      const productData = {
        name: cjProduct.name,
        description: `Imported from CJdropshipping - ${cjProduct.name}`,
        price: cjProduct.price,
        images: [cjProduct.image],
        category: cjProduct.category || 'Imported',
        inventory_count: cjProduct.stock,
        is_active: true,
        cj_product_id: cjProductId
      }

      return await this.createProduct(productData)
    } catch (error) {
      console.error('Error syncing product from CJdropshipping:', error)
      throw error
    }
  }

  // Sync multiple products from CJ
  static async syncProductsFromCJ(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    keyword?: string;
  } = {}) {
    try {
      const cjProducts = await cjAPI.getProducts(params)
      const syncResults = []

      for (const cjProduct of cjProducts) {
        try {
          const productData = {
            name: cjProduct.name,
            description: `Imported from CJdropshipping - ${cjProduct.name}`,
            price: cjProduct.price,
            images: [cjProduct.image],
            category: cjProduct.category || 'Imported',
            inventory_count: cjProduct.stock,
            is_active: true,
            cj_product_id: cjProduct.id
          }

          const syncedProduct = await this.createProduct(productData)
          syncResults.push({
            success: true,
            cjProductId: cjProduct.id,
            productId: syncedProduct.id,
            productName: syncedProduct.name
          })
        } catch (error) {
          syncResults.push({
            success: false,
            cjProductId: cjProduct.id,
            productName: cjProduct.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      return syncResults
    } catch (error) {
      console.error('Error syncing products from CJdropshipping:', error)
      throw error
    }
  }

  // Get available categories from CJ
  static async getCJCategories() {
    try {
      return await cjAPI.getCategories()
    } catch (error) {
      console.error('Error getting CJ categories:', error)
      throw error
    }
  }

  static async createCJOrder(orderId: string) {
    try {
      // Get order details with customer info
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          customers (*)
        `)
        .eq('id', orderId)
        .single()

      if (!order) throw new Error('Order not found')

      if (!order.order_items || order.order_items.length === 0) {
        throw new Error('No items in order')
      }

      // Get first product that has CJ integration
      const cjItem = order.order_items.find((item: any) => item.products?.cj_product_id)
      
      if (!cjItem) {
        throw new Error('No products in this order are linked to CJdropshipping')
      }

      const product = cjItem.products
      const customer = order.customers

      // Prepare CJ order data
      const cjOrderData = {
        items: [{
          productId: product.cj_product_id,
          variantId: cjItem.variant_id || undefined,
          quantity: cjItem.quantity,
          price: cjItem.price,
          sku: product.sku || product.cj_product_id
        }],
        shippingAddress: {
          firstName: order.shipping_address?.first_name || customer?.first_name || '',
          lastName: order.shipping_address?.last_name || customer?.last_name || '',
          address1: order.shipping_address?.address || '',
          city: order.shipping_address?.city || '',
          state: order.shipping_address?.state || '',
          postalCode: order.shipping_address?.zip_code || '',
          country: order.shipping_address?.country || 'US'
        },
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || order.shipping_address?.phone || '',
        notes: `Order ${order.order_number} from LuxuryHub`
      }

      // Create order in CJdropshipping
      const cjOrder = await cjAPI.createOrder(cjOrderData)

      // Update local order with CJ order ID
      await supabase
        .from('orders')
        .update({ 
          cj_order_id: cjOrder.orderId,
          status: 'processing'
        })
        .eq('id', orderId)

      return {
        ...cjOrder,
        localOrderId: orderId
      }
    } catch (error) {
      console.error('Error creating CJ order:', error)
      throw error
    }
  }

  static async syncOrderStatus(orderId: string) {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('cj_order_id')
        .eq('id', orderId)
        .single()

      if (!order?.cj_order_id) {
        throw new Error('Order not linked to CJdropshipping')
      }

      const cjStatus = await cjAPI.getOrderStatus(order.cj_order_id)
      
      // Map CJ status to local status
      let localStatus: Order['status'] = 'processing'
      if (cjStatus.status === 'shipped') localStatus = 'shipped'
      if (cjStatus.status === 'delivered') localStatus = 'delivered'
      if (cjStatus.status === 'cancelled') localStatus = 'cancelled'

      await this.updateOrderStatus(orderId, localStatus)

      // Update tracking information if available
      if (cjStatus.trackingNumber) {
        // Check if tracking record exists
        const { data: existingTracking } = await supabase
          .from('shipping_tracking')
          .select('id')
          .eq('order_id', orderId)
          .single()

        if (existingTracking) {
          // Update existing tracking
          await supabase
            .from('shipping_tracking')
            .update({
              tracking_number: cjStatus.trackingNumber,
              carrier: cjStatus.shippingCarrier || 'CJdropshipping',
              status: cjStatus.status,
              updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId)
        } else {
          // Create new tracking record
          await supabase
            .from('shipping_tracking')
            .insert({
              order_id: orderId,
              tracking_number: cjStatus.trackingNumber,
              carrier: cjStatus.shippingCarrier || 'CJdropshipping',
              status: cjStatus.status,
              created_at: new Date().toISOString()
            })
        }
      }

      return cjStatus
    } catch (error) {
      console.error('Error syncing order status:', error)
      throw error
    }
  }

  // Get tracking information for customer
  static async getOrderTracking(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('shipping_tracking')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error getting order tracking:', error)
      throw error
    }
  }

  // Test CJ connection
  static async testCJConnection(): Promise<boolean> {
    try {
      return await cjAPI.testConnection()
    } catch (error) {
      console.error('Error testing CJ connection:', error)
      return false
    }
  }

  // Customer Management
  static async createCustomer(customerData: {
    email: string
    first_name: string
    last_name: string
    phone?: string
  }) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getCustomerByEmail(email: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Utility Functions
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `LH-${timestamp}-${random}`
  }

  static async getDashboardStats() {
    const [ordersResult, productsResult, customersResult, revenueResult] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid')
    ])

    const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    return {
      totalOrders: ordersResult.count || 0,
      totalProducts: productsResult.count || 0,
      totalCustomers: customersResult.count || 0,
      totalRevenue
    }
  }
}