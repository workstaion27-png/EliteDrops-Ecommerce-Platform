import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';
import { createMessagingService } from '@/lib/messaging-service';
import { replaceTemplateVariables } from '@/lib/messaging-service';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - إرسال رسالة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      templateId, 
      channel, 
      customVariables,
      customSubject,
      customBody,
    } = body;

    if (!orderId || !channel) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    // إنشاء خدمة المراسلات
    const messagingService = createMessagingService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        twilio: {
          accountSid: process.env.TWILIO_ACCOUNT_SID || '',
          authToken: process.env.TWILIO_AUTH_TOKEN || '',
          fromNumber: process.env.TWILIO_PHONE_NUMBER || '',
        },
        sendgrid: {
          apiKey: process.env.SENDGRID_API_KEY || '',
          fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
          fromName: process.env.NEXT_PUBLIC_STORE_NAME || 'متجرنا',
        },
      }
    );

    // جلب بيانات الطلب والعميل
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, customer:customers(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    const customer = order.customer as any;
    let result;

    if (templateId) {
      // إرسال باستخدام قالب
      const { data: template } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!template) {
        return NextResponse.json(
          { success: false, error: 'القالب غير موجود' },
          { status: 404 }
        );
      }

      // استبدال المتغيرات
      const variables = {
        order_id: order.order_number,
        customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'عزيزي العميل',
        customer_first_name: customer.first_name || 'عزيزي العميل',
        order_total: order.total,
        ...customVariables,
      };

      const subject = template.subject 
        ? replaceTemplateVariables(template.subject, variables)
        : undefined;
      const body = replaceTemplateVariables(template.body_content, variables);

      result = await messagingService.sendCustomMessage(
        orderId,
        channel,
        { subject, body },
        channel === 'sms' ? customer.phone : customer.email
      );
    } else {
      // إرسال رسالة مخصصة
      result = await messagingService.sendCustomMessage(
        orderId,
        channel,
        {
          subject: customSubject,
          body: customBody || 'رسالة من متجرنا',
        },
        channel === 'sms' ? customer.phone : customer.email
      );
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إرسال الرسالة' },
      { status: 500 }
    );
  }
}
