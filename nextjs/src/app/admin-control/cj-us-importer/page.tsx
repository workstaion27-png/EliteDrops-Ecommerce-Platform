'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// تهيئة Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niodbejcakihgjdptgyw.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2RiZWpjYWtpaGdqZHB0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODU0OTAsImV4cCI6MjA4MjA2MTQ5MH0.GLuX6aA9UJegbi2jeLCgGZrz_PTgpj1yKEKVycBWjJw'
);

interface USProduct {
  pid: string;
  productName: string;
  productImage: string;
  productImages?: string[];
  sellPrice: number;
  productWeight: number;
  description?: string;
  variants: Array<{ variantName: string; inventory: number }>;
  salesRank: number;
  profitPotential: string;
}

interface ImportResult {
  success: boolean;
  message?: string;
  product?: any;
  pricing?: {
    costPrice: number;
    shippingCost: number;
    salePrice: number;
    profit: number;
    profitPercentage: string;
  };
  error?: string;
}

export default function CJUSProductImporter() {
  const [products, setProducts] = useState<USProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [importResults, setImportResults] = useState<Record<string, ImportResult>>({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [profitMargin, setProfitMargin] = useState(2.5);
  const [isMockData, setIsMockData] = useState(false);

  const categories = [
    { value: '', label: 'جميع الفئات' },
    { value: 'electronics', label: 'إلكترونيات' },
    { value: 'beauty', label: 'جمال وعناية شخصية' },
    { value: 'home', label: 'منزل ومطبخ' },
    { value: 'fashion', label: 'أزياء وموضة' },
    { value: 'pets', label: 'حيوانات أليفة' },
    { value: 'health', label: 'صحة ولياقة' },
  ];

  // جلب المنتجات عند تحميل الصفحة
  useEffect(() => {
    fetchUSProducts();
  }, [selectedCategory]);

  const fetchUSProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cj/us-products?category=${selectedCategory}&page=1&limit=20`
      );
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setIsMockData(data.isMock || false);
      } else {
        console.error('Failed to fetch products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const importProduct = async (product: USProduct) => {
    setImporting(product.pid);
    setImportResults(prev => ({ ...prev, [product.pid]: { success: true, message: 'جاري الاستيراد...' } }));

    try {
      const response = await fetch('/api/cj/us-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          profitMargin,
        }),
      });

      const result: ImportResult = await response.json();

      if (result.success) {
        setImportResults(prev => ({
          ...prev,
          [product.pid]: {
            ...result,
            message: 'تم الاستيراد بنجاح!',
          },
        }));
        setImportedIds(prev => [...prev, product.pid]);
      } else {
        setImportResults(prev => ({
          ...prev,
          [product.pid]: {
            ...result,
            success: false,
            error: result.error || 'فشل الاستيراد',
          },
        }));
      }
    } catch (error) {
      setImportResults(prev => ({
        ...prev,
        [product.pid]: {
          success: false,
          error: 'حدث خطأ في الاتصال',
        },
      }));
    } finally {
      setImporting(null);
    }
  };

  // حساب تفاصيل التسعير
  const calculatePricing = (costPrice: number, weight: number, margin: number) => {
    const shippingCost = weight > 1000 ? 5.99 : 4.99;
    const totalCost = costPrice + shippingCost;
    const salePrice = Number((totalCost * margin).toFixed(2));
    const profit = Number((salePrice - totalCost).toFixed(2));
    const profitPercentage = ((profit / salePrice) * 100).toFixed(1);
    return { shippingCost, salePrice, profit, profitPercentage };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🇺🇸</span>
            <h1 className="text-3xl font-bold text-white">
              استيراد المنتجات الأمريكية
            </h1>
          </div>
          <p className="text-purple-300">
            منتجات من مستودع أمريكا مع شحن سريع (3-7 أيام) وهوامش ربح عالية
          </p>
          
          {isMockData && (
            <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg">
              <p className="text-yellow-300 text-sm">
                ⚠️ بيانات تجريبية - للعرض التوضيحي فقط. أدخل CJDropshipping API Token لاستيراد منتجات حقيقية.
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-purple-300 text-sm mb-2">الفئة</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/10 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Profit Margin */}
            <div>
              <label className="block text-purple-300 text-sm mb-2">
                نسبة الربح: {(profitMargin * 100 - 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="1.5"
                max="4"
                step="0.1"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-purple-400 mt-1">
                <span>50%</span>
                <span>300%</span>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchUSProducts}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                {loading ? 'جاري التحميل...' : '🔄 تحديث المنتجات'}
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Info Banner */}
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚚</span>
            <div>
              <h3 className="text-green-400 font-bold">شحن سريع من أمريكا</h3>
              <p className="text-green-300 text-sm">
                جميع المنتجات متوفرة في مستودعاتنا الأمريكية • موعد التسليم: 3-7 أيام عمل • 
                شركات الشحن: USPS / UPS Ground
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const pricing = calculatePricing(product.sellPrice, product.productWeight, profitMargin);
              const isImported = importedIds.includes(product.pid);
              const result = importResults[product.pid];

              return (
                <div
                  key={product.pid}
                  className={`bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden transition-all ${
                    isImported ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-800 to-indigo-900">
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                    {/* Sales Rank Badge */}
                    <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                      🏆 #{product.salesRank}
                    </div>
                    {/* US Warehouse Badge */}
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      🇺🇸 US Stock
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                      {product.productName}
                    </h3>

                    {/* Inventory */}
                    <div className="flex items-center gap-2 text-sm text-green-400 mb-3">
                      <span>📦</span>
                      <span>مخزون: {product.variants.reduce((a, b) => a + b.inventory, 0)} وحدة</span>
                    </div>

                    {/* Pricing Table */}
                    <div className="bg-black/30 rounded-xl p-3 mb-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-purple-300">سعر التكلفة:</div>
                        <div className="text-white text-left">${product.sellPrice.toFixed(2)}</div>
                        
                        <div className="text-purple-300">تكلفة الشحن:</div>
                        <div className="text-white text-left">${pricing.shippingCost.toFixed(2)}</div>
                        
                        <div className="text-purple-300 font-bold">سعر البيع:</div>
                        <div className="text-green-400 font-bold text-left">${pricing.salePrice.toFixed(2)}</div>
                        
                        <div className="text-purple-300">الربح المتوقع:</div>
                        <div className="text-yellow-400 text-left">${pricing.profit.toFixed(2)} ({pricing.profitPercentage}%)</div>
                      </div>
                    </div>

                    {/* Status Message */}
                    {result && (
                      <div className={`text-sm text-center mb-3 px-3 py-2 rounded-lg ${
                        result.success 
                          ? 'bg-green-900/50 text-green-300' 
                          : 'bg-red-900/50 text-red-300'
                      }`}>
                        {result.message || result.error}
                      </div>
                    )}

                    {/* Import Button */}
                    <button
                      onClick={() => importProduct(product)}
                      disabled={importing === product.pid || isImported}
                      className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                        isImported
                          ? 'bg-green-600 text-white cursor-default'
                          : importing === product.pid
                          ? 'bg-purple-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      }`}
                    >
                      {isImported ? '✓ تم الاستيراد' : importing === product.pid ? 'جاري الاستيراد...' : '📥 استيراد للمتجر'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">💡 نصائح لتحقيق أعلى ربح</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="text-purple-300 font-bold">اختر المنتجات الرابحة</h4>
                <p className="text-purple-400 text-sm">المنتجات ذات الترتيب #1-#3 تحقق أعلى مبيعات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h4 className="text-purple-300 font-bold">تحكم في الهامش</h4>
                <p className="text-purple-400 text-sm">نسبة ربح 200-250% مثالية للمنتجات الأمريكية</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="text-purple-300 font-bold">استفد من الشحن السريع</h4>
                <p className="text-purple-400 text-sm">التسليم خلال 3-7 أيام يرفع التقييمات</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
