/**
 * AI Product Intelligence Service
 * نظام الذكاء الاصطناعي لاختيار أفضل المنتجات تلقائياً
 * 
 * المميزات:
 * - تحليل المشاعر للمراجعات باستخدام NLP
 * - حساب هوامش الربح الذكية
 * - تحديد المنتجات الرابحة (Winning Products)
 * - تصفية المنتجات ذات الجودة المنخفضة
 */

import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';

// أنواع البيانات للمنتج الذكي
export interface SmartProduct {
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
  
  // حقول التحليل الذكي
  ai_score: number;
  profit_margin: number;
  sentiment_score: number;
  demand_level: 'HOT' | 'STEADY' | 'LOW';
  is_winner: boolean;
  recommendation_reason: string;
}

export interface AISelectionCriteria {
  min_rating: number;
  min_profit_margin: number;
  min_orders: number;
  min_review_count: number;
  max_shipping_cost: number;
  sentiment_threshold: number;
  exclude_categories: string[];
  required_keywords: string[];
  banned_keywords: string[];
  max_products_per_run: number;
}

export interface AIAnalysisResult {
  product: SmartProduct;
  decision: 'APPROVED' | 'REJECTED';
  ai_score: number;
  sentiment_score: number;
  profit_margin: number;
  demand_level: string;
  reasons: string[];
  warnings: string[];
  recommendation: string;
}

export interface AIRunStats {
  total_analyzed: number;
  approved: number;
  rejected: number;
  hot_trends: number;
  average_score: number;
  total_profit_potential: number;
  execution_time: number;
}

// المعايير الافتراضية للاختيار الذكي
const DEFAULT_CRITERIA: AISelectionCriteria = {
  min_rating: 4.5,              // تقييم لا يقل عن 4.5 نجوم
  min_profit_margin: 35.0,      // هامش ربح لا يقل عن 35%
  min_orders: 100,              // تم بيعه 100 مرة على الأقل
  min_review_count: 20,         // 20 مراجعة على الأقل
  max_shipping_cost: 5.0,       // الشحن لا يزيد عن 5 دولار
  sentiment_threshold: 0.1,     // عتبة تحليل المشاعر
  exclude_categories: ['Used', 'Refurbished', 'Clearance'],
  required_keywords: [],
  banned_keywords: ['fake', 'replica', 'knockoff', 'defective', 'broken'],
  max_products_per_run: 50      // حد أقصى 50 منتج لكل عملية
};

