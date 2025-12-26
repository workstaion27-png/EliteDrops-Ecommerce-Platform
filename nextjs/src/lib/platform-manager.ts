/**
 * Platform Manager - نظام إدارة المنصات
 * يتيح التبديل بين المنصات المختلفة: المحلية، Zendrop، AppScenic
 */

import type { Database } from './types/supabase';
import type { Product, Order } from './types';

// نوع المنصة
type SupportedPlatform = 'local' | 'zendrop' | 'appscenic';

// إعدادات المنصة
interface PlatformConfig {
  platform: SupportedPlatform;
  local?: {
    enabled: boolean;
  };
  zendrop?: {
    enabled: boolean;
    apiKey?: string;
  };
  appscenic?: {
    enabled: boolean;
    apiKey?: string;
  };
}

// نتيجة التحقق من المخزون
interface InventoryCheck {
  productId: string;
  platform: SupportedPlatform;
  available: boolean;
  quantity: number;
  sku: string;
}

// نتيجة إنشاء الطلب
interface OrderResult {
  success: boolean;
  orderId?: string;
  platformOrderId?: string;
  error?: string;
}

// فئة إدارة المنصات
class PlatformManager {
  private supabase: ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;
  private config: PlatformConfig | null = null;

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string
  ) {
    this.supabase = require('@supabase/supabase-js').createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    );
  }

  // تحميل إعدادات المنصات من قاعدة البيانات
  async loadConfig(): Promise<PlatformConfig> {
    const { data } = await this.supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (data) {
      this.config = data.config as PlatformConfig;
    } else {
      // إعدادات افتراضية
      this.config = {
        platform: 'local',
        local: { enabled: true },
        zendrop: { enabled: false },
        appscenic: { enabled: false },
      };
    }

    return this.config;
  }

  // الحصول على المنصة الفعالة
  async getActivePlatform(): Promise<SupportedPlatform> {
    if (!this.config) {
      await this.loadConfig();
    }
    return this.config!.platform;
  }

  // تعيين المنصة الفعالة
  async setActivePlatform(platform: SupportedPlatform): Promise<void> {
    await this.loadConfig();
    
    this.config!.platform = platform;
    
    await this.supabase
      .from('platform_settings')
      .upsert({
        id: 'default',
        config: this.config,
        updated_at: new Date().toISOString(),
      });
  }

  // تفعيل أو تعطيل منصة معينة
  async setPlatformStatus(
    platform: SupportedPlatform,
    enabled: boolean,
    apiKey?: string
  ): Promise<void> {
    await this.loadConfig();

    switch (platform) {
      case 'local':
        this.config!.local = { enabled };
        break;
      case 'zendrop':
        this.config!.zendrop = {
          enabled,
          ...(apiKey && { apiKey }),
        };
        break;
      case 'appscenic':
        this.config!.appscenic = {
          enabled,
          ...(apiKey && { apiKey }),
        };
        break;
    }

    await this.supabase
      .from('platform_settings')
      .upsert({
        id: 'default',
        config: this.config,
        updated_at: new Date().toISOString(),
      });
  }

  // التحقق من المخزون عبر المنصات
  async checkInventory(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<InventoryCheck[]> {
    const results: InventoryCheck[] = [];

    for (const item of items) {
      const { data: product } = await this.supabase
        .from('products')
        .select('id, sku, inventory, appscenic_id, zendrop_id, source')
        .eq('id', item.productId)
        .single();

      if (!product) {
        results.push({
          productId: item.productId,
          platform: 'local',
          available: false,
          quantity: 0,
          sku: '',
        });
        continue;
      }

      const source = product.source as SupportedPlatform || 'local';
      
      results.push({
        productId: item.productId,
        platform: source,
        available: product.inventory >= item.quantity,
        quantity: product.inventory,
        sku: product.sku || '',
      });
    }

    return results;
  }

  // إنشاء طلب على المنصة المناسبة
  async createOrder(order: Order): Promise<OrderResult> {
    const platform = await this.getActivePlatform();

    switch (platform) {
      case 'local':
        return this.createLocalOrder(order);
      case 'zendrop':
        return this.createZendropOrder(order);
      case 'appscenic':
        return this.createAppScenicOrder(order);
      default:
        return { success: false, error: 'منصة غير مدعومة' };
    }
  }

  // إنشاء طلب محلي
  private async createLocalOrder(order: Order): Promise<OrderResult> {
    try {
      // التحقق من المخزون
      const inventoryCheck = await this.checkInventory(
        order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      const insufficientItems = inventoryCheck.filter(r => !r.available);
      if (insufficientItems.length > 0) {
        return {
          success: false,
          error: `مخزون غير كافٍ للمنتجات: ${insufficientItems.map(r => r.sku).join(', ')}`,
        };
      }

      // إنشاء الطلب في قاعدة البيانات
      const { data: orderData, error } = await this.supabase
        .from('orders')
        .insert({
          customer_id: order.customerId,
          status: 'pending',
          total: order.total,
          items: order.items,
          shipping_address: order.shipping_address,
          payment_status: 'pending',
          source: 'local',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // خصم المخزون
      for (const item of order.items) {
        const { data: product } = await this.supabase
          .from('products')
          .select('inventory')
          .eq('id', item.productId)
          .single();

        if (product) {
          await this.supabase
            .from('products')
            .update({ inventory: product.inventory - item.quantity })
            .eq('id', item.productId);
        }
      }

      return {
        success: true,
        orderId: orderData.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل إنشاء الطلب المحلي',
      };
    }
  }

  // إنشاء طلب Zendrop
  private async createZendropOrder(order: Order): Promise<OrderResult> {
    try {
      // استيراد Zendrop client ديناميكياً
      const { createZendropClient } = await import('./zendrop');
      const { data: settings } = await this.supabase
        .from('platform_settings')
        .select('config')
        .eq('id', 'default')
        .single();

      if (!settings?.config?.zendrop?.apiKey) {
        return { success: false, error: 'مفتاح API لـ Zendrop غير مضبوط' };
      }

      const zendropClient = createZendropClient(settings.config.zendrop.apiKey);
      const zendropOrder = await zendropClient.createOrder(
        zendropClient.toZendropOrder(order)
      );

      // حفظ الطلب المحلي مع معرف Zendrop
      const { data: orderData, error } = await this.supabase
        .from('orders')
        .insert({
          customer_id: order.customerId,
          status: 'pending',
          total: order.total,
          items: order.items,
          shipping_address: order.shipping_address,
          payment_status: 'pending',
          source: 'zendrop',
          zendrop_order_id: zendropOrder.id.toString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        orderId: orderData.id,
        platformOrderId: zendropOrder.id.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل إنشاء طلب Zendrop',
      };
    }
  }

  // إنشاء طلب AppScenic
  private async createAppScenicOrder(order: Order): Promise<OrderResult> {
    try {
      const { createAppScenicClient } = await import('./appscenic');
      const { data: settings } = await this.supabase
        .from('platform_settings')
        .select('config')
        .eq('id', 'default')
        .single();

      if (!settings?.config?.appscenic?.apiKey) {
        return { success: false, error: 'مفتاح API لـ AppScenic غير مضبوط' };
      }

      const appscenicClient = createAppScenicClient(settings.config.appscenic.apiKey);
      const appscenicOrder = await appscenicClient.createOrder(
        appscenicClient.toAppScenicOrder(order)
      );

      // حفظ الطلب المحلي مع معرف AppScenic
      const { data: orderData, error } = await this.supabase
        .from('orders')
        .insert({
          customer_id: order.customerId,
          status: 'pending',
          total: order.total,
          items: order.items,
          shipping_address: order.shipping_address,
          payment_status: 'pending',
          source: 'appscenic',
          appscenic_order_id: appscenicOrder.id.toString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        orderId: orderData.id,
        platformOrderId: appscenicOrder.id.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل إنشاء طلب AppScenic',
      };
    }
  }

  // جلب المنتجات من المنصة الفعالة
  async getProducts(options?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const platform = await this.getActivePlatform();

    switch (platform) {
      case 'local':
        return this.getLocalProducts(options);
      case 'zendrop':
        return this.getZendropProducts(options);
      case 'appscenic':
        return this.getAppScenicProducts(options);
      default:
        return { products: [], total: 0 };
    }
  }

  // جلب المنتجات المحلية
  private async getLocalProducts(options?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ products: Product[]; total: number }> {
    let query = this.supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('source', 'local')
      .is('zendrop_id', null)
      .is('appscenic_id', null);

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      products: data || [],
      total: count || 0,
    };
  }

  // جلب منتجات Zendrop
  private async getZendropProducts(options?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const { createZendropClient } = await import('./zendrop');
    const { data: settings } = await this.supabase
      .from('platform_settings')
      .select('config')
      .eq('id', 'default')
      .single();

    if (!settings?.config?.zendrop?.apiKey) {
      return { products: [], total: 0 };
    }

    const zendropClient = createZendropClient(settings.config.zendrop.apiKey);
    const response = await zendropClient.getProducts({
      page: options?.page || 1,
      limit: options?.limit || 20,
      search: options?.search,
    });

    return {
      products: response.products.map(p => zendropClient.toUnifiedProduct(p)),
      total: response.total,
    };
  }

  // جلب منتجات AppScenic
  private async getAppScenicProducts(options?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const { createAppScenicClient } = await import('./appscenic');
    const { data: settings } = await this.supabase
      .from('platform_settings')
      .select('config')
      .eq('id', 'default')
      .single();

    if (!settings?.config?.appscenic?.apiKey) {
      return { products: [], total: 0 };
    }

    const appscenicClient = createAppScenicClient(settings.config.appscenic.apiKey);
    const response = await appscenicClient.getProducts({
      page: options?.page || 1,
      limit: options?.limit || 20,
      search: options?.search,
      category: options?.category,
    });

    return {
      products: response.products.map(p => appscenicClient.toUnifiedProduct(p)),
      total: response.total,
    };
  }

  // مزامنة المنتجات من المنصة الخارجية
  async syncProducts(): Promise<{ success: boolean; message: string }> {
    const platform = await this.getActivePlatform();

    switch (platform) {
      case 'zendrop':
        return this.syncZendropProducts();
      case 'appscenic':
        return this.syncAppScenicProducts();
      default:
        return { success: false, message: 'المنصة المحلية لا تحتاج لمزامنة' };
    }
  }

  // مزامنة منتجات Zendrop
  private async syncZendropProducts(): Promise<{ success: boolean; message: string }> {
    try {
      const { createZendropSync } = await import('./zendrop-sync');
      const { data: settings } = await this.supabase
        .from('platform_settings')
        .select('config')
        .eq('id', 'default')
        .single();

      if (!settings?.config?.zendrop?.apiKey) {
        return { success: false, message: 'مفتاح API لـ Zendrop غير مضبوط' };
      }

      const { data: supabaseSettings } = await this.supabase
        .from('settings')
        .select('supabase_url, supabase_service_key')
        .single();

      if (!supabaseSettings) {
        return { success: false, message: 'إعدادات Supabase غير موجودة' };
      }

      const sync = createZendropSync({
        apiKey: settings.config.zendrop.apiKey,
        supabaseUrl: supabaseSettings.supabase_url,
        supabaseServiceKey: supabaseSettings.supabase_service_key,
      });

      const result = await sync.syncAllProducts();
      
      return {
        success: result.errors === 0,
        message: `تم مزامنة ${result.synced} منتج، ${result.errors} أخطاء`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل مزامنة Zendrop',
      };
    }
  }

  // مزامنة منتجات AppScenic
  private async syncAppScenicProducts(): Promise<{ success: boolean; message: string }> {
    try {
      const { createAppScenicSync } = await import('./appscenic-sync');
      const { data: settings } = await this.supabase
        .from('platform_settings')
        .select('config')
        .eq('id', 'default')
        .single();

      if (!settings?.config?.appscenic?.apiKey) {
        return { success: false, message: 'مفتاح API لـ AppScenic غير مضبوط' };
      }

      const { data: supabaseSettings } = await this.supabase
        .from('settings')
        .select('supabase_url, supabase_service_key')
        .single();

      if (!supabaseSettings) {
        return { success: false, message: 'إعدادات Supabase غير موجودة' };
      }

      const sync = createAppScenicSync({
        apiKey: settings.config.appscenic.apiKey,
        supabaseUrl: supabaseSettings.supabase_url,
        supabaseServiceKey: supabaseSettings.supabase_service_key,
      });

      const result = await sync.syncAllProducts();
      
      return {
        success: result.errors === 0,
        message: `تم مزامنة ${result.synced} منتج، ${result.errors} أخطاء`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل مزامنة AppScenic',
      };
    }
  }

  // التحقق من حالة المنصات
  async checkPlatformStatus(): Promise<{
    local: { enabled: boolean; status: 'active' | 'inactive' };
    zendrop: { enabled: boolean; status: 'active' | 'inactive' | 'not_configured'; apiKey?: boolean };
    appscenic: { enabled: boolean; status: 'active' | 'inactive' | 'not_configured'; apiKey?: boolean };
  }> {
    await this.loadConfig();

    const zendropStatus = this.config!.zendrop?.enabled
      ? { enabled: true, status: 'active' as const, apiKey: !!this.config!.zendrop?.apiKey }
      : { enabled: false, status: this.config!.zendrop?.apiKey ? 'inactive' as const : 'not_configured' as const };

    const appscenicStatus = this.config!.appscenic?.enabled
      ? { enabled: true, status: 'active' as const, apiKey: !!this.config!.appscenic?.apiKey }
      : { enabled: false, status: this.config!.appscenic?.apiKey ? 'inactive' as const : 'not_configured' as const };

    return {
      local: { enabled: this.config!.local?.enabled ?? true, status: 'active' },
      zendrop: zendropStatus,
      appscenic: appscenicStatus,
    };
  }
}

// إنشاء مدير المنصات
export function createPlatformManager(
  supabaseUrl: string,
  supabaseServiceKey: string
): PlatformManager {
  return new PlatformManager(supabaseUrl, supabaseServiceKey);
}

export { PlatformManager, type SupportedPlatform, type PlatformConfig, type InventoryCheck, type OrderResult };
