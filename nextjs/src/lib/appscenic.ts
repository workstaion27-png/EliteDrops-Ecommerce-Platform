/**
 * AppScenic API Client
 * منصة دروبشيبنج تعتمد على الذكاء الاصطناعي
 * Documentation: https://appscenic.com/integrations
 */

import type { Product, Order } from './types';

// واجهة التكوين للعميل البرمجي
interface AppScenicConfig {
  apiKey: string;
  baseUrl?: string;
}

// واجهة بيانات المنتج من AppScenic
interface AppScenicProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  inventory: number;
  images: string[];
  weight: number;
  weight_unit: string;
  category: string;
  tags: string[];
  variants: AppScenicVariant[];
}

interface AppScenicVariant {
  id: number;
  sku: string;
  name: string;
  price: number;
  inventory: number;
  options: Record<string, string>;
}

// واجهة بيانات الطلب من AppScenic
interface AppScenicOrder {
  id: number;
  order_number: string;
  status: string;
  items: AppScenicOrderItem[];
  shipping_address: AppScenicAddress;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
}

interface AppScenicOrderItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  price: number;
  sku: string;
}

interface AppScenicAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string | null;
}

// واجهة استجابة المورد من AppScenic
interface AppScenicSupplier {
  id: number;
  name: string;
  country: string;
  rating: number;
  shipping_methods: AppScenicShippingMethod[];
}

interface AppScenicShippingMethod {
  id: number;
  name: string;
  price: number;
  estimated_days: number;
}

class AppScenicClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: AppScenicConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.appscenic.com/v1';
  }

  // إنشاء رأس الطلب مع المصادقة
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // تنفيذ طلب HTTP عام
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AppScenic API Error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`AppScenic API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // جلب جميع المنتجات مع دعم التصفح
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ products: AppScenicProduct[]; total: number; page: number }> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);

    const query = queryParams.toString();
    const endpoint = `/products${query ? `?${query}` : ''}`;

    return this.request(endpoint);
  }

  // جلب منتج واحد بواسطة المعرف
  async getProduct(productId: number): Promise<AppScenicProduct> {
    return this.request(`/products/${productId}`);
  }

  // جلب منتج بواسطة SKU
  async getProductBySku(sku: string): Promise<AppScenicProduct | null> {
    try {
      const response = await this.request<{ product: AppScenicProduct }>(
        `/products/sku/${encodeURIComponent(sku)}`
      );
      return response.product;
    } catch {
      return null;
    }
  }

  // جلب المخزون لمنتج معين
  async getInventory(productId: number): Promise<number> {
    const product = await this.getProduct(productId);
    return product.inventory;
  }

  // إنشاء طلب جديد
  async createOrder(orderData: {
    items: Array<{
      product_id: number;
      variant_id?: number;
      quantity: number;
    }>;
    shipping_address: AppScenicAddress;
    supplier_id?: number;
    shipping_method_id?: number;
  }): Promise<AppScenicOrder> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // جلب حالة الطلب
  async getOrder(orderId: number): Promise<AppScenicOrder> {
    return this.request(`/orders/${orderId}`);
  }

  // جلب الطلب بواسطة رقم الطلب
  async getOrderByNumber(orderNumber: string): Promise<AppScenicOrder | null> {
    try {
      const response = await this.request<{ order: AppScenicOrder }>(
        `/orders/number/${encodeURIComponent(orderNumber)}`
      );
      return response.order;
    } catch {
      return null;
    }
  }

  // جلب جميع الموردين المتاحين
  async getSuppliers(params?: {
    country?: string;
    category?: string;
  }): Promise<{ suppliers: AppScenicSupplier[] }> {
    const queryParams = new URLSearchParams();
    
    if (params?.country) queryParams.set('country', params.country);
    if (params?.category) queryParams.set('category', params.category);

    const query = queryParams.toString();
    const endpoint = `/suppliers${query ? `?${query}` : ''}`;

    return this.request(endpoint);
  }

  // جلب طرق الشحن المتاحة لمنتج
  async getShippingMethods(productId: number): Promise<AppScenicShippingMethod[]> {
    const response = await this.request<{ methods: AppScenicShippingMethod[] }>(
      `/products/${productId}/shipping-methods`
    );
    return response.methods;
  }

  // تحويل منتج AppScenic إلى تنسيق موحد
  toUnifiedProduct(product: AppScenicProduct): Product {
    return {
      id: `appscenic_${product.id}`,
      name: product.name,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price,
      images: product.images,
      inventory: product.inventory,
      sku: product.sku,
      weight: product.weight,
      weight_unit: product.weight_unit,
      category: product.category,
      tags: product.tags,
      variants: product.variants.map(v => ({
        id: `appscenic_variant_${v.id}`,
        name: v.name,
        sku: v.sku,
        price: v.price,
        inventory: v.inventory,
        options: v.options,
      })),
      source: 'appscenic',
      source_id: product.id.toString(),
    };
  }

  // تحويل الطلب المحلي إلى تنسيق AppScenic
  toAppScenicOrder(order: Order): {
    items: Array<{
      product_id: number;
      variant_id?: number;
      quantity: number;
    }>;
    shipping_address: AppScenicAddress;
  } {
    return {
      items: order.items.map(item => ({
        product_id: parseInt(item.product_id.replace('appscenic_', '')),
        quantity: item.quantity,
      })),
      shipping_address: {
        first_name: order.shipping_address.firstName,
        last_name: order.shipping_address.lastName,
        address1: order.shipping_address.address1,
        address2: order.shipping_address.address2 || null,
        city: order.shipping_address.city,
        state: order.shipping_address.state || '',
        zip: order.shipping_address.zip,
        country: order.shipping_address.country,
        phone: order.shipping_address.phone || null,
      },
    };
  }

  // التحقق من صحة الاتصال
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/suppliers?limit=1');
      return true;
    } catch {
      return false;
    }
  }
}

// تصدير الدالة المساعدة لإنشاء العميل
export function createAppScenicClient(apiKey: string): AppScenicClient {
  return new AppScenicClient({ apiKey });
}

export { AppScenicClient };
export type { AppScenicConfig, AppScenicProduct, AppScenicOrder, AppScenicSupplier };
