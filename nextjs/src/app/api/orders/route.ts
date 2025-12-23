import { NextRequest, NextResponse } from 'next/server'
import { StoreServices } from '@/lib/store-services'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      status: searchParams.get('status') as any,
      payment_status: searchParams.get('payment_status') as any,
      customer_id: searchParams.get('customer_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const orders = await StoreServices.getOrders(filters)
    
    return NextResponse.json({ 
      success: true, 
      orders 
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    // Validate required fields
    if (!orderData.customer_id || !orderData.total_amount || !orderData.items) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    const order = await StoreServices.createOrder(orderData)
    
    return NextResponse.json({ 
      success: true, 
      order 
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, payment_status } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' }, 
        { status: 400 }
      )
    }

    let updatedOrder
    
    if (status) {
      updatedOrder = await StoreServices.updateOrderStatus(orderId, status)
    } else if (payment_status) {
      updatedOrder = await StoreServices.updatePaymentStatus(orderId, payment_status)
    } else {
      return NextResponse.json(
        { error: 'Status or payment_status is required' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' }, 
      { status: 500 }
    )
  }
}