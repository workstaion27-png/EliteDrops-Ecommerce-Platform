import { NextRequest, NextResponse } from 'next/server';
import { fetchUSWarehouseProducts, importProductToDatabase } from '@/lib/cj-product-service';

/**
 * GET /api/cj/us-products
 * جلب المنتجات من المستودع الأمريكي
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await fetchUSWarehouseProducts(category, page, limit);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch products', details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      isMock: result.isMock || false,
      shippingInfo: {
        warehouse: 'United States',
        estimatedDelivery: '3-7 business days',
        shippingMethod: 'USPS / UPS Ground',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cj/us-products
 * استيراد منتج إلى قاعدة البيانات
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, profitMargin = 2.5 } = body;

    if (!product || !product.pid) {
      return NextResponse.json(
        { error: 'Product data is required' },
        { status: 400 }
      );
    }

    const result = await importProductToDatabase(product, profitMargin);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to import product', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product imported successfully',
      product: result.product,
      pricing: result.pricing,
      shipping: {
        warehouse: 'United States',
        estimatedDelivery: '3-7 business days',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
