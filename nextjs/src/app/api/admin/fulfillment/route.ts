/**
 * Order Fulfillment API - Auto Route to CJ
 * واجهة برمجة التطبيقات لتنفيذ الطلبات تلقائياً
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cjFulfillmentService, quickFulfillOrder, quickSyncOrders } from '@/lib/cj-fulfillment-service';
import type { Database } from '../../../lib/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - جلب حالة التنفيذ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const action = searchParams.get('action');

    // مزامنة جميع الطلبات
    if (action === 'sync') {
      const syncResult = await quickSyncOrders();
      return NextResponse.json({
        success: true,
        message: 'تم مزامنة الطلبات بنجاح',
        data: syncResult,
      });
    }

    // جلب سجل تنفيذ طلب محدد
    if (orderId) {
      const history = await cjFulfillmentService.getFulfillmentHistory(orderId);
      return NextResponse.json({
        success: true,
        data: history,
      });
    }

    // جلب جميع طلبات التنفيذ المعلقة
    const { data: pendingOrders, error } = await supabase
      .from('fulfillment_orders')
      .select('*, orders(*)')
      .in('status', ['PENDING', 'PROCESSING'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: pendingOrders,
    });
  } catch (error: any) {
    console.error('Fulfillment GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - تنفيذ طلب في CJ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items, shippingAddress, customerEmail, autoExecute = true } = body;

    if (!orderId || !items || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'بيانات الطلب غير مكتملة' },
        { status: 400 }
      );
    }

    // التحقق من وجود الطلب
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من حالة الطلب
    if (order.status !== 'pending' && order.status !== 'paid') {
      return NextResponse.json(
        { success: false, error: `لا يمكن تنفيذ الطلب في الحالة الحالية: ${order.status}` },
        { status: 400 }
      );
    }

    if (!autoExecute) {
      // فقط التحقق من صلاحية التنفيذ
      const { data: config } = await supabase
        .from('platform_config')
        .select('config')
        .eq('id', 'default')
        .single();

      return NextResponse.json({
        success: true,
        message: 'الطلب جاهز للتنفيذ',
        data: {
          canExecute: !!(config?.config?.cj?.appKey && config?.config?.cj?.secretKey),
          orderId: orderId,
          itemCount: items.length,
        },
      });
    }

    // تنفيذ الطلب تلقائياً
    const result = await quickFulfillOrder(
      orderId,
      items,
      shippingAddress,
      customerEmail
    );

    if (result.success) {
      // تحديث جدول الطلبات المحلي
      await supabase
        .from('orders')
        .update({
          status: 'processing',
          fulfillment_status: 'fulfilled',
          cj_order_id: result.cjOrderId,
          notes: `CJ Order ID: ${result.cjOrderId}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        message: 'تم تنفيذ الطلب بنجاح في CJ',
        data: {
          orderId: orderId,
          cjOrderId: result.cjOrderId,
          status: result.status,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Fulfillment POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - مزامنة حالة الطلبات من CJ
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const syncAll = searchParams.get('syncAll') === 'true';

    if (syncAll) {
      // مزامنة جميع الطلبات
      const result = await quickSyncOrders();
      return NextResponse.json({
        success: true,
        message: `تم مزامنة ${result.synced} طلب`,
        data: result,
      });
    }

    // مزامنة طلب محدد
    const body = await request.json();
    const { cjOrderId } = body;

    if (!cjOrderId) {
      return NextResponse.json(
        { success: false, error: 'معرف طلب CJ مطلوب' },
        { status: 400 }
      );
    }

    const status = await cjFulfillmentService.getOrderStatus(cjOrderId);

    if (status) {
      // تحديث سجل التنفيذ
      await supabase
        .from('fulfillment_orders')
        .update({
          status: status.status.toUpperCase(),
          tracking_number: status.trackingNumber,
          tracking_url: status.trackingUrl,
          carrier: status.carrier,
          last_sync: new Date().toISOString(),
        })
        .eq('cj_order_id', cjOrderId);

      return NextResponse.json({
        success: true,
        data: status,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'تعذر جلب حالة الطلب' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Fulfillment PUT Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - إلغاء طلب في CJ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cjOrderId = searchParams.get('cjOrderId');
    const orderId = searchParams.get('orderId');

    if (!cjOrderId) {
      return NextResponse.json(
        { success: false, error: 'معرف طلب CJ مطلوب' },
        { status: 400 }
      );
    }

    const result = await cjFulfillmentService.cancelOrder(cjOrderId);

    if (result.success) {
      // تحديث الحالة محلياً
      if (orderId) {
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            notes: `تم إلغاء طلب CJ: ${cjOrderId}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }

      return NextResponse.json({
        success: true,
        message: 'تم إلغاء الطلب بنجاح',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Fulfillment DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