class AIProductIntelligenceService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private criteria: AISelectionCriteria;
  
  constructor(criteria?: Partial<AISelectionCriteria>) {
    this.supabase = createClient<Database>();
    this.criteria = { ...DEFAULT_CRITERIA, ...criteria };
  }

  /**
   * تحديث معايير التحليل
   */
  setCriteria(newCriteria: Partial<AISelectionCriteria>): void {
    this.criteria = { ...this.criteria, ...newCriteria };
  }

  /**
   * الحصول على المعايير الحالية
   */
  getCriteria(): AISelectionCriteria {
    return this.criteria;
  }

  /**
   * تحليل نص المراجعات باستخدام تحليل المشاعر
   * يستخدم قاعدة كلمات بسيطة لتحليل النصوص العربية والإنجليزية
   */
  analyzeSentiment(texts: string[]): number {
    if (!texts || texts.length === 0) {
      return 0;
    }

    // كلمات إيجابية
    const positiveWords = [
      'great', 'excellent', 'amazing', 'perfect', 'love', 'best',
      'awesome', 'fantastic', 'wonderful', 'recommend', 'quality',
      'fast', 'helpful', 'beautiful', 'nice', 'good', 'satisfied',
      'ممتاز', 'رائع', 'جيد', 'مقبول', 'حب', 'أنصح', 'جودة'
    ];

    // كلمات سلبية
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate',
      'broken', 'defective', 'waste', 'fake', 'disappointed',
      'poor', 'cheap', 'scam', 'fraud', 'return', 'refund',
      'سيء', 'رديء', 'سيخة', 'تالف', 'خيبة', 'ندم'
    ];

    let totalScore = 0;
    let analyzedCount = 0;

    for (const text of texts) {
      const lowerText = text.toLowerCase();
      let textScore = 0;

      for (const word of positiveWords) {
        if (lowerText.includes(word)) {
          textScore += 1;
        }
      }

      for (const word of negativeWords) {
        if (lowerText.includes(word)) {
          textScore -= 1;
        }
      }

      if (text.length > 0) {
        // تطبيع النتيجة
        const normalizedScore = Math.max(-1, Math.min(1, textScore / 5));
        totalScore += normalizedScore;
        analyzedCount++;
      }
    }

    return analyzedCount > 0 ? totalScore / analyzedCount : 0;
  }

  /**
   * تحليل ربحية المنتج
   */
  analyzeProfitability(
    costPrice: number,
    shippingCost: number,
    suggestedPrice: number
  ): { margin: number; isProfitable: boolean; breakdown: any } {
    const totalCost = costPrice + shippingCost;
    const profit = suggestedPrice - totalCost;
    const margin = (profit / suggestedPrice) * 100;

    return {
      margin: Math.round(margin * 100) / 100,
      isProfitable: margin >= this.criteria.min_profit_margin,
      breakdown: {
        costPrice,
        shippingCost,
        totalCost,
        suggestedPrice,
        profit,
        targetMargin: this.criteria.min_profit_margin
      }
    };
  }

  /**
   * تحديد مستوى الطلب على المنتج
   */
  determineDemandLevel(
    ordersCount: number,
    reviewCount: number,
    rating: number
  ): 'HOT' | 'STEADY' | 'LOW' {
    const velocityScore = ordersCount * (reviewCount / 10) * rating;

    if (velocityScore > 5000 && ordersCount > 1000 && rating >= 4.8) {
      return 'HOT'; // منتج ساخن - ترند حار
    } else if (velocityScore > 500 && ordersCount >= this.criteria.min_orders) {
      return 'STEADY'; // بائع مستقر
    } else {
      return 'LOW'; // طلب منخفض
    }
  }

  /**
   * التحقق من الكلمات المحظورة في اسم المنتج
   */
  checkBannedKeywords(name: string): boolean {
    const lowerName = name.toLowerCase();
    for (const keyword of this.criteria.banned_keywords) {
      if (lowerName.includes(keyword)) {
        return true;
      }
    }
    return false;
  }

  /**
   * التحقق من وجود الكلمات المطلوبة
   */
  checkRequiredKeywords(name: string): boolean {
    if (this.criteria.required_keywords.length === 0) {
      return true;
    }

    const lowerName = name.toLowerCase();
    return this.criteria.required_keywords.some(keyword => 
      lowerName.includes(keyword.toLowerCase())
    );
  }

  /**
   * تحليل منتج واحد وتقييمه
   */
  analyzeProduct(product: any): AIAnalysisResult {
    const reasons: string[] = [];
    const warnings: string[] = [];
    
    // 1. فحص التقييم
    if (product.rating < this.criteria.min_rating) {
      warnings.push(`التقييم ${product.rating} أقل من المطلوب ${this.criteria.min_rating}`);
    }

    // 2. فحص الكلمات المحظورة
    if (this.checkBannedKeywords(product.name)) {
      return {
        product: this.enrichProductWithAI(product, 0, 0, 0, 'LOW', false, 'يحتوي على كلمات محظورة'),
        decision: 'REJECTED',
        ai_score: 0,
        sentiment_score: 0,
        profit_margin: 0,
        demand_level: 'LOW',
        reasons: ['المنتج يحتوي على كلمات محظورة في الاسم'],
        warnings,
        recommendation: 'رفض المنتج بسبب الكلمات المحظورة'
      };
    }

    // 3. تحليل الربحية
    const profitability = this.analyzeProfitability(
      product.price,
      product.shipping_cost || 0,
      product.price * 2.5 // سعر البيع المقترح
    );

    if (!profitability.isProfitable) {
      reasons.push(`هامش الربح ${profitability.margin}% أقل من المطلوب ${this.criteria.min_profit_margin}%`);
    } else {
      reasons.push(`ربحية ممتازة ب هامش ${profitability.margin}%`);
    }

    // 4. تحليل المشاعر (محاكاة)
    // في التطبيق الحقيقي، سنحصل على المراجعات من API المورد
    const mockReviews = this.generateMockReviews(product.rating);
    const sentimentScore = this.analyzeSentiment(mockReviews);

    if (sentimentScore < this.criteria.sentiment_threshold) {
      warnings.push(`تحليل المشاعر ${sentimentScore.toFixed(2)} أقل من العتبة ${this.criteria.sentiment_threshold}`);
    }

    // 5. تحديد مستوى الطلب
    const demandLevel = this.determineDemandLevel(
      product.orders_count || 0,
      product.review_count || 0,
      product.rating || 0
    );

    if (demandLevel === 'HOT') {
      reasons.push('منتج ساخن - ترند حار في السوق');
    } else if (demandLevel === 'STEADY') {
      reasons.push('منتج مستقر مبيعاته جيدة');
    }

    // 6. حساب النتيجة النهائية للذكاء الاصطناعي
    const ratingScore = (product.rating / 5) * 30; // 30 نقطة للتقييم
    const profitScore = Math.min((profitability.margin / 50) * 30, 30); // 30 نقطة للربحية
    const demandScore = demandLevel === 'HOT' ? 25 : demandLevel === 'STEADY' ? 15 : 5; // 25 نقطة للطلب
    const sentimentBoost = Math.max(0, sentimentScore * 15); // 15 نقطة لتحليل المشاعر

    const aiScore = Math.round(ratingScore + profitScore + demandScore + sentimentBoost);

    // 7. القرار النهائي
    const isWinner = 
      product.rating >= this.criteria.min_rating &&
      profitability.isProfitable &&
      (product.orders_count || 0) >= this.criteria.min_orders &&
      sentimentScore >= this.criteria.sentiment_threshold;

    return {
      product: this.enrichProductWithAI(
        product,
        aiScore,
        profitability.margin,
        sentimentScore,
        demandLevel,
        isWinner,
        reasons.join(' | ')
      ),
      decision: isWinner ? 'APPROVED' : 'REJECTED',
      ai_score: aiScore,
      sentiment_score: sentimentScore,
      profit_margin: profitability.margin,
      demand_level: demandLevel,
      reasons,
      warnings,
      recommendation: isWinner 
        ? `منتج رابح! درجة الذكاء الاصطناعي: ${aiScore}/100`
        : 'المنتج لا يستوفي معايير الاختيار الذكية'
    };
  }

  /**
   * إثراء بيانات المنتج بنتائج الذكاء الاصطناعي
   */
  private enrichProductWithAI(
    product: any,
    aiScore: number,
    profitMargin: number,
    sentimentScore: number,
    demandLevel: 'HOT' | 'STEADY' | 'LOW',
    isWinner: boolean,
    recommendationReason: string
  ): SmartProduct {
    return {
      ...product,
      ai_score: aiScore,
      profit_margin: profitMargin,
      sentiment_score: sentimentScore,
      demand_level: demandLevel,
      is_winner: isWinner,
      recommendation_reason: recommendationReason
    };
  }

  /**
   * إنشاء مراجعات وهمية للتحليل (للتجربة)
   */
  private generateMockReviews(rating: number): string[] {
    const positiveReviews = [
      'Great product! Exactly as described.',
      'Amazing quality, fast shipping.',
      'Highly recommend to everyone.',
      'Best purchase I made this year.',
      'Perfect fit, excellent material.',
      'Worth every penny!'
    ];

    const neutralReviews = [
      'It\'s okay, not great but not bad.',
      'Average quality for the price.',
      'Does the job, nothing special.',
      'Decent product, expected more though.'
    ];

    const negativeReviews = [
      'Quality could be better.',
      'Took longer than expected to arrive.',
      'Not as shown in the picture.',
      'Had to return it, didn\'t fit.'
    ];

    if (rating >= 4.5) {
      return positiveReviews.slice(0, Math.floor(Math.random() * 3) + 2);
    } else if (rating >= 3.5) {
      return [...positiveReviews.slice(0, 1), ...neutralReviews.slice(0, 2)];
    } else {
      return [...neutralReviews.slice(0, 1), ...negativeReviews.slice(0, 2)];
    }
  }

  /**
   * تشغيل عملية التحليل على مجموعة من المنتجات
   */
  async analyzeProducts(products: any[]): Promise<{
    results: AIAnalysisResult[];
    stats: AIRunStats;
  }> {
    const startTime = Date.now();
    const results: AIAnalysisResult[] = [];
    let hotTrends = 0;

    // تصفية المنتجات حسب الفئات المحظورة
    const filteredProducts = products.filter(product => {
      for (const cat of this.criteria.exclude_categories) {
        if (product.category?.toLowerCase().includes(cat.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    // تحديد عدد المنتجات للتحليل
    const productsToAnalyze = filteredProducts.slice(0, this.criteria.max_products_per_run);

    for (const product of productsToAnalyze) {
      const result = this.analyzeProduct(product);
      results.push(result);

      if (result.decision === 'APPROVED' && result.demand_level === 'HOT') {
        hotTrends++;
      }
    }

    const executionTime = Date.now() - startTime;
    const approvedProducts = results.filter(r => r.decision === 'APPROVED');

    const stats: AIRunStats = {
      total_analyzed: productsToAnalyze.length,
      approved: approvedProducts.length,
      rejected: results.length - approvedProducts.length,
      hot_trends: hotTrends,
      average_score: approvedProducts.length > 0 
        ? Math.round(approvedProducts.reduce((sum, r) => sum + r.ai_score, 0) / approvedProducts.length)
        : 0,
      total_profit_potential: approvedProducts.reduce((sum, r) => {
        return sum + (r.profit_margin * 10); // تقدير تقريبي للأرباح المحتملة
      }, 0),
      execution_time: executionTime
    };

    return { results, stats };
  }

  /**
   * حفظ نتائج التحليل في قاعدة البيانات
   */
  async saveAnalysisResults(
    results: AIAnalysisResult[],
    runId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('ai_product_analysis')
      .insert(
        results.map(result => ({
          run_id: runId,
          product_data: result.product,
          decision: result.decision,
          ai_score: result.ai_score,
          sentiment_score: result.sentiment_score,
          profit_margin: result.profit_margin,
          demand_level: result.demand_level,
          reasons: result.reasons,
          warnings: result.warnings,
          recommendation: result.recommendation,
          created_at: new Date().toISOString()
        }))
      );

    if (error) {
      console.error('خطأ في حفظ نتائج التحليل:', error);
      throw error;
    }
  }

  /**
   * تشغيل عملية كاملة للاختيار الذكي
   */
  async runSmartSelection(
    products: any[],
    runId: string
  ): Promise<{
    results: AIAnalysisResult[];
    stats: AIRunStats;
    winners: SmartProduct[];
  }> {
    const { results, stats } = await this.analyzeProducts(products);
    const winners = results
      .filter(r => r.decision === 'APPROVED')
      .map(r => r.product);

    // حفظ النتائج
    await this.saveAnalysisResults(results, runId);

    return { results, stats, winners };
  }
}

// تصدير الدالة الرئيسية
export function createAIService(criteria?: Partial<AISelectionCriteria>): AIProductIntelligenceService {
  return new AIProductIntelligenceService(criteria);
}

export { AIProductIntelligenceService };
