import axios from 'axios';

const CJ_BASE_URL = 'https://api.cjdropshipping.com';

interface CJConfig {
  appKey: string;
  secretKey: string;
  partnerId: string;
}

interface CJProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
  variants?: CJProductVariant[];
}

interface CJProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: { [key: string]: string };
}

interface CJOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: CJOrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippingCarrier?: string;
  createdAt: string;
}

interface CJOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  sku: string;
}

interface CJCategory {
  id: string;
  name: string;
  parentId?: string;
}

class CJDropshippingAPI {
  private config: CJConfig;
  private axiosInstance;

  constructor() {
    this.config = {
      appKey: process.env.CJ_APP_KEY || '',
      secretKey: process.env.CJ_SECRET_KEY || '',
      partnerId: process.env.CJ_PARTNER_ID || ''
    };

    this.axiosInstance = axios.create({
      baseURL: CJ_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.config.appKey && this.config.secretKey) {
          const timestamp = Date.now();
          const sign = this.generateSign(timestamp);
          
          config.headers['X-App-Key'] = this.config.appKey;
          config.headers['X-Sign'] = sign;
          config.headers['X-Timestamp'] = timestamp.toString();
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private generateSign(timestamp: number): string {
    const crypto = require('crypto');
    const message = `appKey=${this.config.appKey}&timestamp=${timestamp}&secret=${this.config.secretKey}`;
    return crypto.createHash('md5').update(message).digest('hex');
  }

  private handleError(error: any): never {
    console.error('CJ Dropshipping API Error:', error.response?.data || error.message);
    throw new Error(`CJ Dropshipping API Error: ${error.response?.data?.message || error.message}`);
  }

  // Get all products
  async getProducts(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    keyword?: string;
  } = {}): Promise<CJProduct[]> {
    try {
      const response = await this.axiosInstance.post('/product/list', {
        page: params.page || 1,
        limit: params.limit || 20,
        categoryId: params.categoryId,
        keyword: params.keyword
      });

      if (response.data.success) {
        return response.data.data.products.map((product: any) => ({
          id: product.productId,
          name: product.productTitle,
          price: parseFloat(product.price),
          image: product.productImageUrl,
          description: product.description,
          category: product.categoryName,
          stock: product.inventory,
          variants: product.variants?.map((variant: any) => ({
            id: variant.variantId,
            sku: variant.sku,
            name: variant.name,
            price: parseFloat(variant.price),
            stock: variant.inventory,
            attributes: variant.attributes || {}
          }))
        }));
      }
      
      return [];
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get single product details
  async getProduct(productId: string): Promise<CJProduct | null> {
    try {
      const response = await this.axiosInstance.post('/product/detail', {
        productId
      });

      if (response.data.success) {
        const product = response.data.data;
        return {
          id: product.productId,
          name: product.productTitle,
          price: parseFloat(product.price),
          image: product.productImageUrl,
          description: product.description,
          category: product.categoryName,
          stock: product.inventory,
          variants: product.variants?.map((variant: any) => ({
            id: variant.variantId,
            sku: variant.sku,
            name: variant.name,
            price: parseFloat(variant.price),
            stock: variant.inventory,
            attributes: variant.attributes || {}
          }))
        };
      }
      
      return null;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get product categories
  async getCategories(): Promise<CJCategory[]> {
    try {
      const response = await this.axiosInstance.post('/product/categories', {});
      
      if (response.data.success) {
        return response.data.data.map((category: any) => ({
          id: category.categoryId,
          name: category.categoryName,
          parentId: category.parentId
        }));
      }
      
      return [];
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create order in CJ Dropshipping
  async createOrder(order: {
    items: CJOrderItem[];
    shippingAddress: CJOrder['shippingAddress'];
    customerEmail: string;
    customerPhone: string;
    notes?: string;
  }): Promise<{ orderId: string; status: string }> {
    try {
      const cjOrderItems = order.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        sku: item.sku
      }));

      const response = await this.axiosInstance.post('/order/create', {
        items: cjOrderItems,
        shippingAddress: {
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          address: order.shippingAddress.address1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country
        },
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        notes: order.notes
      });

      if (response.data.success) {
        return {
          orderId: response.data.data.orderId,
          status: response.data.data.status
        };
      }

      throw new Error('Failed to create order');
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get order status
  async getOrderStatus(orderId: string): Promise<{
    status: string;
    trackingNumber?: string;
    shippingCarrier?: string;
  }> {
    try {
      const response = await this.axiosInstance.post('/order/status', {
        orderId
      });

      if (response.data.success) {
        const data = response.data.data;
        return {
          status: data.status,
          trackingNumber: data.trackingNumber,
          shippingCarrier: data.shippingCarrier
        };
      }

      throw new Error('Failed to get order status');
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get orders list
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<CJOrder[]> {
    try {
      const response = await this.axiosInstance.post('/order/list', {
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate
      });

      if (response.data.success) {
        return response.data.data.orders.map((order: any) => ({
          id: order.orderId,
          customerName: `${order.shippingFirstName} ${order.shippingLastName}`,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: {
            firstName: order.shippingFirstName,
            lastName: order.shippingLastName,
            address1: order.shippingAddress,
            city: order.shippingCity,
            state: order.shippingState,
            postalCode: order.shippingZipCode,
            country: order.shippingCountry
          },
          items: order.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: parseFloat(item.price),
            sku: item.sku
          })),
          total: parseFloat(order.totalPrice),
          status: this.mapCJStatus(order.status),
          trackingNumber: order.trackingNumber,
          shippingCarrier: order.shippingCarrier,
          createdAt: order.createTime
        }));
      }

      return [];
    } catch (error) {
      this.handleError(error);
    }
  }

  private mapCJStatus(cjStatus: string): CJOrder['status'] {
    const statusMap: { [key: string]: CJOrder['status'] } = {
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };
    
    return statusMap[cjStatus?.toUpperCase()] || 'pending';
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post('/product/categories', {});
      return response.data.success === true;
    } catch (error) {
      console.error('CJ Connection test failed:', error);
      return false;
    }
  }
}

export const cjAPI = new CJDropshippingAPI();
export type { CJProduct, CJOrder, CJOrderItem, CJCategory, CJProductVariant };