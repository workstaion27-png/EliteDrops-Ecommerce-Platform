/**
 * AppScenic Sync Service
 * خدمة مزامنة منتجات AppScenic
 */

import { createAppScenicClient, type AppScenicClient } from './appscenic';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

// نوع حدث المزامنة
type SyncEventType = 'started' | 'product_synced' | 'inventory_updated' | 'completed' | 'error';
type SyncEventHandler = (event: {
  type: SyncEventType;
  productId?: number;
  message?: string;
  error?: Error;
}) => void;

// إعدادات المزامنة
interface SyncConfig {
  apiKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  syncInventory?: boolean;
  syncPrices?: boolean;
  syncImages?: boolean;
  pageSize?: number;
}

class AppScenicSync {
  private client: AppScenicClient;
  private supabase: ReturnType<typeof createClient<Database>>;
  private config: Required<SyncConfig>;

  constructor(config: SyncConfig) {
    this.client = createAppScenicClient(config.apiKey);
    this.supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    this.config = {
      syncInventory: config.syncInventory ?? true,
      syncPrices: config.syncPrices ?? true,
      syncImages: config.syncImages ?? true,
      pageSize: config.pageSize ?? 50,
    };
  }

  // مزامنة جميع المنتجات
  async syncAllProducts(
    onEvent?: SyncEventHandler
  ): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;
    let page = 1;
    let hasMore = true;

    onEvent?.({ type: 'started' });

    try {
      while (hasMore) {
        const response = await this.client.getProducts({
          page,
          limit: this.config.pageSize,
        });

        for (const product of response.products) {
          try {
            await this.syncProduct(product);
            synced++;
            onEvent?.({ 
              type: 'product_synced', 
              productId: product.id,
              message: `تم مزامنة: ${product.name}`,
            });
          } catch (error) {
            errors++;
            onEvent?.({ 
              type: 'error', 
              productId: product.id,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        }

        hasMore = response.products.length === this.config.pageSize;
        page++;
      }

      onEvent?.({ 
        type: 'completed', 
        message: `اكتملت المزامنة: ${synced} منتجات، ${errors} أخطاء`,
      });

      return { synced, errors };
    } catch (error) {
      onEvent?.({ 
        type: 'error', 
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  // مزامنة منتج واحد
  private async syncProduct(
    appscenicProduct: Awaited<ReturnType<AppScenicClient['getProduct']>>
  ): Promise<void> {
    const unifiedProduct = this.client.toUnifiedProduct(appscenicProduct);

    // التحقق من وجود المنتج مسبقاً
    const { data: existingProduct } = await this.supabase
      .from('products')
      .select('id, appscenic_id')
      .eq('sku', unifiedProduct.sku)
      .single();

    const productData = {
      name: unifiedProduct.name,
      description: unifiedProduct.description,
      price: unifiedProduct.price,
      compare_at_price: unifiedProduct.compare_at_price,
      images: unifiedProduct.images,
      inventory: unifiedProduct.inventory,
      sku: unifiedProduct.sku,
      weight: unifiedProduct.weight,
      weight_unit: unifiedProduct.weight_unit,
      category: unifiedProduct.category,
      tags: unifiedProduct.tags,
      variants: unifiedProduct.variants,
      appscenic_id: unifiedProduct.source_id,
      source: 'appscenic',
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingProduct) {
      // تحديث المنتج الموجود
      await this.supabase
        .from('products')
        .update(productData)
        .eq('id', existingProduct.id);
    } else {
      // إنشاء منتج جديد
      await this.supabase
        .from('products')
        .insert(productData);
    }
  }

  // تحديث المخزون فقط
  async syncInventory(
    onEvent?: SyncEventHandler
  ): Promise<{ updated: number; errors: number }> {
    let updated = 0;
    let errors = 0;

    try {
      const { data: products } = await this.supabase
        .from('products')
        .select('id, appscenic_id, sku')
        .not('appscenic_id', 'is', null);

      if (!products || products.length === 0) {
        return { updated: 0, errors: 0 };
      }

      for (const product of products) {
        try {
          const inventory = await this.client.getInventory(
            parseInt(product.appscenic_id!)
          );

          await this.supabase
            .from('products')
            .update({
              inventory,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', product.id);

          updated++;
          onEvent?.({ 
            type: 'inventory_updated', 
            productId: parseInt(product.appscenic_id!),
            message: `تحديث المخزون: ${product.sku}`,
          });
        } catch (error) {
          errors++;
          onEvent?.({ 
            type: 'error', 
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }

      return { updated, errors };
    } catch (error) {
      onEvent?.({ 
        type: 'error', 
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  // مزامنة الأسعار فقط
  async syncPrices(
    onEvent?: SyncEventHandler
  ): Promise<{ updated: number; errors: number }> {
    let updated = 0;
    let errors = 0;

    try {
      const { data: products } = await this.supabase
        .from('products')
        .select('id, appscenic_id, sku')
        .not('appscenic_id', 'is', null);

      if (!products || products.length === 0) {
        return { updated: 0, errors: 0 };
      }

      for (const product of products) {
        try {
          const appscenicProduct = await this.client.getProduct(
            parseInt(product.appscenic_id!)
          );

          await this.supabase
            .from('products')
            .update({
              price: appscenicProduct.price,
              compare_at_price: appscenicProduct.compare_at_price,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', product.id);

          updated++;
        } catch (error) {
          errors++;
          onEvent?.({ 
            type: 'error', 
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }

      return { updated, errors };
    } catch (error) {
      onEvent?.({ 
        type: 'error', 
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  // جلب منتج واحد واستيراده
  async importProduct(
    productId: number
  ): Promise<{ success: boolean; product?: Database['public']['Tables']['products']['Row'] }> {
    try {
      const appscenicProduct = await this.client.getProduct(productId);
      await this.syncProduct(appscenicProduct);

      const { data: importedProduct } = await this.supabase
        .from('products')
        .select('*')
        .eq('sku', appscenicProduct.sku)
        .single();

      return { 
        success: true, 
        product: importedProduct || undefined,
      };
    } catch (error) {
      console.error(`فشل استيراد المنتج ${productId}:`, error);
      return { success: false };
    }
  }

  // البحث في منتجات AppScenic
  async searchProducts(
    query: string,
    options?: { category?: string; limit?: number }
  ): Promise<Awaited<ReturnType<AppScenicClient['getProducts']>>['products']> {
    const response = await this.client.getProducts({
      search: query,
      category: options?.category,
      limit: options?.limit || 20,
    });

    return response.products;
  }

  // التحقق من صحة الاتصال
  async testConnection(): Promise<boolean> {
    return this.client.testConnection();
  }
}

// دالة إنشاء نظام المزامنة
export function createAppScenicSync(config: SyncConfig): AppScenicSync {
  return new AppScenicSync(config);
}

export { AppScenicSync };
