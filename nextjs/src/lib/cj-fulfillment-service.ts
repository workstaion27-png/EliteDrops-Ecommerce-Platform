/**
 * CJ Dropshipping Fulfillment Service
 * خدمة تنفيذ طلبات CJ Dropshipping تلقائياً
 * 
 * المميزات:
 * - إنشاء طلبات CJ تلقائياً عند طلب العميل
 * - تحديث حالة الطلبات
 * - تتبع الشحونات
 * - مزامنة المخزون
 * - إدارة الأخطاء والإشعارات
 */

import { createClient } from '@/lib/supabase';
import type { Database } from './types/supabase';

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  sku?: string;
  cjProductId?: string;
  cjVariantId?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

interface CJOrderResult {
  success: boolean;
  cjOrderId?: string;
  error?: string;
  trackingNumber?: string;
  status?: string;
}

interface FulfillmentConfig {
  autoFulfill: boolean;
  minStockThreshold: number;
  syncInterval: number;
  defaultWarehouse: string;
  shippingMethod: string;
}

const DEFAULT_CONFIG: FulfillmentConfig = {
  autoFulfill: true,
  minStockThreshold: 5,
  syncInterval: 3600000, // كل ساعة
  defaultWarehouse: 'CN',
  shippingMethod: 'ePacket',
};

