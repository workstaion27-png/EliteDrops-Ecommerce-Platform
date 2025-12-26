import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/supabase';
import { createTrackingService, CARRIERS } from '@/lib/tracking-service';
import { createMessagingService } from '@/lib/messaging-service';
import { generateTrackingUrl } from '@/lib/messaging-service';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - جلب شركات الشحن أو التتبع
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const orderId = searchParams.get('orderId');
    const carriers = searchParams.get('carriers');

    if (carriers === 'true') {
      return NextResponse.json({ 
        success: true, 
        data: CARRIERS,
      });
    }

    if (trackingNumber) {
      const trackingService = createTrackingService(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const results = await trackingService.searchTracking(trackingNumber);
      return NextResponse.json({ success: true, data: results });
    }

    if (orderId) {
      const trackingService = createTrackingService(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const results = await trackingService.getOrderTracking(orderId);
      return NextResponse.json({ success: true, data: results });
    }

    return NextResponse.json(
      { success: false, error: 'معايير البحث غير صالحة' },
      { status: 400 }
    );
  } catch (error) {
    console.error('خطأ في جلب التتبع:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب بيانات التتبع' },
      { status: 500 }
    );
  }
}

// POST - إضافة تتبع جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      carrierName,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      notes,
      notifyCustomer,
    } = body;

    if (!orderId || !carrierName || !trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    const trackingService = createTrackingService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // التحقق من صحة رقم التتبع
    const validation = trackingService.validateTrackingNumber(
      carrierName,
      trackingNumber
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.message },
        { status: 400 }
      );
    }

    // إنشاء URL التتبع
    const finalTrackingUrl = trackingUrl || 
      generateTrackingUrl(carrierName, trackingNumber);

    // إضافة التتبع
    const result = await trackingService.addTracking({
      orderId,
      carrierName,
      trackingNumber,
      trackingUrl: finalTrackingUrl,
      estimatedDelivery,
      notes,
      notifyCustomer,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // إذا طُلب إشعار العميل، نرسل رسالة
    if (notifyCustomer) {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, customer:customers(*)')
        .eq('id', orderId)
        .single();

      if (order) {
        const messagingService = createMessagingService(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            sendgrid: {
              apiKey: process.env.SENDGRID_API_KEY || '',
              fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
              fromName: process.env.NEXT_PUBLIC_STORE_NAME || 'متجرنا',
            },
          }
        );

        const customer = order.customer as any;
        const message = trackingService.createTrackingNotificationMessage(
          trackingNumber,
          carrierName,
          finalTrackingUrl,
          order.order_number
        );

        await messagingService.sendCustomMessage(
          orderId,
          'email',
          message,
          customer.email
        );
      }
    }

    return NextResponse.json({
      success: true,
      trackingId: result.trackingId,
      trackingUrl: finalTrackingUrl,
    });
  } catch (error) {
    console.error('خطأ في إضافة التتبع:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إضافة التتبع' },
      { status: 500 }
    );
  }
}

// PUT - تحديث حالة التتبع
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingId, status } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    const trackingService = createTrackingService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const result = await trackingService.updateTrackingStatus(trackingId, status);

    return NextResponse.json(result);
  } catch (error) {
    console.error('خطأ في تحديث التتبع:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث التتبع' },
      { status: 500 }
    );
  }
}

// DELETE - حذف التتبع
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId');

    if (!trackingId) {
      return NextResponse.json(
        { success: false, error: 'معرف التتبع مطلوب' },
        { status: 400 }
      );
    }

    const trackingService = createTrackingService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const result = await trackingService.deleteTracking(trackingId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('خطأ في حذف التتبع:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف التتبع' },
      { status: 500 }
    );
  }
}
