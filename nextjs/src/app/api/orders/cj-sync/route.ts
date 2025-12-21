import { NextRequest, NextResponse } from 'next/server'
import { StoreServices } from '@/lib/store-services'

export async function POST(request: NextRequest) {
  try {
    const { action, orderId } = await request.json()

    switch (action) {
      case 'create':
        return await handleCreateCJOrder(orderId)
      
      case 'sync':
        return await handleSyncOrderStatus(orderId)
      
      case 'cancel':
        return await handleCancelOrder(orderId)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('CJ orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

async function handleCreateCJOrder(orderId: string) {
  try {
    const cjOrder = await StoreServices.createCJOrder(orderId)
    
    return NextResponse.json({ 
      success: true, 
      cjOrder 
    })
  } catch (error) {
    console.error('Error creating CJ order:', error)
    return NextResponse.json(
      { error: 'Failed to create CJ order' }, 
      { status: 500 }
    )
  }
}

async function handleSyncOrderStatus(orderId: string) {
  try {
    const status = await StoreServices.syncOrderStatus(orderId)
    
    return NextResponse.json({ 
      success: true, 
      status 
    })
  } catch (error) {
    console.error('Error syncing order status:', error)
    return NextResponse.json(
      { error: 'Failed to sync order status' }, 
      { status: 500 }
    )
  }
}

async function handleCancelOrder(orderId: string) {
  try {
    // Get order details
    const { data: order } = await StoreServices.getOrders({ limit: 1, offset: 0 })
    const targetOrder = order?.find(o => o.id === orderId)
    
    if (!targetOrder?.cj_order_id) {
      throw new Error('Order not found or not linked to CJdropshipping')
    }

    // Cancel in CJdropshipping
    // Note: This would need to be implemented in the cjAPI class
    // await cjAPI.cancelOrder(targetOrder.cj_order_id, 'Customer requested cancellation')

    // Update local order status
    await StoreServices.updateOrderStatus(orderId, 'cancelled')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order cancelled successfully' 
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' }, 
      { status: 500 }
    )
  }
}