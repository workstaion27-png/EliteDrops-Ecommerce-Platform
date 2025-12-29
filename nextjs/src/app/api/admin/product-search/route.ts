/**
 * Enhanced Product Search & Import API with SEO
 * واجهة برمجة التطبيقات للبحث عن المنتجات وتحسينها
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enhancedProductImporter } from '@/lib/enhanced-product-importer';
import { seoService, generateOptimizedSKU } from '@/lib/seo-service';
import type { Database } from '../../../lib/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - البحث عن المنتجات في CJ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال كلمة مفتاحية للبحث' },
        { status: 400 }
      );
    }

    // جلب الإعدادات
    const { data: config } = await supabase
      .from('platform_config')
      .select('config')
      .eq('id', 'default')
      .single();

    if (!config?.config?.cj?.appKey || !config?.config?.cj?.secretKey) {
      return NextResponse.json(
        { success: false, error: 'يرجى تكوين مفاتيح CJ API أولاً' },
        { status: 400 }
      );
    }

    // البحث في CJ
    const products = await searchCJProducts(
      config.config.cj.appKey,
      config.config.cj.secretKey,
      keyword,
      category,
      minPrice,
      maxPrice,
      limit,
      page
    );

    // تحسين كل منتج مع SEO
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        const sku = generateOptimizedSKU(product.category, product.name);
        const seoData = await seoService.generateProductSEO({
          productName: product.name,
          description: product.description || '',
          category: product.category,
          price: product.price,
          images: [product.image, ...(product.images || [])],
          sku: sku,
          currentStock: product.stock,
        });

        return {
          ...product,
          sku,
          seoData,
          estimatedProfit: Math.round((product.price - (product.costPrice || product.price * 0.6)) * 100) / 100,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        products: enhancedProducts,
        total: enhancedProducts.length,
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Search Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل البحث عن المنتجات' },
      { status: 500 }
    );
  }
}

// POST - استيراد منتج مع SEO كامل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      product, 
      enhanceWithAI = false,
      importConfig = {}
    } = body;

    if (!product || !product.id) {
      return NextResponse.json(
        { success: false, error: 'بيانات المنتج غير مكتملة' },
        { status: 400 }
      );
    }

    let result;

    if (enhanceWithAI) {
      result = await enhancedProductImporter.importWithAIEnhancement(product);
    } else {
      result = await enhancedProductImporter.importProduct(product, importConfig);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'تم استيراد المنتج بنجاح',
        data: {
          productId: result.productId,
          sku: result.sku,
          seoData: result.seoData,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'فشل استيراد المنتج' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل استيراد المنتج' },
      { status: 500 }
    );
  }
}

/**
 * البحث في CJ API
 */
async function searchCJProducts(
  appKey: string,
  secretKey: string,
  keyword: string,
  category: string,
  minPrice: number,
  maxPrice: number,
  limit: number,
  page: number
): Promise<any[]> {
  try {
    const crypto = require('crypto');
    const timestamp = Date.now();
    const sign = crypto
      .createHmac('sha256', secretKey)
      .update(`appKey${appKey}timestamp${timestamp}`)
      .digest('hex');

    let url = `https://api.cjdropshipping.com/api/v1/product/list?keyword=${encodeURIComponent(keyword)}&pageSize=${limit}&pageNum=${page}`;

    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': appKey,
        'X-Sign': sign,
        'X-Timestamp': timestamp.toString(),
      },
    });

    const data = await response.json();

    if (data.success && data.data?.list) {
      let products = data.data.list.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: parseFloat(p.price) || 0,
        costPrice: parseFloat(p.costPrice) || parseFloat(p.price) * 0.6,
        image: p.image || p.mainImage || '',
        images: [p.image, p.mainImage].filter(Boolean),
        category: p.categoryName || p.category || 'General',
        subcategory: p.subcategoryName || '',
        stock: p.stock || p.quantity || 0,
        weight: p.weight || 0,
        tags: p.tags || [],
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
      }));

      // تصفية حسب السعر
      products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

      return products;
    }

    return [];
  } catch (error) {
    console.error('CJ Search Error:', error);
    return [];
  }
}
