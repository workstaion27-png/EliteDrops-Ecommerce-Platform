// ============================================================================
// Order Fulfillment Service
// Handles order processing and dropshipping fulfillment
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Interfaces
export interface OrderFulfillmentData {
  order_id: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    email: string;
  };
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    external_variant_id?: string;
    price: number;
  }>;
  customer_id?: string;
  notes?: string;
}

export interface FulfillmentResult {
  success: boolean;
  external_order_id?: string;
  external_order_url?: string;
  tracking_number?: string;
  carrier?: string;
  error?: string;
  warnings?: string[];
}

export interface FulfillmentStatus {
  order_id: string;
  status: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'failed';
  external_order_id?: string;
  tracking_number?: string;
  carrier?: string;
  last_error?: string;
  updated_at: string;
}

/**
 * Process order fulfillment after payment
 */
export async function fulfillOrder(
  orderId: string,
  options: { force?: boolean } = {}
): Promise<FulfillmentResult> {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(source_platform, external_product_id, external_variant_id, supplier_id, warehouse_id)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // Check if already fulfilled
    if (order.fulfillment_status === 'shipped' && !options.force) {
      return { success: false, error: 'Order already shipped' };
    }

    // Check payment status
    if (order.payment_status !== 'paid') {
      return { success: false, error: 'Payment not completed' };
    }

    // Group items by source platform
    const itemsByPlatform: Record<string, any[]> = {};
    for (const item of order.items || []) {
      const platform = item.product?.source_platform || 'local';
      if (!itemsByPlatform[platform]) {
        itemsByPlatform[platform] = [];
      }
      itemsByPlatform[platform].push(item);
    }

    // Process each platform
    const results: FulfillmentResult[] = [];
    let allSuccess = true;

    for (const [platform, items] of Object.entries(itemsByPlatform)) {
      let result: FulfillmentResult;

      switch (platform) {
        case 'cj':
          result = await fulfillCJOrder(order, items);
          break;
        case 'zendrop':
          result = await fulfillZendropOrder(order, items);
          break;
        case 'appscenic':
          result = await fulfillAppScenicOrder(order, items);
          break;
        default:
          // Local fulfillment (no external platform)
          result = await processLocalFulfillment(order, items);
      }

      results.push(result);
      if (!result.success) {
        allSuccess = false;
      }
    }

    // Update order status
    const finalStatus = allSuccess ? 'processing' : 'partial';
    const trackingNumbers = results
      .filter(r => r.tracking_number)
      .map(r => r.tracking_number);
    const carriers = results
      .filter(r => r.carrier)
      .map(r => r.carrier);

    await supabase
      .from('orders')
      .update({
        fulfillment_status: finalStatus,
        external_order_id: results[0]?.external_order_id,
        external_order_url: results[0]?.external_order_url,
        tracking_number: trackingNumbers[0],
        carrier: carriers[0],
        sync_error: allSuccess ? null : results.map(r => r.error).join('; '),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Log communication
    await logFulfillmentCommunication(orderId, results);

    return {
      success: allSuccess,
      external_order_id: results[0]?.external_order_id,
      tracking_number: results[0]?.tracking_number,
      carrier: results[0]?.carrier,
      warnings: results.flatMap(r => r.warnings || [])
    };
  } catch (error) {
    console.error('Error fulfilling order:', error);
    return { success: false, error: 'Failed to process fulfillment' };
  }
}

/**
 * Fulfill order via CJ Dropshipping
 */
async function fulfillCJOrder(order: any, items: any[]): Promise<FulfillmentResult> {
  // This is a placeholder - in production, integrate with CJ API
  console.log('Processing CJ fulfillment for order:', order.id);
  
  try {
    // Prepare CJ order data
    const cjOrderData = {
      orderId: order.order_number,
      shippingAddress: {
        name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        address: order.shipping_address.address1,
        city: order.shipping_address.city,
        state: order.shipping_address.state,
        postalCode: order.shipping_address.postal_code,
        country: order.shipping_address.country,
        phone: order.shipping_address.phone,
        email: order.shipping_address.email
      },
      items: items.map(item => ({
        productId: item.product?.external_product_id,
        variantId: item.product?.external_variant_id || item.external_variant_id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    // In production: call CJ API
    // const response = await cjdropshippingAPI.createOrder(cjOrderData);

    // Simulate success for now
    return {
      success: true,
      external_order_id: `CJ-${Date.now()}`,
      external_order_url: `https://cjdropshipping.com/orders/CJ-${Date.now()}`,
      carrier: 'ePacket',
      tracking_number: `CJ${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    };
  } catch (error) {
    console.error('CJ fulfillment error:', error);
    return { success: false, error: 'CJ fulfillment failed' };
  }
}

/**
 * Fulfill order via Zendrop
 */
async function fulfillZendropOrder(order: any, items: any[]): Promise<FulfillmentResult> {
  console.log('Processing Zendrop fulfillment for order:', order.id);
  
  try {
    // Prepare Zendrop order data
    const zendropOrderData = {
      order_number: order.order_number,
      shipping_address: order.shipping_address,
      items: items.map(item => ({
        product_id: item.product?.external_product_id,
        variant_id: item.product?.external_variant_id,
        quantity: item.quantity
      }))
    };

    // In production: call Zendrop API
    // const response = await zendropAPI.createOrder(zendropOrderData);

    return {
      success: true,
      external_order_id: `ZD-${Date.now()}`,
      external_order_url: `https://app.zendrop.com/orders/ZD-${Date.now()}`,
      carrier: 'Zendrop Shipping',
      tracking_number: `ZD${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    };
  } catch (error) {
    console.error('Zendrop fulfillment error:', error);
    return { success: false, error: 'Zendrop fulfillment failed' };
  }
}

/**
 * Fulfill order via AppScenic
 */
async function fulfillAppScenicOrder(order: any, items: any[]): Promise<FulfillmentResult> {
  console.log('Processing AppScenic fulfillment for order:', order.id);
  
  try {
    return {
      success: true,
      external_order_id: `AS-${Date.now()}`,
      external_order_url: `https://appscenic.com/orders/AS-${Date.now()}`,
      carrier: 'AppScenic Express',
      tracking_number: `AS${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    };
  } catch (error) {
    console.error('AppScenic fulfillment error:', error);
    return { success: false, error: 'AppScenic fulfillment failed' };
  }
}

/**
 * Process local fulfillment (no external platform)
 */
async function processLocalFulfillment(order: any, items: any[]): Promise<FulfillmentResult> {
  console.log('Processing local fulfillment for order:', order.id);
  
  // For local products, just mark as processing
  return {
    success: true,
    external_order_id: `LOCAL-${order.order_number}`,
    carrier: 'Local Shipping',
    tracking_number: `LOCAL${Math.random().toString(36).substring(2, 15).toUpperCase()}`
  };
}

/**
 * Update order status from external platform
 */
export async function updateOrderStatusFromPlatform(
  orderId: string,
  platform: string,
  platformOrderId: string,
  status: string,
  trackingData?: {
    tracking_number?: string;
    carrier?: string;
    tracking_url?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Map platform status to our status
    const statusMap: Record<string, string> = {
      'pending': 'processing',
      'processing': 'processing',
      'shipped': 'shipped',
      'in_transit': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'returned'
    };

    const mappedStatus = statusMap[status.toLowerCase()] || 'processing';

    updateData.fulfillment_status = mappedStatus;
    
    if (trackingData?.tracking_number) {
      updateData.tracking_number = trackingData.tracking_number;
    }
    if (trackingData?.carrier) {
      updateData.carrier = trackingData.carrier;
    }
    if (trackingData?.tracking_url) {
      updateData.tracking_url = trackingData.tracking_url;
    }
    if (mappedStatus === 'delivered') {
      updateData.status = 'delivered';
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Create tracking record
    if (trackingData?.tracking_number) {
      await supabase.from('shipping_tracking').insert({
        order_id: orderId,
        tracking_number: trackingData.tracking_number,
        carrier: trackingData.carrier,
        tracking_url: trackingData.tracking_url,
        status: mappedStatus === 'shipped' ? 'in_transit' : mappedStatus
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}

/**
 * Get fulfillment status for an order
 */
export async function getFulfillmentStatus(orderId: string): Promise<FulfillmentStatus | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, fulfillment_status, external_order_id, tracking_number, carrier, sync_error, updated_at')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return null;
  }

  return {
    order_id: order.id,
    status: order.fulfillment_status as FulfillmentStatus['status'],
    external_order_id: order.external_order_id,
    tracking_number: order.tracking_number,
    carrier: order.carrier,
    last_error: order.sync_error,
    updated_at: order.updated_at
  };
}

/**
 * Get all orders pending fulfillment
 */
export async function getPendingFulfillmentOrders(
  options: { limit?: number; offset?: number } = {}
): Promise<{ orders: any[]; total: number }> {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const { data, error, count } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(id, email, first_name, last_name),
      items:order_items(
        *,
        product:products(name, sku, images)
      )
    `, { count: 'exact' })
    .eq('payment_status', 'paid')
    .eq('fulfillment_status', 'unfulfilled')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching pending orders:', error);
    return { orders: [], total: 0 };
  }

  return { orders: data || [], total: count || 0 };
}

/**
 * Retry failed fulfillment
 */
export async function retryFulfillment(orderId: string): Promise<FulfillmentResult> {
  // Get the order
  const { data: order, error } = await supabase
    .from('orders')
    .select('sync_error')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { success: false, error: 'Order not found' };
  }

  // Reset sync error and retry
  await supabase
    .from('orders')
    .update({ sync_error: null })
    .eq('id', orderId);

  return await fulfillOrder(orderId, { force: true });
}

/**
 * Cancel fulfillment
 */
export async function cancelFulfillment(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if order can be cancelled
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('fulfillment_status, external_order_id')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.fulfillment_status === 'shipped') {
      return { success: false, error: 'Cannot cancel shipped order' };
    }

    // Cancel on platform if external order exists
    if (order.external_order_id) {
      // In production: call platform API to cancel
      console.log('Cancelling external order:', order.external_order_id);
    }

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({
        fulfillment_status: 'cancelled',
        status: 'cancelled',
        internal_notes: `Fulfillment cancelled: ${reason}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error cancelling fulfillment:', error);
    return { success: false, error: 'Failed to cancel fulfillment' };
  }
}

/**
 * Log fulfillment communication
 */
async function logFulfillmentCommunication(
  orderId: string,
  results: FulfillmentResult[]
): Promise<void> {
  const content = results.map(r => 
    `Platform: ${r.success ? 'Success' : 'Failed'}\n` +
    `Order ID: ${r.external_order_id || 'N/A'}\n` +
    `Tracking: ${r.tracking_number || 'N/A'}\n` +
    `Error: ${r.error || 'None'}`
  ).join('\n\n');

  await supabase.from('communication_logs').insert({
    order_id: orderId,
    type: 'internal',
    content,
    status: results.every(r => r.success) ? 'sent' : 'failed'
  });
}

/**
 * Get fulfillment statistics
 */
export async function getFulfillmentStats(): Promise<{
  total_orders: number;
  pending_fulfillment: number;
  shipped: number;
  delivered: number;
  failed: number;
  average_fulfillment_time: number;
}> {
  const [total, pending, shipped, delivered, failed] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact' }).eq('payment_status', 'paid'),
    supabase.from('orders').select('id', { count: 'exact' }).eq('payment_status', 'paid').eq('fulfillment_status', 'unfulfilled'),
    supabase.from('orders').select('id', { count: 'exact' }).eq('fulfillment_status', 'shipped'),
    supabase.from('orders').select('id', { count: 'exact' }).eq('fulfillment_status', 'delivered'),
    supabase.from('orders').select('id', { count: 'exact' }).not('sync_error', 'is', null)
  ]);

  return {
    total_orders: total.count || 0,
    pending_fulfillment: pending.count || 0,
    shipped: shipped.count || 0,
    delivered: delivered.count || 0,
    failed: failed.count || 0,
    average_fulfillment_time: 3.5 // Would calculate from actual data
  };
}

export default {
  fulfillOrder,
  updateOrderStatusFromPlatform,
  getFulfillmentStatus,
  getPendingFulfillmentOrders,
  retryFulfillment,
  cancelFulfillment,
  getFulfillmentStats
};
