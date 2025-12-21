import { NextRequest, NextResponse } from 'next/server';
import { StoreServices } from '@/lib/store-services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      status: searchParams.get('status') as any,
      payment_status: searchParams.get('payment_status') as any,
      customer_id: searchParams.get('customer_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const orders = await StoreServices.getOrders(filters);
    
    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Create new order
    const order = await StoreServices.createOrder(orderData);
    
    return NextResponse.json({
      success: true,
      order
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}