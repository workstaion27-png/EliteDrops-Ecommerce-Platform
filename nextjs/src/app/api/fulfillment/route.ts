import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';
import { 
  fulfillOrder, 
  updateOrderStatusFromPlatform, 
  getFulfillmentStatus, 
  getPendingFulfillmentOrders,
  retryFulfillment,
  cancelFulfillment,
  getFulfillmentStats
} from '@/lib/fulfillment-service';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get fulfillment status or stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const stats = searchParams.get('stats') === 'true';
    const pending = searchParams.get('pending') === 'true';

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    if (orderId) {
      const status = await getFulfillmentStatus(orderId);
      if (!status) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, status });
    }

    if (stats) {
      const fulfillmentStats = await getFulfillmentStats();
      return NextResponse.json({ success: true, stats: fulfillmentStats });
    }

    if (pending) {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const result = await getPendingFulfillmentOrders({ page, limit });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error in fulfillment API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Fulfill order or update status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, order_id } = body;

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    switch (action) {
      case 'fulfill': {
        const result = await fulfillOrder(order_id, { force: body.force || false });
        return NextResponse.json(result);
      }

      case 'update_status': {
        const result = await updateOrderStatusFromPlatform(
          order_id,
          body.platform,
          body.external_order_id,
          body.status,
          body.tracking_data
        );
        return NextResponse.json(result);
      }

      case 'retry': {
        const result = await retryFulfillment(order_id);
        return NextResponse.json(result);
      }

      case 'cancel': {
        const result = await cancelFulfillment(order_id, body.reason);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in fulfillment API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
