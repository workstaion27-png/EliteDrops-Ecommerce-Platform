// Zendrop Orders API Route - Handle order creation and management
import { NextRequest, NextResponse } from 'next/server'
import { ZendropClient } from '@/lib/zendrop'

function getClient(): ZendropClient | null {
  const apiKey = process.env.ZENDROP_API_KEY
  if (!apiKey) {
    return null
  }
  return new ZendropClient(apiKey)
}

// ============ GET /api/zendrop/orders ============
export async function GET(request: NextRequest) {
  try {
    const client = getClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Zendrop API key not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const status = searchParams.get('status') as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null
    const dateFrom = searchParams.get('date_from') || undefined
    const dateTo = searchParams.get('date_to') || undefined

    const orders = await client.getOrders({
      page,
      per_page: perPage,
      status: status || undefined,
      date_from: dateFrom,
      date_to: dateTo,
    })

    return NextResponse.json({
      success: true,
      orders: orders.data,
      pagination: orders.pagination,
    })
  } catch (error) {
    console.error('Zendrop orders error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// ============ POST /api/zendrop/orders ============
export async function POST(request: NextRequest) {
  try {
    const client = getClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Zendrop API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { action, ...orderData } = body

    switch (action) {
      case 'create': {
        // Create a new order in Zendrop
        const { items, shipping_address, shipping_method, notes, customer_email } = orderData

        const order = await client.createOrder({
          items: items.map((item: { product_id: number; variant_id?: number; quantity: number }) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          shipping_address,
          shipping_method,
          notes,
          customer_email,
        })

        return NextResponse.json({
          success: true,
          order: {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            tracking_number: order.tracking_number,
          },
        })
      }

      case 'cancel': {
        // Cancel an order
        const { orderId, reason } = orderData
        const order = await client.cancelOrder(parseInt(orderId), reason)

        return NextResponse.json({
          success: true,
          order: {
            id: order.id,
            status: order.status,
          },
        })
      }

      case 'shipping_rates': {
        // Get shipping rates for an order
        const { orderId } = orderData
        const rates = await client.getShippingRates(parseInt(orderId))

        return NextResponse.json({
          success: true,
          rates: rates.rates,
        })
      }

      case 'tracking': {
        // Get tracking info for an order
        const { orderId } = orderData
        const tracking = await client.getTracking(parseInt(orderId))

        return NextResponse.json({
          success: true,
          tracking,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Zendrop order action error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process action' },
      { status: 500 }
    )
  }
}