export class CJFulfillmentService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private config: FulfillmentConfig;
  private crypto: any;

  constructor(config?: Partial<FulfillmentConfig>) {
    this.supabase = createClient<Database>();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.crypto = require('crypto');
  }

  /**
   * تنفيذ طلب تلقائياً في CJ
   */
  async fulfillOrder(
    localOrderId: string,
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    customerEmail?: string
  ): Promise<CJOrderResult> {
    try {
      // 1. التحقق من الإعدادات
      const config = await this.getCJConfig();
      if (!config.appKey || !config.secretKey) {
        throw new Error('CJ API credentials not configured');
      }

      // 2. التحقق من توفر المخزون
      const stockCheck = await this.checkStockAvailability(items);
      if (!stockCheck.available) {
        throw new Error(`Out of stock: ${stockCheck.unavailableItems.join(', ')}`);
      }

      // 3. إنشاء الطلب في CJ
      const cjOrderResult = await this.createCJOrder(
        config.appKey,
        config.secretKey,
        items,
        shippingAddress,
        customerEmail
      );

      if (!cjOrderResult.success) {
        throw new Error(cjOrderResult.error);
      }

      // 4. حفظ سجل التنفيذ
      await this.saveFulfillmentRecord({
        orderId: localOrderId,
        cjOrderId: cjOrderResult.cjOrderId!,
        status: 'PROCESSING',
        items: items,
        shippingAddress: shippingAddress,
      });

      // 5. تحديث حالة الطلب المحلي
      await this.updateOrderStatus(localOrderId, 'processing', {
        cjOrderId: cjOrderResult.cjOrderId,
        fulfillmentStatus: 'fulfilled',
      });

      return {
        success: true,
        cjOrderId: cjOrderResult.cjOrderId,
        status: 'PROCESSING',
      };
    } catch (error: any) {
      console.error('Fulfillment Error:', error);

      // حفظ سجل الخطأ
      await this.saveFulfillmentRecord({
        orderId: localOrderId,
        cjOrderId: null,
        status: 'FAILED',
        error: error.message,
        items: items,
        shippingAddress: shippingAddress,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * إنشاء طلب في CJ API
   */
  private async createCJOrder(
    appKey: string,
    secretKey: string,
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    customerEmail?: string
  ): Promise<{ success: boolean; cjOrderId?: string; error?: string }> {
    try {
      const timestamp = Date.now();
      const sign = this.generateSign(appKey, secretKey, timestamp);

      // تحويل عناصر الطلب لتنسيق CJ
      const CJItems = items.map(item => ({
        productId: item.cjProductId,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
      }));

      // بيانات الطلب
      const orderData = {
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
        email: customerEmail || shippingAddress.email,
        items: CJItems,
        warehouse: this.config.defaultWarehouse,
        shippingMethod: this.config.shippingMethod,
      };

      // إرسال الطلب إلى CJ
      const response = await fetch('https://api.cjdropshipping.com/api/v1/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': appKey,
          'X-Sign': sign,
          'X-Timestamp': timestamp.toString(),
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          cjOrderId: data.data?.orderId || data.data?.order_number,
        };
      } else {
        return {
          success: false,
          error: data.message || 'فشل إنشاء الطلب في CJ',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * التحقق من توفر المخزون
   */
  private async checkStockAvailability(
    items: OrderItem[]
  ): Promise<{ available: boolean; unavailableItems: string[] }> {
    const unavailableItems: string[] = [];

    for (const item of items) {
      if (item.cjProductId) {
        const stock = await this.getCJProductStock(item.cjProductId, item.cjVariantId);
        if (stock < item.quantity) {
          unavailableItems.push(item.sku || item.cjProductId);
        }
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems,
    };
  }

  /**
   * جلب المخزون من CJ
   */
  private async getCJProductStock(
    productId: string,
    variantId?: string
  ): Promise<number> {
    try {
      const config = await this.getCJConfig();
      const timestamp = Date.now();
      const sign = this.generateSign(config.appKey, config.secretKey, timestamp);

      const url = variantId
        ? `https://api.cjdropshipping.com/api/v1/product/detail?id=${productId}&vid=${variantId}`
        : `https://api.cjdropshipping.com/api/v1/product/detail?id=${productId}`;

      const response = await fetch(url, {
        headers: {
          'X-App-Key': config.appKey,
          'X-Sign': sign,
          'X-Timestamp': timestamp.toString(),
        },
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data?.stock || 0;
      }
    } catch (error) {
      console.error('Error fetching CJ stock:', error);
    }

    return 0;
  }

  /**
   * جلب حالة الطلب من CJ
   */
  async getOrderStatus(cjOrderId: string): Promise<{
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
  } | null> {
    try {
      const config = await this.getCJConfig();
      const timestamp = Date.now();
      const sign = this.generateSign(config.appKey, config.secretKey, timestamp);

      const response = await fetch(
        `https://api.cjdropshipping.com/api/v1/order/detail?orderId=${cjOrderId}`,
        {
          headers: {
            'X-App-Key': config.appKey,
            'X-Sign': sign,
            'X-Timestamp': timestamp.toString(),
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        return {
          status: this.mapCJStatus(data.data.status),
          trackingNumber: data.data.trackingNumber || data.data.tracking_no,
          trackingUrl: data.data.trackingUrl || data.data.tracking_url,
          carrier: data.data.carrier || data.data.shippingCompany,
        };
      }
    } catch (error) {
      console.error('Error fetching CJ order status:', error);
    }

    return null;
  }

  /**
   * تحويل حالة CJ للحالة المحلية
   */
  private mapCJStatus(cjStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'paid': 'processing',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
    };

    return statusMap[cjStatus?.toLowerCase()] || 'unknown';
  }

  /**
   * مزامنة حالة جميع الطلبات
   */
  async syncAllOrders(): Promise<{
    synced: number;
    errors: number;
    updatedOrders: string[];
  }> {
    const { data: pendingOrders } = await this.supabase
      .from('fulfillment_orders')
      .select('*')
      .in('status', ['PROCESSING', 'PENDING'])
      .neq('cj_order_id', null);

    let synced = 0;
    let errors = 0;
    const updatedOrders: string[] = [];

    if (pendingOrders) {
      for (const order of pendingOrders) {
        const status = await this.getOrderStatus(order.cj_order_id);
        
        if (status) {
          // تحديث الحالة
          await this.supabase
            .from('fulfillment_orders')
            .update({
              status: status.status.toUpperCase(),
              tracking_number: status.trackingNumber,
              tracking_url: status.trackingUrl,
              carrier: status.carrier,
              last_sync: new Date().toISOString(),
            })
            .eq('id', order.id);

          // تحديث الطلب المحلي إذا تم الشحن
          if (status.status === 'shipped') {
            await this.supabase
              .from('orders')
              .update({
                status: 'shipped',
                tracking_number: status.trackingNumber,
                tracking_url: status.trackingUrl,
              })
              .eq('id', order.order_id);
          }

          synced++;
          updatedOrders.push(order.order_id);
        } else {
          errors++;
        }
      }
    }

    return {
      synced,
      errors,
      updatedOrders,
    };
  }

  /**
   * حفظ سجل التنفيذ
   */
  private async saveFulfillmentRecord(record: {
    orderId: string;
    cjOrderId: string | null;
    status: string;
    error?: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
  }): Promise<void> {
    await this.supabase.from('fulfillment_orders').insert({
      order_id: record.orderId,
      cj_order_id: record.cjOrderId,
      status: record.status,
      error_log: record.error || null,
      items: record.items,
      shipping_address: record.shippingAddress,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * تحديث حالة الطلب المحلي
   */
  private async updateOrderStatus(
    orderId: string,
    status: string,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    await this.supabase
      .from('orders')
      .update({
        status: status,
        ...additionalData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
  }

  /**
   * جلب إعدادات CJ
   */
  private async getCJConfig(): Promise<{ appKey: string; secretKey: string }> {
    const { data } = await this.supabase
      .from('platform_config')
      .select('config')
      .eq('id', 'default')
      .single();

    return {
      appKey: data?.config?.cj?.appKey || process.env.CJ_APP_KEY || '',
      secretKey: data?.config?.cj?.secretKey || process.env.CJ_SECRET_KEY || '',
    };
  }

  /**
   * توليد توقيع CJ
   */
  private generateSign(appKey: string, secretKey: string, timestamp: number): string {
    const signStr = `appKey${appKey}timestamp${timestamp}`;
    return this.crypto
      .createHmac('sha256', secretKey)
      .update(signStr)
      .digest('hex');
  }

  /**
   * الحصول على سجل التنفيذ لطلب
   */
  async getFulfillmentHistory(orderId: string) {
    const { data } = await this.supabase
      .from('fulfillment_orders')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    return data;
  }

  /**
   * إلغاء طلب في CJ
   */
  async cancelOrder(cjOrderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = await this.getCJConfig();
      const timestamp = Date.now();
      const sign = this.generateSign(config.appKey, config.secretKey, timestamp);

      const response = await fetch(
        'https://api.cjdropshipping.com/api/v1/order/cancel',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-App-Key': config.appKey,
            'X-Sign': sign,
            'X-Timestamp': timestamp.toString(),
          },
          body: JSON.stringify({ orderId: cjOrderId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // تحديث سجل التنفيذ
        await this.supabase
          .from('fulfillment_orders')
          .update({
            status: 'CANCELLED',
            updated_at: new Date().toISOString(),
          })
          .eq('cj_order_id', cjOrderId);

        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// إنشاء instance افتراضي
export const cjFulfillmentService = new CJFulfillmentService();

// دوال مساعدة للاستخدام المباشر

/**
 * دالة سريعة لتنفيذ طلب
 */
export async function quickFulfillOrder(
  orderId: string,
  items: OrderItem[],
  shippingAddress: ShippingAddress,
  email?: string
): Promise<CJOrderResult> {
  return await cjFulfillmentService.fulfillOrder(
    orderId,
    items,
    shippingAddress,
    email
  );
}

/**
 * دالة سريعة لمزامنة الطلبات
 */
export async function quickSyncOrders(): Promise<{
  synced: number;
  errors: number;
}> {
  const result = await cjFulfillmentService.syncAllOrders();
  return {
    synced: result.synced,
    errors: result.errors,
  };
}
