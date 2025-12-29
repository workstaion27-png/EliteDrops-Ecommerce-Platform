/**
 * CJ AI Product Import API
 * واجهة برمجة التطبيقات لإضافة منتجات CJ تلقائياً بالذكاء الاصطناعي
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { aiProductIntelligence } from '@/lib/ai-product-intelligence';
import { CJProduct } from '@/lib/cjdropshipping';

interface ImportRequest {
  keywords: string[];
  excludeWords: string[];
  minProfitMargin: number;
  maxProducts: number;
  minScore: number;
}

interface ImportResponse {
  success: boolean;
  message: string;
  total_analyzed: number;
  imported_count: number;
  rejected_count: number;
  results: Array<{
    product_id: string;
    title: string;
    score: number;
    decision: string;
  }>;
  error?: string;
}

// GET - الحصول على سجل التحليلات
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabase
      .from('ai_product_analysis')
      .select('*')
      .order('analyzed_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'فشل جلب سجل التحليلات' },
      { status: 500 }
    );
  }
}

// POST - تشغيل إضافة المنتجات تلقائياً
export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    
    const {
      keywords,
      excludeWords = [],
      minProfitMargin = 30,
      maxProducts = 5,
      minScore = 80,
    } = body;

    // التحقق من المدخلات
    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'يرجى تحديد كلمات مفتاحية للبحث' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. جلب الإعدادات من قاعدة البيانات
    const { data: configData, error: configError } = await supabase
      .from('platform_config')
      .select('cj')
      .single();

    if (configError || !configData?.cj?.appKey || !configData?.cj?.secretKey) {
      return NextResponse.json(
        { success: false, error: 'يرجى تكوين مفاتيح CJ API أولاً من صفحة إعدادات المنصة' },
        { status: 400 }
      );
    }

    const { appKey, secretKey } = configData.cj;

    // 2. جلب المنتجات من CJ API
    const products = await fetchCJProducts(appKey, secretKey, keywords, maxProducts * 2);

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لم يتم العثور على منتجات جديدة',
        total_analyzed: 0,
        imported_count: 0,
        rejected_count: 0,
        results: [],
      });
    }

    // 3. تحليل كل منتج بالذكاء الاصطناعي
    const results: Array<{
      product_id: string;
      title: string;
      score: number;
      decision: string;
      details: any;
    }> = [];

    let importedCount = 0;
    let rejectedCount = 0;

    // فحص المنتجات المضافة سابقاً اليوم
    const today = new Date().toISOString().split('T')[0];
    const { data: todayImports } = await supabase
      .from('ai_product_analysis')
      .select('product_id')
      .gte('analyzed_at', `${today}T00:00:00`);

    const importedProductIds = new Set(todayImports?.map(p => p.product_id) || []);

    for (const product of products.slice(0, maxProducts * 3)) {
      // تخطي المنتجات المضافة سابقاً
      if (importedProductIds.has(product.id)) {
        continue;
      }

      // تحليل المنتج
      const analysisResult = await aiProductIntelligence.analyzeProduct(
        {
          id: product.id,
          productName: product.name,
          sellPrice: product.sellPrice || product.price,
          costPrice: product.price,
          categoryName: product.category,
          imageUrl: product.image,
          productUrl: product.productUrl || '',
          description: product.description,
        },
        {
          keywords,
          excludeWords,
          minProfitMargin,
          minScore,
        }
      );

      // حفظ النتيجة
      await aiProductIntelligence.saveAnalysisResult(analysisResult);

      // إذا تمت الموافقة، إضافة المنتج إلى قاعدة البيانات
      if (analysisResult.decision === 'approved') {
        await importProductToDatabase(supabase, product, analysisResult);
        importedCount++;
      } else {
        rejectedCount++;
      }

      results.push({
        product_id: analysisResult.product_id,
        title: analysisResult.title,
        score: analysisResult.score,
        decision: analysisResult.decision,
        details: analysisResult,
      });
    }

    return NextResponse.json({
      success: true,
      message: `تم تحليل ${results.length} منتج`,
      total_analyzed: results.length,
      imported_count: importedCount,
      rejected_count: rejectedCount,
      results: results.map(r => ({
        product_id: r.product_id,
        title: r.title,
        score: r.score,
        decision: r.decision,
      })),
    });
  } catch (error: any) {
    console.error('CJ AI Import Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء إضافة المنتجات' },
      { status: 500 }
    );
  }
}

/**
 * جلب المنتجات من CJ API
 */
async function fetchCJProducts(
  appKey: string,
  secretKey: string,
  keywords: string[],
  limit: number
): Promise<CJProduct[]> {
  try {
    const baseUrl = 'https://api.cjdropshipping.com';
    const timestamp = Date.now();
    const sign = generateCJSign(appKey, secretKey, timestamp);

    // دمج الكلمات المفتاحية للبحث
    const searchKeyword = keywords.join(' ');
    
    const response = await fetch(
      `${baseUrl}/api/v1/product/list?keyword=${encodeURIComponent(searchKeyword)}&pageSize=${limit}&pageNum=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': appKey,
          'X-Sign': sign,
          'X-Timestamp': timestamp.toString(),
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'فشل جلب المنتجات من CJ');
    }

    // تحويل المنتجات لتنسيق موحد
    return (data.data?.list || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      sellPrice: parseFloat(product.sellPrice) || parseFloat(product.price) || 0,
      image: product.image || product.mainImage || '',
      description: product.description || '',
      category: product.categoryName || product.category || 'Uncategorized',
      stock: product.stock || product.quantity || 0,
      productUrl: product.productUrl || `https://cjdropshipping.com/product/${product.id}`,
    }));
  } catch (error) {
    console.error('Error fetching CJ products:', error);
    return [];
  }
}

/**
 * إنشاء توقيع CJ
 */
function generateCJSign(appKey: string, secretKey: string, timestamp: number): string {
  const crypto = require('crypto');
  const signStr = `appKey${appKey}timestamp${timestamp}`;
  return crypto
    .createHmac('sha256', secretKey)
    .update(signStr)
    .digest('hex');
}

/**
 * إضافة منتج إلى قاعدة البيانات
 */
async function importProductToDatabase(
  supabase: any,
  product: CJProduct,
  analysisResult: any
): Promise<void> {
  try {
    // التحقق من وجود المنتج أولاً
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('cj_product_id', product.id)
      .single();

    if (existingProduct) {
      console.log(`المنتج ${product.id} موجود بالفعل`);
      return;
    }

    // إنشاء المنتج الجديد
    const { error: insertError } = await supabase.from('products').insert({
      name: analysisResult.optimized_title || product.name,
      description: product.description || '',
      price: product.sellPrice || product.price,
      compare_at_price: (product.sellPrice || product.price) * 1.3,
      cost_price: product.price,
      images: product.image ? [product.image] : [],
      category: product.category || 'Uncategorized',
      tags: analysisResult.reasoning?.split(', ') || [],
      status: 'active',
      source: 'cj',
      cj_product_id: product.id,
      stock_quantity: product.stock || 100,
      ai_score: analysisResult.score,
      is_ai_selected: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error inserting product:', insertError);
    }
  } catch (error) {
    console.error('Error importing product:', error);
  }
}
