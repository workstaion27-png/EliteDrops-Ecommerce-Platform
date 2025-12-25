// Zendrop Webhook Handler - Process events from Zendrop
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface ZendropWebhookPayload {
  event: string
  timestamp: string
  data: {
    order_id?: number
    order_number?: string
    status?: string
    tracking_number?: string
    tracking_url?: string
    product_id?: number
    inventory?: number
    message?: string
  }
}

// Handle different webhook events
async function handleWebhookEvent(payload: ZendropWebhookPayload) {
  const { event, data } = payload

  console.log(`Processing Zendrop webhook: ${event}`)

  switch (event) {
    case 'order.created':
      await handleOrderCreated(data)
      break

    case 'order.processing':
      await handleOrderProcessing(data)
      break

    case 'order.shipped':
      await handleOrderShipped(data)
      break

    case 'order.delivered':
      await handleOrderDelivered(data)
      break

    case 'order.cancelled':
      await handleOrderCancelled(data)
      break

    case 'product.inventory.updated':
      await handleInventoryUpdated(data)
      break

    case 'product.out_of_stock':
      await handleProductOutOfStock(data)
      break

    default:
      console.log(`Unhandled Zendrop event: ${event}`)
  }
}

// Handle new order created
async function handleOrderCreated(data: ZendropWebhookPayload['data']) {
  if (!data.order_id) return

  // Update order status in database
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'processing',
      zendrop_order_id: data.order_id,
      updated_at: new Date().toISOString(),
    })
    .eq('zendrop_order_id', data.order_id)

  if (error) {
    console.error('Failed to update order status:', error)
  }
}

// Handle order being processed
async function handleOrderProcessing(data: ZendropWebhookPayload['data']) {
  if (!data.order_id) return

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('zendrop_order_id', data.order_id)

  if (error) {
    console.error('Failed to update order processing:', error)
  }
}

// Handle order shipped
async function handleOrderShipped(data: ZendropWebhookPayload['data']) {
  if (!data.order_id) return

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: data.tracking_number,
      tracking_url: data.tracking_url,
      shipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('zendrop_order_id', data.order_id)

  if (error) {
    console.error('Failed to update shipped order:', error)
  }
}

// Handle order delivered
async function handleOrderDelivered(data: ZendropWebhookPayload['data']) {
  if (!data.order_id) return

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('zendrop_order_id', data.order_id)

  if (error) {
    console.error('Failed to update delivered order:', error)
  }
}

// Handle order cancelled
async function handleOrderCancelled(data: ZendropWebhookPayload['data']) {
  if (!data.order_id) return

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancellation_reason: data.message,
      updated_at: new Date().toISOString(),
    })
    .eq('zendrop_order_id', data.order_id)

  if (error) {
    console.error('Failed to update cancelled order:', error)
  }
}

// Handle inventory update
async function handleInventoryUpdated(data: ZendropWebhookPayload['data']) {
  if (!data.product_id) return

  const { error } = await supabase
    .from('products')
    .update({
      inventory_count: data.inventory,
      updated_at: new Date().toISOString(),
    })
    .eq('zendrop_product_id', data.product_id)

  if (error) {
    console.error('Failed to update inventory:', error)
  }
}

// Handle product out of stock
async function handleProductOutOfStock(data: ZendropWebhookPayload['data']) {
  if (!data.product_id) return

  const { error } = await supabase
    .from('products')
    .update({
      inventory_count: 0,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('zendrop_product_id', data.product_id)

  if (error) {
    console.error('Failed to mark product out of stock:', error)
  }
}

// POST /api/zendrop/webhook
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if configured)
    const signature = request.headers.get('X-Zendrop-Signature')
    const webhookSecret = process.env.ZENDROP_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      // Verify signature here
      // const isValid = verifySignature(signature, body, webhookSecret)
      // if (!isValid) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      // }
    }

    const body: ZendropWebhookPayload = await request.json()

    // Process the webhook
    await handleWebhookEvent(body)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Zendrop webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET /api/zendrop/webhook - Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Zendrop Webhook Handler',
    timestamp: new Date().toISOString(),
  })
}
