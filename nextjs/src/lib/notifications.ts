/**
 * Notification Utility Functions
 * دوال مساعدة لإنشاء الإشعارات بسهولة من أي مكان في التطبيق
 */

import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';
import type { NotificationType, NotificationPriority } from '@/lib/types/supabase';

const supabase = createClient<Database>();

interface CreateNotificationParams {
  title: string;
  message?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  relatedEntityId?: string;
  recipientId?: string;
  metadata?: Record<string, any>;
}

/**
 * إنشاء إشعار جديد
 */
export async function createNotification(params: CreateNotificationParams): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        title: params.title,
        message: params.message || null,
        type: params.type || 'system',
        priority: params.priority || 'normal',
        link: params.link || null,
        related_entity_id: params.relatedEntityId || null,
        recipient_id: params.recipientId || null,
        metadata: params.metadata || null,
        is_read: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * إنشاء إشعار طلب جديد
 */
export async function notifyNewOrder(orderId: string, orderNumber: string, total: number) {
  return createNotification({
    title: `طلب جديد #${orderNumber}`,
    message: `تم استلام طلب جديد بمبلغ $${total.toFixed(2)}`,
    type: 'order',
    priority: 'high',
    link: `/admin-control/orders/${orderId}`,
    relatedEntityId: orderId,
    metadata: { orderNumber, total },
  });
}

/**
 * إنشاء إشعار حالة طلب
 */
export async function notifyOrderStatusChange(
  orderId: string,
  orderNumber: string,
  oldStatus: string,
  newStatus: string
) {
  return createNotification({
    title: `تحديث حالة الطلب #${orderNumber}`,
    message: `تم تغيير حالة الطلب من "${oldStatus}" إلى "${newStatus}"`,
    type: 'order',
    priority: 'normal',
    link: `/admin-control/orders/${orderId}`,
    relatedEntityId: orderId,
    metadata: { orderNumber, oldStatus, newStatus },
  });
}

/**
 * إنشاء إشعار منتج منخفض المخزون
 */
export async function notifyLowStock(productId: string, productName: string, quantity: number) {
  return createNotification({
    title: `تنبيه: انخفاض المخزون`,
    message: `منتج "${productName}"只剩 ${quantity} 件 في المخزون`,
    type: 'product',
    priority: quantity <= 5 ? 'critical' : 'high',
    link: `/admin-control/products/${productId}`,
    relatedEntityId: productId,
    metadata: { productName, quantity },
  });
}

/**
 * إنشاء إشعار عميل جديد
 */
export async function notifyNewCustomer(customerId: string, customerName: string, email: string) {
  return createNotification({
    title: `عميل جديد: ${customerName}`,
    message: `تم تسجيل عميل جديد بالبريد الإلكتروني ${email}`,
    type: 'customer',
    priority: 'low',
    link: `/admin-control/customers/${customerId}`,
    relatedEntityId: customerId,
    metadata: { customerName, email },
  });
}

/**
 * إنشاء إشعار دفعة ناجحة
 */
export async function notifyPaymentSuccess(orderId: string, orderNumber: string, amount: number) {
  return createNotification({
    title: `دفعة ناجحة #${orderNumber}`,
    message: `تم استلام دفعة بقيمة $${amount.toFixed(2)}`,
    type: 'payment',
    priority: 'normal',
    link: `/admin-control/orders/${orderId}`,
    relatedEntityId: orderId,
    metadata: { orderNumber, amount },
  });
}

/**
 * إنشاء إشعار دفعة فاشلة
 */
export async function notifyPaymentFailed(orderId: string, orderNumber: string, reason: string) {
  return createNotification({
    title: `دفعة فاشلة #${orderNumber}`,
    message: `فشلت دفعة الطلب: ${reason}`,
    type: 'payment',
    priority: 'critical',
    link: `/admin-control/orders/${orderId}`,
    relatedEntityId: orderId,
    metadata: { orderNumber, reason },
  });
}

/**
 * إنشاء إشعار تحديث الشحن
 */
export async function notifyShippingUpdate(
  orderId: string,
  orderNumber: string,
  trackingNumber: string,
  status: string
) {
  return createNotification({
    title: `تحديث الشحن #${orderNumber}`,
    message: `تم تحديث حالة الشحن: ${status} - رقم التتبع: ${trackingNumber}`,
    type: 'shipping',
    priority: 'normal',
    link: `/admin-control/orders/${orderId}`,
    relatedEntityId: orderId,
    metadata: { orderNumber, trackingNumber, status },
  });
}

/**
 * إنشاء إشعار خطأ في النظام
 */
export async function notifySystemError(errorMessage: string, errorDetails?: string) {
  return createNotification({
    title: `خطأ في النظام`,
    message: errorDetails || errorMessage,
    type: 'system',
    priority: 'critical',
    link: '/admin-control/logs',
    metadata: { errorMessage, errorDetails, timestamp: new Date().toISOString() },
  });
}

/**
 * إنشاء إشعار تذكير
 */
export async function notifyReminder(title: string, message: string, link?: string) {
  return createNotification({
    title,
    message,
    type: 'system',
    priority: 'normal',
    link,
  });
}
