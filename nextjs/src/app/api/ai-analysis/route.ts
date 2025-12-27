/**
 * AI Product Analysis API Route
 * نقطة نهاية API لتحليل واختيار المنتجات بالذكاء الاصطناعي
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAIService, type AISelectionCriteria, type AIAnalysisResult, type AIRunStats } from '@/lib/ai-product-intelligence';
import { createClient } from '@/lib/supabase';
import type { Database } from '../../../../lib/types/supabase';

// نوع بيانات المنتجات الواردة من الموردين
interface SupplierProduct {
  id: string;
  supplier_id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number;
  shipping_cost: number;
  weight: number;
  images: string[];
  category: string;
  subcategory: string;
  rating: number;
  review_count: number;
  orders_count: number;
  tags: string[];
  supplier_name: string;
  warehouse_location: string;
}

// طلب التحليل
interface AnalysisRequest {
  products: SupplierProduct[];
  criteria?: Partial<AISelectionCriteria>;
  saveResults?: boolean;
  autoImport?: boolean;
}

// استجابة التحليل
interface AnalysisResponse {
  success: boolean;
  message: string;
  runId: string;
  stats: AIRunStats;
  winners: any[];
  rejected: any[];
  analysisTime: number;
}

// GET - الحصول على سجل التحليلات السابقة
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient<Database>();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // الحصول على سجل التحليلات
    const { data: analysisRuns, error } = await supabase
      .from('ai_analysis_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // الحصول على إحصائيات التحليلات
    const { count } = await supabase
      .from('ai_analysis_runs')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        runs: analysisRuns,
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: offset + limit < (count || 0)
        }
      }
    });

  } catch (error: any) {
    console.error('خطأ في الحصول على سجل التحليلات:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - تشغيل تحليل جديد
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: AnalysisRequest = await request.json();
    const { products, criteria, saveResults = true, autoImport = false } = body;

    // التحقق من وجود منتجات
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لم يتم توفير أي منتجات للتحليل' },
        { status: 400 }
      );
    }

    // إنشاء معرف العملية
    const runId = `AI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // تهيئة خدمة الذكاء الاصطناعي
    const aiService = createAIService(criteria);
    
    // تشغيل التحليل
    const { results, stats, winners } = await aiService.runSmartSelection(products, runId);

    // حفظ سجل العملية إذا طُلب ذلك
    if (saveResults) {
      await saveAnalysisRun({
        runId,
        stats,
        criteria: aiService.getCriteria(),
        winnerCount: winners.length
      });
    }

    // استيراد تلقائي للمنتجات الفائزة إذا طُلب ذلك
    let importedProducts = [];
    if (autoImport && winners.length > 0) {
      importedProducts = await autoImportWinners(winners);
    }

    const analysisTime = Date.now() - startTime;

    const response: AnalysisResponse = {
      success: true,
      message: `تم تحليل ${stats.total_analyzed} منتج - ${stats.approved} منتج رابح`,
      runId,
      stats,
      winners: winners.map(w => ({
        id: w.id,
        name: w.name,
        price: w.price,
        ai_score: w.ai_score,
        profit_margin: w.profit_margin,
        demand_level: w.demand_level,
        recommendation_reason: w.recommendation_reason
      })),
      rejected: results
        .filter(r => r.decision === 'REJECTED')
        .map(r => ({
          id: r.product.id,
          name: r.product.name,
          reason: r.recommendation
        })),
      analysisTime
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('خطأ في تحليل المنتجات:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * حفظ سجل عملية التحليل
 */
async function saveAnalysisRun(data: {
  runId: string;
  stats: AIRunStats;
  criteria: AISelectionCriteria;
  winnerCount: number;
}) {
  try {
    const supabase = createClient<Database>();
    
    const { error } = await supabase
      .from('ai_analysis_runs')
      .insert({
        run_id: data.runId,
        criteria: data.criteria as any,
        stats: data.stats as any,
        winner_count: data.winnerCount,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('خطأ في حفظ سجل التحليل:', error);
    }
  } catch (err) {
    console.error('خطأ:', err);
  }
}

/**
 * استيراد تلقائي للمنتجات الفائزة
 */
async function autoImportWinners(winners: any[]): Promise<any[]> {
  try {
    const supabase = createClient<Database>();
    const imported: any[] = [];

    for (const product of winners) {
      // التحقق من عدم وجود المنتج مسبقاً
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('supplier_id', product.supplier_id)
        .eq('external_id', product.id)
        .single();

      if (existing) {
        console.log(`المنتج ${product.name} موجود مسبقاً`);
        continue;
      }

      // إضافة المنتج
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price * 2.5, // سعر البيع المقترح
          cost_price: product.price,
          compare_at_price: product.compare_at_price,
          images: product.images,
          category: product.category,
          subcategory: product.subcategory,
          tags: product.tags,
          supplier_id: product.supplier_id,
          external_id: product.id,
          warehouse_location: product.warehouse_location,
          rating: product.rating,
          review_count: product.review_count,
          ai_score: product.ai_score,
          is_ai_selected: true,
          status: 'active',
          stock_quantity: product.orders_count > 1000 ? 100 : 50,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`خطأ في استيراد ${product.name}:`, error);
        continue;
      }

      imported.push(newProduct);
    }

    return imported;
  } catch (error) {
    console.error('خطأ في الاستيراد التلقائي:', error);
    return [];
  }
}
