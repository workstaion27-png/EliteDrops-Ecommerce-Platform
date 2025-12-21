import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cjAPI } from '@/lib/cjdropshipping'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-cj-signature')
    
    // Verify webhook signature
    if (!cjAPI.verifyWebhook(payload, signature || '')) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(payload)
    
    switch (event.type) {
      case 'order.created':
        await handleOrderCreated(event.data)
        break
      
      case 'order.updated':
        await handleOrderUpdated(event.data)
        break
      
      case 'order.shipped':
        await handleOrderShipped(event.data)
        break
      
      case 'order.delivered':
        await handleOrderDelivered(event.data)
        break
      
      case 'order.cancelled':
        await handleOrderCancelled(event.data)
        break
      
      default:
        console.log('Unhandled webhook event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    )
  }
}

async function handleOrderCreated(data: any) {
  const { cj_order_id, order_number } = data
  
  // Update local order with CJ order ID
  const { error } = await supabase
    .from('orders')
    .update({ 
      cj_order_id: cj_order_id,
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('order_number', order_number)
  
  if (error) {
    console.error('Error updating order with CJ ID:', error)
  }
}

async function handleOrderUpdated(data: any) {
  const { cj_order_id, status, tracking_number, estimated_delivery } = data
  
  // Map CJ status to local status
  let localStatus: string = 'processing'
  switch (status) {
    case 'processing':
      localStatus = 'processing'
      break
    case 'shipped':
      localStatus = 'shipped'
      break
    case 'delivered':
      localStatus = 'delivered'
      break
    case 'cancelled':
      localStatus = 'cancelled'
      break
  }

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: localStatus,
      updated_at: new Date().toISOString()
    })
    .eq('cj_order_id', cj_order_id)

  if (orderError) {
    console.error('Error updating order status:', orderError)
    return
  }

  // Update tracking information
  if (tracking_number) {
    const { error: trackingError } = await supabase
      .from('shipping_tracking')
      .upsert({
        order_id: (await getOrderIdByCJId(cj_order_id)) || '',
        tracking_number,
        carrier: 'CJdropshipping',
        status: status,
        estimated_delivery: estimated_delivery || '',
        tracking_url: `https://cjdropshipping.com/track/${tracking_number}`,
        updated_at: new Date().toISOString()
      })

    if (trackingError) {
      console.error('Error updating tracking info:', trackingError)
    }
  }
}

async function handleOrderShipped(data: any) {
  await handleOrderUpdated(data)
  
  // Send shipping notification email
  const orderId = await getOrderIdByCJId(data.cj_order_id)
  if (orderId) {
    // Here you would send an email notification to the customer
    console.log(`Order ${orderId} has been shipped`)
  }
}

async function handleOrderDelivered(data: any) {
  await handleOrderUpdated(data)
  
  // Send delivery confirmation email
  const orderId = await getOrderIdByCJId(data.cj_order_id)
  if (orderId) {
    console.log(`Order ${orderId} has been delivered`)
  }
}

async function handleOrderCancelled(data: any) {
  await handleOrderUpdated(data)
  
  // Handle cancellation logic
  const orderId = await getOrderIdByCJId(data.cj_order_id)
  if (orderId) {
    // Here you would handle refund processing
    console.log(`Order ${orderId} has been cancelled`)
  }
}

async function getOrderIdByCJId(cjOrderId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('cj_order_id', cjOrderId)
    .single()
  
  if (error) {
    console.error('Error finding order by CJ ID:', error)
    return null
  }
  
  return data?.id || null
}