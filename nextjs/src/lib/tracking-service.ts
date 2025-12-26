/**
 * Tracking Service - خدمة إدارة التتبع
 * إدارة أرقام التتبع وشركات الشحن
 */

import type { Database } from './types/supabase';
import { generateTrackingUrl } from './messaging-service';

// نوع حالة التتبع
type TrackingStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'failed';

// واجهة بيانات التتبع
interface TrackingData {
  orderId: string;
  carrierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  notes?: string;
  notifyCustomer?: boolean;
}

// واجهة النتيجة
interface TrackingResult {
  success: boolean;
  trackingId?: string;
  error?: string;
}

// قائمة شركات الشحن المدعومة
export const CARRIERS = [
  { id: 'ups', name: 'UPS', icon: '📦', trackingUrl: 'https://www.ups.com/track' },
  { id: 'fedex', name: 'FedEx', icon: '✈️', trackingUrl: 'https://www.fedex.com/fedextrack' },
  { id: 'usps', name: 'USPS', icon: '📬', trackingUrl: 'https://tools.usps.com/go' },
  { id: 'dhl', name: 'DHL', icon: '🌍', trackingUrl: 'https://www.dhl.com/en/express/tracking' },
  { id: 'aramex', name: 'Aramex', icon: '🚚', trackingUrl: 'https://www.aramex.com/track' },
  { id: 'smsa', name: 'SMSA Express', icon: '📋', trackingUrl: 'https://www.smsaexpress.com/track' },
  { id: 'naqel', name: 'Naqel Express', icon: '🚛', trackingUrl: 'https://www.naqelexpress.com/tracking' },
  { id: 'fantasy', name: 'Fantasy', icon: '🎁', trackingUrl: 'https://fantasy.sa/tracking' },
  { id: 'other', name: 'شركة أخرى', icon: '📤', trackingUrl: '' },
];

class TrackingService {
  private supabase: ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string
  ) {
    this.supabase = require('@supabase/supabase-js').createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    );
  }

  // إضافة تتبع لطلب
  async addTracking(data: TrackingData): Promise<TrackingResult> {
    try {
      // التحقق من وجود الطلب
      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .select('id, order_number, status')
        .eq('id', data.orderId)
        .single();

      if (orderError || !order) {
        throw new Error('الطلب غير موجود');
      }

      // إنشاء URL التتبع إذا لم يكن موجوداً
      const trackingUrl = data.trackingUrl || 
        generateTrackingUrl(data.carrierName, data.trackingNumber);

      // إدخال بيانات التتبع
      const { data: tracking, error: trackingError } = await this.supabase
        .from('order_tracking')
        .insert({
          order_id: data.orderId,
          carrier_name: data.carrierName,
          tracking_number: data.trackingNumber,
          tracking_url: trackingUrl,
          estimated_delivery: data.estimatedDelivery,
          notes: data.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (trackingError) throw trackingError;

      // تحديث حالة الطلب إذا لزم الأمر
      if (order.status !== 'shipped') {
        await this.supabase
          .from('orders')
          .update({ 
            status: 'shipped',
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.orderId);
      }

      return {
        success: true,
        trackingId: tracking.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل إضافة التتبع',
      };
    }
  }

  // تحديث حالة التتبع
  async updateTrackingStatus(
    trackingId: string,
    status: TrackingStatus
  ): Promise<TrackingResult> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // إذا تم التسليم، نحدد وقت التسليم
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('order_tracking')
        .update(updateData)
        .eq('id', trackingId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل تحديث الحالة',
      };
    }
  }

  // جلب التتبع لطلب
  async getOrderTracking(orderId: string) {
    const { data, error } = await this.supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // جلب التتبع بالمعرف
  async getTrackingById(trackingId: string) {
    const { data, error } = await this.supabase
      .from('order_tracking')
      .select('*, order:orders(*)')
      .eq('id', trackingId)
      .single();

    if (error) throw error;
    return data;
  }

  // البحث بالتتبع
  async searchTracking(trackingNumber: string) {
    const { data, error } = await this.supabase
      .from('order_tracking')
      .select('*, order:orders(order_number, customer:customers(*))')
      .ilike('tracking_number', `%${trackingNumber}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // حذف التتبع
  async deleteTracking(trackingId: string): Promise<TrackingResult> {
    try {
      const { error } = await this.supabase
        .from('order_tracking')
        .delete()
        .eq('id', trackingId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل حذف التتبع',
      };
    }
  }

  // جلب شركات الشحن
  getCarriers() {
    return CARRIERS;
  }

  // التحقق من صحة رقم التتبع
  validateTrackingNumber(carrierId: string, number: string): {
    valid: boolean;
    message?: string;
  } {
    if (!number || number.trim().length < 5) {
      return { valid: false, message: 'رقم التتبع قصير جداً' };
    }

    // التحقق حسب الشركة
    if (carrierId === 'ups') {
      if (!/^1Z[A-Z0-9]{16}$/i.test(number)) {
        return { valid: false, message: 'رقم تتبع UPS غير صالح (يجب أن يبدأ بـ 1Z)' };
      }
    } else if (carrierId === 'fedex') {
      if (!/^\d{12,22}$/.test(number)) {
        return { valid: false, message: 'رقم تتبع FedEx غير صالح' };
      }
    } else if (carrierId === 'usps') {
      if (!/^[A-Z0-9]{20,22}$/i.test(number)) {
        return { valid: false, message: 'رقم تتبع USPS غير صالح' };
      }
    }

    return { valid: true };
  }

  // إنشاء رسالة إشعار التتبع
  createTrackingNotificationMessage(
    trackingNumber: string,
    carrierName: string,
    trackingUrl: string,
    orderNumber: string
  ): { subject: string; body: string } {
    return {
      subject: `تم شحن طلبك ${orderNumber} - رابط التتبع`,
      body: `
مرحباً،

تم شحن طلبك رقم ${orderNumber} عبر شركة ${carrierName}.

رقم التتبع: ${trackingNumber}

رابط التتبع: ${trackingUrl}

يمكنك استخدام هذا الرابط لمتابعة شحنتك.

شكراً للتسوق معنا!
      `.trim(),
    };
  }
}

// إنشاء الخدمة
export function createTrackingService(
  supabaseUrl: string,
  supabaseServiceKey: string
): TrackingService {
  return new TrackingService(supabaseUrl, supabaseServiceKey);
}

export {
  TrackingService,
  type TrackingData,
  type TrackingResult,
  type TrackingStatus,
};
