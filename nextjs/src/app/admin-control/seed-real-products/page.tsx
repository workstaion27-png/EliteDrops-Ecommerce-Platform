'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niodbejcakihgjdptgyw.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2RiZWpjYWtpaGdqZHB0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODU0OTAsImV4cCI6MjA4MjA2MTQ5MH0.GLuX6aA9UJegbi2jeLCgGZrz_PTgpj1yKEKVycBWjJw'
);

interface Product {
  name: string;
  price: number;
  profit: number;
  profit_percentage: number;
  category: string;
  quantity: number;
  is_us_warehouse: boolean;
}

export default function SeedRealProductsPage() {
  const [seeding, setSeeding] = useState(false);
  const [seedingResult, setSeedingResult] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب المنتجات الحالية
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('name, price, profit, profit_percentage, category, quantity, is_us_warehouse')
        .eq('is_us_warehouse', true)
        .order('created_at', { ascending: false });

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchProducts();
  });

  const seedRealProducts = async () => {
    setSeeding(true);
    setSeedingResult(null);

    try {
      const response = await fetch('/api/admin/seed-real-products', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setSeedingResult(result);
        fetchProducts(); // تحديث قائمة المنتجات
      } else {
        setSeedingResult({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      setSeedingResult({
        success: false,
        error: 'فشل الاتصال بالخادم'
      });
    } finally {
      setSeeding(false);
    }
  };

  const totalProfit = products.reduce((sum, p) => sum + (p.profit || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🇺🇸</span>
            <h1 className="text-3xl font-bold text-white">
              إضافة المنتجات الحقيقية
            </h1>
          </div>
          <p className="text-purple-300">
            استبدال المنتجات التجريبية بالمنتجات الحقيقية من CJDropshipping مع مستودع أمريكا
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <div>
                <p className="text-purple-300 text-sm">المنتجات الحالية</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <p className="text-yellow-300 text-sm">إجمالي الربح</p>
                <p className="text-2xl font-bold text-yellow-400">${totalProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🇺🇸</span>
              <div>
                <p className="text-green-300 text-sm">منتجات أمريكا</p>
                <p className="text-2xl font-bold text-green-400">{products.filter(p => p.is_us_warehouse).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seed Button */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🚀</span>
            <h2 className="text-2xl font-bold text-white mb-4">
              إضافة 30 منتج حقيقي من CJDropshipping
            </h2>
            <p className="text-purple-300 mb-6 max-w-2xl mx-auto">
              منتجات حقيقية ومُختبرة مع مستودع أمريكا للشحن السريع (3-5 أيام) 
              وهوامش ربح تتراوح بين 23% و 43%
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-sm">
              <div className="bg-purple-900/30 rounded-lg p-3">
                <span className="text-purple-400">💪</span>
                <p className="text-white font-bold">8 منتجات صحة</p>
                <p className="text-green-400">ربح $9-39</p>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-3">
                <span className="text-blue-400">⚡</span>
                <p className="text-white font-bold">8 منتجات إلكترونيات</p>
                <p className="text-green-400">ربح $8-85</p>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-3">
                <span className="text-orange-400">🏠</span>
                <p className="text-white font-bold">6 منتجات منزل</p>
                <p className="text-green-400">ربح $6-25</p>
              </div>
              <div className="bg-yellow-900/30 rounded-lg p-3">
                <span className="text-yellow-400">🐾</span>
                <p className="text-white font-bold">3 منتجات حيوانات</p>
                <p className="text-green-400">ربح $6-17</p>
              </div>
              <div className="bg-pink-900/30 rounded-lg p-3">
                <span className="text-pink-400">👗</span>
                <p className="text-white font-bold">5 منتجات أزياء</p>
                <p className="text-green-400">ربح $2-17</p>
              </div>
            </div>

            <button
              onClick={seedRealProducts}
              disabled={seeding}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                seeding
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
              }`}
            >
              {seeding ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  جاري إضافة 30 منتج...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  إضافة 30 منتج حقيقي الآن
                </>
              )}
            </button>
          </div>

          {/* Result Message */}
          {seedingResult && (
            <div className={`mt-6 p-4 rounded-xl ${
              seedingResult.success 
                ? 'bg-green-900/50 border border-green-500' 
                : 'bg-red-900/50 border border-red-500'
            }`}>
              {seedingResult.success ? (
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🎉</span>
                  <h3 className="text-green-400 font-bold text-xl">تم إضافة المنتجات بنجاح!</h3>
                  <p className="text-green-300 mt-2">
                    {seedingResult.summary?.added} منتج تم إضافته
                  </p>
                  <p className="text-green-300">
                    إجمالي الربح المتوقع: ${seedingResult.summary?.total_profit_potential}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-4xl mb-2 block">❌</span>
                  <h3 className="text-red-400 font-bold">حدث خطأ</h3>
                  <p className="text-red-300 mt-2">{seedingResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Products */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">المنتجات الأمريكية الحالية</h3>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">📦</span>
              <p className="text-purple-300 text-lg">لا توجد منتجات أمريكية حالياً</p>
              <p className="text-purple-400 text-sm mt-2">انقر على الزر أعلاه لإضافة المنتجات الحقيقية</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/30">
                    <th className="text-right p-4 text-purple-300 font-medium">المنتج</th>
                    <th className="p-4 text-purple-300 font-medium">السعر</th>
                    <th className="p-4 text-purple-300 font-medium">الربح</th>
                    <th className="p-4 text-purple-300 font-medium">الفئة</th>
                    <th className="p-4 text-purple-300 font-medium">المخزون</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <p className="text-white font-medium">{product.name}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-green-400 font-bold">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-yellow-400 font-bold">${product.profit.toFixed(2)}</span>
                        <span className="text-purple-400 text-sm block">({product.profit_percentage.toFixed(1)}%)</span>
                      </td>
                      <td className="p-4">
                        <span className="text-purple-300 bg-purple-900/50 px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={product.quantity > 50 ? 'text-green-400' : 'text-yellow-400'}>
                          {product.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4">
          <a
            href="/admin-control/us-warehouse-products"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-xl text-center transition-all"
          >
            🇺🇸 إدارة المنتجات الأمريكية
          </a>
          <a
            href="/admin-control/products"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-xl text-center transition-all"
          >
            📦 إدارة جميع المنتجات
          </a>
        </div>
      </div>
    </div>
  );
}
