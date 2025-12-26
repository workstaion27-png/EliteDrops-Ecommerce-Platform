/**
 * Messaging Service - خدمة المراسلات
 * إرسال SMS عبر Twilio والبريد الإلكتروني عبر SendGrid
 */

import type { Database } from './types/supabase';

// نوع القناة
type Channel = 'sms' | 'email';

// نوع حالة الرسالة
type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed';

// نوع محتوى الرسالة
interface MessageContent {
  subject?: string;
  body: string;
}

// متغيرات القالب
interface TemplateVariables {
  [key: string]: string | number | boolean;
}

// نتيجة الإرسال
interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// إعدادات المزود
interface ProviderConfig {
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
}

// دالة استبدال المتغيرات في القالب
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }
  
  return result;
}

// دالة حساب عدد أحرف الرسالة (لـ SMS)
export function calculateSmsSegments(text: string): number {
  const length = text.length;
  if (length <= 160) return 1;
  return Math.ceil(length / 153);
}

// دالة توليد رابط التتبع
export function generateTrackingUrl(carrier: string, trackingNumber: string): string {
  const carrierUrls: Record<string, string> = {
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    'aramex': `https://www.aramex.com/track/results?shipmentnumber=${trackingNumber}`,
    'default': `https://track.example.com/${trackingNumber}`,
  };
  
  return carrierUrls[carrier.toLowerCase()] || carrierUrls['default'];
}

