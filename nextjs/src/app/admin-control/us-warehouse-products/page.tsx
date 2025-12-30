'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niodbejcakihgjdptgyw.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2RiZWpjYWtpaGdqZHB0Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODU0OTAsImV4cCI6MjA4MjA2MTQ5MH0.GLuX6aA9UJegbi2jeLCgGZrz_PTgpj1yKEKVycBWjJw'
);

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  shipping_cost: number;
  profit: number;
  profit_percentage: number;
  sku: string;
  image_url: string;
  quantity: number;
  category: string;
  is_active: boolean;
  is_us_warehouse: boolean;
  cj_product_id: string;
  shipping_time: string;
  created_at: string;
}

export default function USWarehouseProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchUSProducts();
  }, []);

  const fetchUSProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_us_warehouse', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;
      fetchUSProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      fetchUSProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'active') return p.is_active;
    if (filter === 'inactive') return !p.is_active;
    return true;
  });

  const totalProfit = products.reduce((sum, p) => sum + (p.profit * (p.quantity > 0 ? p.quantity : 1)), 0);
  const activeProducts = products.filter(p => p.is_active).length;
  const totalInventory = products.reduce((sum, p) => sum + p.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🇺🇸</span>
            <h1 className="text-3xl font-bold text-white">
              المنتجات الأمريكية المستوردة
            </h1>
          </div>
          <p className="text-purple-300">
            جميع المنتجات المستوردة من مستودع أمريكا مع شحن سريع
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <div>
                <p className="text-purple-300 text-sm">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <p className="text-green-300 text-sm">منتجات نشطة</p>
                <p className="text-2xl font-bold text-green-400">{activeProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏷️</span>
              <div>
                <p className="text-yellow-300 text-sm">إجمالي الربح</p>
                <p className="text-2xl font-bold text-yellow-400">${totalProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div>
                <p className="text-blue-300 text-sm">إجمالي المخزون</p>
                <p className="text-2xl font-bold text-blue-400">{totalInventory}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-white">تصفية:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'غير نشط' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-purple-300 hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">📦</span>
              <p className="text-purple-300 text-lg">لا توجد منتجات أمريكية مستوردة بعد</p>
              <a
                href="/admin-control/cj-us-importer"
                className="inline-block mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl"
              >
                🇺🇸 استيراد منتجات من أمريكا
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/30">
                    <th className="text-right p-4 text-purple-300 font-medium">المنتج</th>
                    <th className="p-4 text-purple-300 font-medium">السعر</th>
                    <th className="p-4 text-purple-300 font-medium">التكلفة</th>
                    <th className="p-4 text-purple-300 font-medium">الربح</th>
                    <th className="p-4 text-purple-300 font-medium">المخزون</th>
                    <th className="p-4 text-purple-300 font-medium">الشحن</th>
                    <th className="p-4 text-purple-300 font-medium">الحالة</th>
                    <th className="p-4 text-purple-300 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-white font-medium line-clamp-1">{product.name}</p>
                            <p className="text-purple-400 text-sm">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-green-400 font-bold">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-red-400">${product.cost_price.toFixed(2)}</span>
                        {product.shipping_cost > 0 && (
                          <span className="text-purple-400 text-sm block">+${product.shipping_cost.toFixed(2)} شحن</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-yellow-400 font-bold">${product.profit.toFixed(2)}</span>
                        <span className="text-purple-400 text-sm block">({product.profit_percentage}%)</span>
                      </td>
                      <td className="p-4">
                        <span className={product.quantity > 50 ? 'text-green-400' : product.quantity > 10 ? 'text-yellow-400' : 'text-red-400'}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span>🇺🇸</span>
                          <span className="text-purple-300 text-sm">{product.shipping_time}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.is_active 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-red-900/50 text-red-400'
                        }`}>
                          {product.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleProductStatus(product)}
                            className="p-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg transition-all"
                            title={product.is_active ? 'تعطيل' : 'تفعيل'}
                          >
                            {product.is_active ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 bg-red-600/50 hover:bg-red-600 text-white rounded-lg transition-all"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <a
            href="/admin-control/cj-us-importer"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl text-center transition-all"
          >
            🇺🇸 استيراد المزيد من المنتجات الأمريكية
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
