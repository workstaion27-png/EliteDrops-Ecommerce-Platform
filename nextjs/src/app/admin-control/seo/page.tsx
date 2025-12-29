/**
 * SEO Management Page - Product Optimization
 * صفحة إدارة تحسين محركات البحث للمنتجات
 * 
 * المميزات:
 * - بحث عن المنتجات مع معاينة SEO
 * - تحسين العناوين والأوصاف
 * - توليد SKU تلقائي
 * - تحسين الصور والوصف
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Search as SearchIcon,
  Globe, 
  FileText, 
  Image, 
  Tag, 
  Link, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
} from 'lucide-react';

import { createClient } from '@/lib/supabase';
import type { Database as DB } from '../../../lib/types/supabase';

interface SEOProductResult {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  image: string;
  category: string;
  sku: string;
  seoData: {
    title: string;
    metaDescription: string;
    keywords: string[];
    tags: string[];
    url: string;
    altTexts: string[];
  };
  estimatedProfit: number;
  profitMargin: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  seo_title: string;
  seo_description: string;
  keywords: string[];
  tags: string[];
  sku: string;
  images: string[];
  view_count?: number;
  conversion_rate?: number;
}

export default function SEOManagementPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'products' | 'tools'>('search');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Search State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SEOProductResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SEOProductResult | null>(null);
  const [importing, setImporting] = useState(false);

  // Products List State
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // SEO Tool State
  const [seoToolInput, setSeoToolInput] = useState('');
  const [seoToolResult, setSeoToolResult] = useState<any>(null);
  const [generatingSEO, setGeneratingSEO] = useState(false);

  const supabase = createClient();

  // Fetch products on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, seo_title, seo_description, keywords, tags, sku, images')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      showNotification('error', 'فشل جلب المنتجات');
    } finally {
      setProductsLoading(false);
    }
  };

  // Search products from CJ with SEO preview
  const searchProducts = async () => {
    if (!searchKeyword.trim()) {
      showNotification('error', 'يرجى إدخال كلمة مفتاحية للبحث');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/product-search?keyword=${encodeURIComponent(searchKeyword)}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.products);
        showNotification('success', `تم العثور على ${data.data.products.length} منتج`);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showNotification('error', error.message || 'فشل البحث');
    } finally {
      setLoading(false);
    }
  };

  // Import product with full SEO optimization
  const importProduct = async (product: SEOProductResult) => {
    try {
      setImporting(true);
      const response = await fetch('/api/admin/product-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            description: product.seoData.metaDescription,
            price: product.price,
            costPrice: product.costPrice,
            image: product.image,
            images: [product.image],
            category: product.category,
            stock: 100,
          },
          enhanceWithAI: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'تم استيراد المنتج مع SEO بنجاح');
        fetchProducts();
        setSearchResults(searchResults.filter(p => p.id !== product.id));
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showNotification('error', error.message || 'فشل استيراد المنتج');
    } finally {
      setImporting(false);
    }
  };

  // Generate SEO for existing product
  const generateProductSEO = async (productId: string) => {
    try {
      setGeneratingSEO(true);
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('المنتج غير موجود');

      // Generate new SEO
      const response = await fetch('/api/admin/product-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            costPrice: product.cost_price || product.price * 0.6,
            image: product.images?.[0] || '',
            images: product.images || [],
            category: product.category || 'General',
            stock: product.stock_quantity || 100,
          },
          enhanceWithAI: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification('success', 'تم تحديث SEO بنجاح');
        fetchProducts();
      }
    } catch (error: any) {
      showNotification('error', error.message);
    } finally {
      setGeneratingSEO(false);
    }
  };

  // SEO Analysis Tool
  const analyzeSEO = async () => {
    if (!seoToolInput.trim()) {
      showNotification('error', 'يرجى إدخال نص لتحليله');
      return;
    }

    // Simple SEO analysis
    const words = seoToolInput.split(/\s+/);
    const wordCount = words.length;
    const charCount = seoToolInput.length;
    const sentenceCount = seoToolInput.split(/[.!?]+/).filter(Boolean).length;
    
    // Calculate SEO score
    let score = 0;
    const suggestions: string[] = [];

    if (wordCount >= 50 && wordCount <= 300) {
      score += 25;
    } else {
      suggestions.push(wordCount < 50 ? 'النص قصير جداً، يفضل 50-300 كلمة' : 'النص طويل جداً');
    }

    if (sentenceCount >= 3) {
      score += 25;
    } else {
      suggestions.push('أضف فقرات أكثر لتحسين القراءة');
    }

    const hasKeywords = words.some(w => w.length > 5);
    if (hasKeywords) {
      score += 25;
    } else {
      suggestions.push('أضف كلمات مفتاحية أكثر');
    }

    if (charCount >= 150 && charCount <= 160) {
      score += 25;
    } else {
      suggestions.push('الوصف يفضل أن يكون 150-160 حرف');
    }

    setSeoToolResult({
      wordCount,
      charCount,
      sentenceCount,
      score,
      suggestions,
      grade: score >= 80 ? 'ممتاز' : score >= 60 ? 'جيد' : score >= 40 ? 'متوسط' : 'ضعيف',
      color: score >= 80 ? 'green' : score >= 60 ? 'blue' : score >= 40 ? 'yellow' : 'red',
    });
  };

  // Show notification
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="w-8 h-8 ml-3 text-blue-600" />
            إدارة تحسين محركات البحث (SEO)
          </h1>
          <p className="mt-2 text-gray-600">
            تحسين المنتجات لمحركات البحث وزيادة ظهورها في نتائج البحث
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 ml-2" />
            ) : (
              <AlertCircle className="w-5 h-5 ml-2" />
            )}
            {notification.message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'search', name: 'بحث المنتجات مع SEO', icon: Search },
              { id: 'products', name: 'تحليل المنتجات', icon: BarChart3 },
              { id: 'tools', name: 'أدوات SEO', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 ml-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">البحث عن المنتجات مع معاين SEO</h2>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
                    placeholder="ابحث عن منتج (مثال: wireless charger, phone case)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={searchProducts}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Search className="w-5 h-5 ml-2" />
                  بحث
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  النتائج ({searchResults.length} منتج)
                </h3>
                <div className="space-y-4">
                  {searchResults.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">
                                ربح: ${product.estimatedProfit.toFixed(2)} ({product.profitMargin.toFixed(0)}%)
                              </p>
                            </div>
                          </div>

                          {/* SEO Preview */}
                          <div className="mt-3 bg-gray-50 rounded p-3 text-sm">
                            <p className="text-blue-600 font-medium truncate">
                              {product.seoData.title}
                            </p>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {product.seoData.metaDescription}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.seoData.keywords.slice(0, 5).map((keyword, i) => (
                                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                            >
                              تفاصيل SEO
                            </button>
                            <button
                              onClick={() => importProduct(product)}
                              disabled={importing}
                              className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center"
                            >
                              <Package className="w-4 h-4 ml-1" />
                              استيراد مع SEO
                            </button>
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

        {/* Products Analysis Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">تحليل SEO للمنتجات</h2>
                <div className="text-sm text-gray-500">
                  إجمالي المنتجات: {products.length}
                </div>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">المنتج</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">السعر</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SEO Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">الكلمات المفتاحية</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.slice(0, 20).map((product) => (
                        <tr key={product.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {product.images?.[0] && (
                                <img src={product.images[0]} alt="" className="w-10 h-10 rounded object-cover ml-3" />
                              )}
                              <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            {product.seo_title ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                موجود
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                مفقود
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {product.keywords?.length || 0} كلمة
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => generateProductSEO(product.id)}
                              disabled={generatingSEO}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              تحديث SEO
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            {/* SEO Analyzer */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">محلل SEO للنصوص</h2>
              <div className="space-y-4">
                <textarea
                  value={seoToolInput}
                  onChange={(e) => setSeoToolInput(e.target.value)}
                  placeholder="أدخل النص المراد تحليله (وصف المنتج، العنوان، إلخ)"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={analyzeSEO}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <BarChart3 className="w-5 h-5 ml-2" />
                  تحليل النص
                </button>
              </div>

              {seoToolResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  {/* Score */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">درجة SEO:</span>
                    <div className="flex items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-${seoToolResult.color}-500`}>
                        {seoToolResult.score}
                      </div>
                      <span className={`ml-3 text-lg font-medium text-${seoToolResult.color}-600`}>
                        {seoToolResult.grade}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded">
                      <p className="text-2xl font-bold text-gray-900">{seoToolResult.wordCount}</p>
                      <p className="text-sm text-gray-500">كلمة</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded">
                      <p className="text-2xl font-bold text-gray-900">{seoToolResult.charCount}</p>
                      <p className="text-sm text-gray-500">حرف</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded">
                      <p className="text-2xl font-bold text-gray-900">{seoToolResult.sentenceCount}</p>
                      <p className="text-sm text-gray-500">جملة</p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {seoToolResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">اقتراحات للتحسين:</h4>
                      <ul className="space-y-1">
                        {seoToolResult.suggestions.map((suggestion: string, i: number) => (
                          <li key={i} className="flex items-center text-sm text-yellow-700">
                            <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEO Tips */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">نصائح لتحسين SEO</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: FileText, title: 'العنوان', desc: 'استخدم 50-60 حرفاً مع الكلمة المفتاحية' },
                  { icon: Tag, title: 'الكلمات المفتاحية', desc: '3-5 كلمات مفتاحية لكل منتج' },
                  { icon: Image, title: 'الصور', desc: 'استخدم Alt text وصفي لكل صورة' },
                  { icon: Link, title: 'الروابط', desc: 'URL قصيرة وواضحة تحتوي الكلمة المفتاحية' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start p-4 bg-blue-50 rounded-lg">
                    <tip.icon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">{tip.title}</h4>
                      <p className="text-sm text-gray-600">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEO Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">تفاصيل SEO</h3>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان SEO</label>
                    <input
                      type="text"
                      value={selectedProduct.seoData.title}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">وصف Meta</label>
                    <textarea
                      value={selectedProduct.seoData.metaDescription}
                      readOnly
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط المنتج</label>
                    <input
                      type="text"
                      value={selectedProduct.seoData.url}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكلمات المفتاحية</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.seoData.keywords.map((keyword, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={selectedProduct.sku}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50 font-mono"
                    />
                  </div>

                  {/* Alt Texts */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نصوص الصور البديلة (Alt)</label>
                    <ul className="space-y-2">
                      {selectedProduct.seoData.altTexts.map((alt, i) => (
                        <li key={i} className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProduct.seoData.title);
                      showNotification('success', 'تم نسخ العنوان');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    نسخ العنوان
                  </button>
                  <button
                    onClick={() => importProduct(selectedProduct)}
                    disabled={importing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Package className="w-4 h-4 inline mr-1" />
                    استيراد المنتج
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