class MessagingService {
  private supabase: ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;
  private config: ProviderConfig;

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    config: ProviderConfig
  ) {
    this.supabase = require('@supabase/supabase-js').createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    );
    this.config = config;
  }

  // إرسال رسالة SMS عبر Twilio
  async sendSms(to: string, body: string): Promise<SendResult> {
    try {
      if (!this.config.twilio) {
        throw new Error('Twilio is not configured');
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio.accountSid}/Messages.json`;
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${this.config.twilio.accountSid}:${this.config.twilio.authToken}`
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: this.config.twilio.fromNumber,
          Body: body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      };
    }
  }

  // إرسال بريد إلكتروني عبر SendGrid
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    htmlBody?: string
  ): Promise<SendResult> {
    try {
      if (!this.config.sendgrid) {
        throw new Error('SendGrid is not configured');
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.sendgrid.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
          }],
          from: {
            email: this.config.sendgrid.fromEmail,
            name: this.config.sendgrid.fromName,
          },
          subject: subject,
          content: [
            {
              type: 'text/plain',
              value: body,
            },
            ...(htmlBody ? [{
              type: 'text/html',
              value: htmlBody,
            }] : []),
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid error: ${errorText}`);
      }

      const messageId = response.headers.get('x-message-id') || 'unknown';

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  // إرسال رسالة باستخدام قالب
  async sendFromTemplate(
    templateId: string,
    orderId: string,
    variables: TemplateVariables,
    channel: Channel
  ): Promise<SendResult> {
    try {
      // جلب القالب
      const { data: template } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!template) {
        throw new Error('Template not found');
      }

      // استبدال المتغيرات
      const subject = template.subject 
        ? replaceTemplateVariables(template.subject, variables)
        : undefined;
      const body = replaceTemplateVariables(template.body_content, variables);

      // جلب بيانات الطلب والعميل
      const { data: order } = await this.supabase
        .from('orders')
        .select('*, customer:customers(*)')
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      const customer = order.customer as any;
      const recipient = channel === 'sms' ? customer.phone : customer.email;

      if (!recipient) {
        throw new Error(`Customer ${channel} is not available`);
      }

      // إنشاء سجل المراسلة
      const { data: log, error: logError } = await this.supabase
        .from('communication_logs')
        .insert({
          order_id: orderId,
          customer_id: customer.id,
          channel,
          direction: 'outbound',
          status: 'queued',
          subject,
          content_snapshot: body,
          recipient,
          metadata: {
            template_id: templateId,
            variables,
          },
        })
        .select()
        .single();

      if (logError) throw logError;

      // إرسال الرسالة
      let result: SendResult;
      
      if (channel === 'sms') {
        result = await this.sendSms(recipient, body);
      } else {
        const htmlBody = this.convertToHtml(body);
        result = await this.sendEmail(recipient, subject || 'إشعار', body, htmlBody);
      }

      // تحديث حالة الرسالة
      await this.supabase
        .from('communication_logs')
        .update({
          status: result.success ? 'sent' : 'failed',
          provider_message_id: result.messageId,
          error_message: result.error,
        })
        .eq('id', log.id);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  // تحويل النص إلى HTML
  private convertToHtml(text: string): string {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'متجرنا';
    
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إشعار من ${storeName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0;">${storeName}</h1>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${text.split('\n').map(p => `<p style="margin: 10px 0;">${p}</p>`).join('')}
        </div>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${storeName}. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // إرسال رسالة مخصصة
  async sendCustomMessage(
    orderId: string,
    channel: Channel,
    content: MessageContent,
    recipient?: string
  ): Promise<SendResult> {
    try {
      // جلب بيانات الطلب والعميل
      const { data: order } = await this.supabase
        .from('orders')
        .select('*, customer:customers(*)')
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      const customer = order.customer as any;
      const targetRecipient = recipient || (channel === 'sms' ? customer.phone : customer.email);

      if (!targetRecipient) {
        throw new Error(`Customer ${channel} is not available`);
      }

      // إنشاء سجل المراسلة
      const { data: log, error: logError } = await this.supabase
        .from('communication_logs')
        .insert({
          order_id: orderId,
          customer_id: customer.id,
          channel,
          direction: 'outbound',
          status: 'queued',
          subject: content.subject,
          content_snapshot: content.body,
          recipient: targetRecipient,
        })
        .select()
        .single();

      if (logError) throw logError;

      // إرسال الرسالة
      let result: SendResult;
      
      if (channel === 'sms') {
        result = await this.sendSms(targetRecipient, content.body);
      } else {
        const htmlBody = this.convertToHtml(content.body);
        result = await this.sendEmail(
          targetRecipient,
          content.subject || 'إشعار من متجرنا',
          content.body,
          htmlBody
        );
      }

      // تحديث حالة الرسالة
      await this.supabase
        .from('communication_logs')
        .update({
          status: result.success ? 'sent' : 'failed',
          provider_message_id: result.messageId,
          error_message: result.error,
        })
        .eq('id', log.id);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  // جلب سجل المراسلات لطلب
  async getOrderCommunications(orderId: string) {
    const { data, error } = await this.supabase
      .from('communication_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // جلب جميع القوالب
  async getTemplates(filters?: {
    channel?: Channel;
    trigger_event?: string;
    is_active?: boolean;
  }) {
    let query = this.supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.channel) {
      query = query.eq('channel', filters.channel);
    }
    if (filters?.trigger_event) {
      query = query.eq('trigger_event', filters.trigger_event);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // إنشاء أو تحديث قالب
  async upsertTemplate(template: {
    id?: string;
    name: string;
    description?: string;
    channel: Channel;
    trigger_event: string;
    subject?: string;
    body_content: string;
    is_active?: boolean;
  }) {
    const { data, error } = await this.supabase
      .from('notification_templates')
      .upsert({
        ...template,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // حذف قالب
  async deleteTemplate(templateId: string) {
    const { error } = await this.supabase
      .from('notification_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  }
}

// إنشاء الخدمة
export function createMessagingService(
  supabaseUrl: string,
  supabaseServiceKey: string,
  config: ProviderConfig
): MessagingService {
  return new MessagingService(supabaseUrl, supabaseServiceKey, config);
}

export {
  MessagingService,
  type SendResult,
  type MessageContent,
  type TemplateVariables,
  type Channel,
};
