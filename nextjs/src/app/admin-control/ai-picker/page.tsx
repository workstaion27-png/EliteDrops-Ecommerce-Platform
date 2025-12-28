/**
 * AI Smart Product Picker Admin Page
 * صفحة إدارة المنتقي الذكي للمنتجات بالذكاء الاصطناعي
 * Last updated: 2025-12-28 22:53
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Database } from '../../../lib/types/supabase';

// أنواع البيانات
interface AISelectionCriteria {
  min_rating: number;
  min_profit_margin: number;
  min_orders: number;
  min_review_count: number;
  max_shipping_cost: number;
  sentiment_threshold: number;
  exclude_categories: string;
  banned_keywords: string;
  required_keywords: string;
  max_products_per_run: number;
}

interface AnalysisResult {
  id: string;
  name: string;
  price: number;
  ai_score: number;
  profit_margin: number;
  demand_level: 'HOT' | 'STEADY' | 'LOW';
  recommendation_reason: string;
}

interface AnalysisStats {
  total_analyzed: number;
  approved: number;
  rejected: number;
  hot_trends: number;
  average_score: number;
  total_profit_potential: number;
  execution_time: number;
}

interface AnalysisRun {
  id: string;
  run_id: string;
  criteria: AISelectionCriteria;
  stats: AnalysisStats;
  winner_count: number;
  created_at: string;
}

// المنتجات الوهمية للاختبار
const mockProducts = [
  {
    id: 'P001',
    supplier_id: 'ALI-001',
    name: 'Smart Waterproof Watch Pro',
    description: 'High quality smartwatch with health monitoring features',
    price: 15.99,
    compare_at_price: 45.99,
    shipping_cost: 2.50,
    weight: 0.2,
    images: ['https://example.com/watch.jpg'],
    category: 'Electronics',
    subcategory: 'Watches',
    rating: 4.8,
    review_count: 2340,
    orders_count: 15000,
    tags: ['smart', 'watch', 'fitness'],
    supplier_name: 'AliExpress Premium',
    warehouse_location: 'US'
  },
  {
    id: 'P002',
    supplier_id: 'ALI-002',
    name: 'Wireless Earbuds Bluetooth 5.3',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 12.50,
    compare_at_price: 39.99,
    shipping_cost: 1.99,
    weight: 0.15,
    images: ['https://example.com/earbuds.jpg'],
    category: 'Electronics',
    subcategory: 'Audio',
    rating: 4.6,
    review_count: 1850,
    orders_count: 8500,
    tags: ['wireless', 'earbuds', 'bluetooth'],
    supplier_name: 'Tech Dropship',
    warehouse_location: 'US'
  },
  {
    id: 'P003',
    supplier_id: 'ALI-003',
    name: 'Yoga Mat Premium Non-Slip',
    description: 'Extra thick yoga mat with alignment lines',
    price: 8.99,
    compare_at_price: 24.99,
    shipping_cost: 3.50,
    weight: 1.2,
    images: ['https://example.com/yoga.jpg'],
    category: 'Sports',
    subcategory: 'Yoga',
    rating: 4.7,
    review_count: 3200,
    orders_count: 12000,
    tags: ['yoga', 'fitness', 'exercise'],
    supplier_name: 'FitLife Supplies',
    warehouse_location: 'US'
  },
  {
    id: 'P004',
    supplier_id: 'ALI-004',
    name: 'Kitchen Tool Set 12 Pieces',
    description: 'Stainless steel kitchen utensils set',
    price: 5.50,
    compare_at_price: 19.99,
    shipping_cost: 4.50,
    weight: 0.8,
    images: ['https://example.com/kitchen.jpg'],
    category: 'Home',
    subcategory: 'Kitchen',
    rating: 4.3,
    review_count: 890,
    orders_count: 3500,
    tags: ['kitchen', 'utensils', 'cooking'],
    supplier_name: 'Home Essentials',
    warehouse_location: 'US'
  },
  {
    id: 'P005',
    supplier_id: 'ALI-005',
    name: 'Phone Holder Car Mount',
    description: 'Adjustable dashboard phone mount',
    price: 4.25,
    compare_at_price: 14.99,
    shipping_cost: 1.50,
    weight: 0.25,
    images: ['https://example.com/holder.jpg'],
    category: 'Electronics',
    subcategory: 'Accessories',
    rating: 4.5,
    review_count: 4500,
    orders_count: 22000,
    tags: ['car', 'phone', 'mount'],
    supplier_name: 'AutoTech',
    warehouse_location: 'US'
  },
  {
    id: 'P006',
    supplier_id: 'ALI-006',
    name: 'LED Desk Lamp RGB',
    description: 'Smart LED lamp with color changing options',
    price: 18.99,
    compare_at_price: 49.99,
    shipping_cost: 3.00,
    weight: 0.5,
    images: ['https://example.com/lamp.jpg'],
    category: 'Electronics',
    subcategory: 'Lighting',
    rating: 4.9,
    review_count: 1200,
    orders_count: 4500,
    tags: ['led', 'lamp', 'rgb', 'desk'],
    supplier_name: 'LightWorld',
    warehouse_location: 'US'
  },
  {
    id: 'P007',
    supplier_id: 'ALI-007',
    name: 'Travel Backpack Anti-Theft',
    description: 'Security backpack with USB charging port',
    price: 28.50,
    compare_at_price: 79.99,
    shipping_cost: 5.50,
    weight: 0.9,
    images: ['https://example.com/backpack.jpg'],
    category: 'Fashion',
    subcategory: 'Bags',
    rating: 4.7,
    review_count: 2100,
    orders_count: 8500,
    tags: ['backpack', 'travel', 'security'],
    supplier_name: 'TravelGear',
    warehouse_location: 'US'
  },
  {
    id: 'P008',
    supplier_id: 'ALI-008',
    name: 'Fake Designer Watch',
    description: 'Luxury replica watch',
    price: 25.00,
    compare_at_price: 999.99,
    shipping_cost: 8.00,
    weight: 0.3,
    images: ['https://example.com/fake.jpg'],
    category: 'Fashion',
    subcategory: 'Watches',
    rating: 3.8,
    review_count: 150,
    orders_count: 200,
    tags: ['luxury', 'watch', 'replica'],
    supplier_name: 'Unknown Seller',
    warehouse_location: 'CN'
  }
];

export default function AISmartProductPicker() {
  const supabase = createClient();
  
  // حالة الواجهة
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'settings'>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    winners: AnalysisResult[];
    rejected: AnalysisResult[];
    stats: AnalysisStats | null;
  }>({ winners: [], rejected: [], stats: null });
  
  // المعايير
  const [criteria, setCriteria] = useState<AISelectionCriteria>({
    min_rating: 4.5,
    min_profit_margin: 35,
    min_orders: 100,
    min_review_count: 20,
    max_shipping_cost: 5,
    sentiment_threshold: 0.1,
    exclude_categories: 'Used,Refurbished,Clearance',
    banned_keywords: 'fake,replica,knockoff,defective,broken',
    required_keywords: '',
    max_products_per_run: 50
  });

  // سجل التحليلات
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisRun[]>([]);

  // تحميل سجل التحليلات
  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      const { data } = await supabase
        .from('ai_analysis_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setAnalysisHistory(data as any);
      }
    } catch (error) {
      console.log('سيتم استخدام بيانات تجريبية');
      // بيانات تجريبية
      setAnalysisHistory([
        {
          id: '1',
          run_id: 'AI-123456-ABC',
          criteria: criteria,
          stats: {
            total_analyzed: 25,
            approved: 8,
            rejected: 17,
            hot_trends: 3,
            average_score: 82,
            total_profit_potential: 2450,
            execution_time: 3200
          },
          winner_count: 8,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          run_id: 'AI-123457-DEF',
          criteria: criteria,
          stats: {
            total_analyzed: 40,
            approved: 12,
            rejected: 28,
            hot_trends: 5,
            average_score: 78,
            total_profit_potential: 3200,
            execution_time: 5100
          },
          winner_count: 12,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ] as any);
    }
  };

  // تشغيل التحليل
  const runAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // محاكاة طلب API
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: mockProducts,
          criteria: {
            min_rating: criteria.min_rating,
            min_profit_margin: criteria.min_profit_margin,
            min_orders: criteria.min_orders,
            max_shipping_cost: criteria.max_shipping_cost,
            sentiment_threshold: criteria.sentiment_threshold,
            banned_keywords: criteria.banned_keywords.split(',').map(k => k.trim()),
            required_keywords: criteria.required_keywords.split(',').map(k => k.trim()).filter(k => k),
            exclude_categories: criteria.exclude_categories.split(',').map(c => c.trim()),
            max_products_per_run: criteria.max_products_per_run
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResults({
          winners: data.winners,
          rejected: data.rejected,
          stats: data.stats
        });
      } else {
        // في حالة الفشل، نستخدم التحليل المحلي
        runLocalAnalysis();
      }
    } catch (error) {
      console.log('استخدام التحليل المحلي');
      runLocalAnalysis();
    } finally {
      setIsLoading(false);
    }
  };

  // تحليل محلي للاختبار
  const runLocalAnalysis = () => {
    const winners: AnalysisResult[] = [];
    const rejected: AnalysisResult[] = [];

    for (const product of mockProducts) {
      // التحقق من الكلمات المحظورة
      const bannedWords = criteria.banned_keywords.toLowerCase().split(',');
      const hasBanned = bannedWords.some(word => product.name.toLowerCase().includes(word.trim()));
      
      if (hasBanned) {
        rejected.push({
          id: product.id,
          name: product.name,
          price: product.price,
          ai_score: 0,
          profit_margin: 0,
          demand_level: 'LOW',
          recommendation_reason: 'يحتوي على كلمات محظورة'
        });
        continue;
      }

      // حساب النتيجة
      const ratingScore = (product.rating / 5) * 30;
      const ordersScore = Math.min(product.orders_count / 1000 * 20, 20);
      const reviewScore = Math.min(product.review_count / 100 * 15, 15);
      const demandLevel = product.orders_count > 5000 && product.rating >= 4.8 ? 'HOT' : 
                         product.orders_count > 1000 ? 'STEADY' : 'LOW';
      const demandScore = demandLevel === 'HOT' ? 25 : demandLevel === 'STEADY' ? 15 : 5;

      const aiScore = Math.round(ratingScore + ordersScore + reviewScore + demandScore);
      const profitMargin = ((product.price * 2.5 - product.price - product.shipping_cost) / (product.price * 2.5)) * 100;

      const isWinner = product.rating >= criteria.min_rating &&
                       profitMargin >= criteria.min_profit_margin &&
                       product.orders_count >= criteria.min_orders;

      if (isWinner) {
        winners.push({
          id: product.id,
          name: product.name,
          price: product.price,
          ai_score: aiScore,
          profit_margin: Math.round(profitMargin * 10) / 10,
          demand_level: demandLevel,
          recommendation_reason: `تقييم ${product.rating}★ - ${demandLevel === 'HOT' ? 'ترند ساخن' : 'مبيعات جيدة'}`
        });
      } else {
        rejected.push({
          id: product.id,
          name: product.name,
          price: product.price,
          ai_score: aiScore,
          profit_margin: Math.round(profitMargin * 10) / 10,
          demand_level: demandLevel,
          recommendation_reason: product.rating < criteria.min_rating 
            ? `التقييم ${product.rating} أقل من المطلوب`
            : `هامش الربح ${Math.round(profitMargin)}% غير كافٍ`
        });
      }
    }

    setAnalysisResults({
      winners: winners.sort((a, b) => b.ai_score - a.ai_score),
      rejected,
      stats: {
        total_analyzed: mockProducts.length,
        approved: winners.length,
        rejected: rejected.length,
        hot_trends: winners.filter(w => w.demand_level === 'HOT').length,
        average_score: Math.round(winners.reduce((sum, w) => sum + w.ai_score, 0) / (winners.length || 1)),
        total_profit_potential: winners.reduce((sum, w) => sum + w.profit_margin * 10, 0),
        execution_time: 1500
      }
    });
  };

  // حفظ المعايير
  const saveCriteria = () => {
    localStorage.setItem('ai_criteria', JSON.stringify(criteria));
    alert('تم حفظ المعايير بنجاح!');
  };

  // إعادة تعيين المعايير
  const resetCriteria = () => {
    setCriteria({
      min_rating: 4.5,
      min_profit_margin: 35,
      min_orders: 100,
      min_review_count: 20,
      max_shipping_cost: 5,
      sentiment_threshold: 0.1,
      exclude_categories: 'Used,Refurbished,Clearance',
      banned_keywords: 'fake,replica,knockoff,defective,broken',
      required_keywords: '',
      max_products_per_run: 50
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                المنتقي الذكي للمنتجات
              </h1>
              <p className="text-blue-100 mt-1">
                نظام الذكاء الاصطناعي لاختيار أفضل المنتجات تلقائياً
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'analyze' ? 'bg-white text-blue-600' : 'bg-blue-500 hover:bg-blue-400'
                }`}
              >
                🔍 تحليل المنتجات
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'settings' ? 'bg-white text-blue-600' : 'bg-blue-500 hover:bg-blue-400'
                }`}
              >
                ⚙️ إعدادات الذكاء
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'history' ? 'bg-white text-blue-600' : 'bg-blue-500 hover:bg-blue-400'
                }`}
              >
                📊 السجل
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* تبويب التحليل */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {/* شريط الإجراءات */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">المنتجات المتاحة</p>
                    <p className="text-2xl font-bold text-gray-800">{mockProducts.length}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">الحد الأدنى للتقييم</p>
                    <p className="text-2xl font-bold text-blue-600">{criteria.min_rating}★</p>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">هامش الربح</p>
                    <p className="text-2xl font-bold text-green-600">{criteria.min_profit_margin}%</p>
                  </div>
                </div>
                
                <button
                  onClick={runAnalysis}
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-xl font-semibold text-white transition ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري التحليل...
                    </span>
                  ) : (
                    '🚀 تشغيل التحليل الذكي'
                  )}
                </button>
              </div>
            </div>

            {/* نتائج التحليل */}
            {analysisResults.stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-gray-800">{analysisResults.stats.total_analyzed}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                  <p className="text-sm text-gray-500">المنتجات الرابحة</p>
                  <p className="text-3xl font-bold text-green-600">{analysisResults.stats.approved}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
                  <p className="text-sm text-gray-500">المرفوضة</p>
                  <p className="text-3xl font-bold text-red-500">{analysisResults.stats.rejected}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
                  <p className="text-sm text-gray-500">الترند الساخن</p>
                  <p className="text-3xl font-bold text-orange-500">{analysisResults.stats.hot_trends}</p>
                </div>
              </div>
            )}

            {/* قائمة المنتجات الرابحة */}
            {analysisResults.winners.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
                  <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
                    <span>🏆</span>
                    المنتجات الرابحة ({analysisResults.winners.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {analysisResults.winners.map((product) => (
                    <div key={product.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.recommendation_reason}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">درجة الذكاء</p>
                            <p className={`text-xl font-bold ${
                              product.ai_score >= 80 ? 'text-green-600' : 
                              product.ai_score >= 60 ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                              {product.ai_score}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">هامش الربح</p>
                            <p className="text-xl font-bold text-green-600">{product.profit_margin}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">الطلب</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              product.demand_level === 'HOT' ? 'bg-orange-100 text-orange-700' :
                              product.demand_level === 'STEADY' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {product.demand_level === 'HOT' ? '🔥 ساخن' : 
                               product.demand_level === 'STEADY' ? '📈 مستقر' : '📉 منخفض'}
                            </span>
                          </div>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                            إضافة للمتجر
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* المنتجات المرفوضة */}
            {analysisResults.rejected.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
                  <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                    <span>❌</span>
                    المنتجات المرفوضة ({analysisResults.rejected.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {analysisResults.rejected.map((product) => (
                    <div key={product.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-700">{product.name}</h3>
                          <p className="text-sm text-red-500">{product.recommendation_reason}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">درجة الذكاء</p>
                            <p className="text-lg font-bold text-gray-400">{product.ai_score}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* تبويب الإعدادات */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">⚙️ معايير الاختيار الذكي</h2>
              <div className="flex gap-2">
                <button
                  onClick={resetCriteria}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  إعادة تعيين
                </button>
                <button
                  onClick={saveCriteria}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  حفظ المعايير
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* التقييم */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  الحد الأدنى للتقييم (⭐)
                </label>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="0.1"
                  value={criteria.min_rating}
                  onChange={(e) => setCriteria({ ...criteria, min_rating: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>3★</span>
                  <span className="text-blue-600 font-bold">{criteria.min_rating}★</span>
                  <span>5★</span>
                </div>
              </div>

              {/* هامش الربح */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  الحد الأدنى لهامش الربح (%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={criteria.min_profit_margin}
                  onChange={(e) => setCriteria({ ...criteria, min_profit_margin: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>10%</span>
                  <span className="text-green-600 font-bold">{criteria.min_profit_margin}%</span>
                  <span>70%</span>
                </div>
              </div>

              {/* عدد الطلبات */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  الحد الأدنى لعدد الطلبات
                </label>
                <input
                  type="number"
                  value={criteria.min_orders}
                  onChange={(e) => setCriteria({ ...criteria, min_orders: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* تكلفة الشحن */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  الحد الأقصى لتكلفة الشحن ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={criteria.max_shipping_cost}
                  onChange={(e) => setCriteria({ ...criteria, max_shipping_cost: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* الفئات المستثناة */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  الفئات المستثناة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={criteria.exclude_categories}
                  onChange={(e) => setCriteria({ ...criteria, exclude_categories: e.target.value })}
                  placeholder="Used,Refurbished,Clearance"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500">
                  المنتجات في هذه الفئات سيتم استبعادها تلقائياً
                </p>
              </div>

              {/* الكلمات المحظورة */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  الكلمات المحظورة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={criteria.banned_keywords}
                  onChange={(e) => setCriteria({ ...criteria, banned_keywords: e.target.value })}
                  placeholder="fake,replica,knockoff,defective,broken"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500">
                  المنتجات التي تحتوي على أي من هذه الكلمات في الاسم سيتم رفضها
                </p>
              </div>

              {/* الكلمات المطلوبة */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  الكلمات المطلوبة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={criteria.required_keywords}
                  onChange={(e) => setCriteria({ ...criteria, required_keywords: e.target.value })}
                  placeholder="premium,quality,new"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500">
                  المنتجات يجب أن تحتوي على واحدة على الأقل من هذه الكلمات
                </p>
              </div>

              {/* الحد الأقصى للمنتجات */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  الحد الأقصى للمنتجات لكل عملية
                </label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={criteria.max_products_per_run}
                  onChange={(e) => setCriteria({ ...criteria, max_products_per_run: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* تبويب السجل */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 سجل عمليات التحليل</h2>
            
            {analysisHistory.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500">لا توجد عمليات تحليل سابقة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analysisHistory.map((run) => (
                  <div key={run.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm text-gray-500">#{run.run_id}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(run.created_at).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">حالة</p>
                          <p className="font-bold text-blue-600">{run.stats?.total_analyzed || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">رابح</p>
                          <p className="font-bold text-green-600">{run.winner_count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">متوسط الدرجة</p>
                          <p className="font-bold text-purple-600">{run.stats?.average_score || 0}</p>
                        </div>
                        <button className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition">
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
