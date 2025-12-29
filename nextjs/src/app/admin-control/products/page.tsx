/**
 * Products Management Page
 * صفحة إدارة المنتجات وإضافة منتجات تجريبية
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  DollarSign,
  Image,
  Tag,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  Grid,
  List,
  Filter,
  Download,
  UploadCloud,
} from 'lucide-react';

import { createClient } from '@/lib/supabase';
import type { Database as DB } from '../../../lib/types/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  images: string[];
  category: string;
  tags: string[];
  stock_quantity: number;
  status: 'active' | 'draft' | 'archived';
  sku: string;
  source: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    category: '',
    tags: '',
    stock_quantity: '10',
    status: 'active' as 'active' | 'draft' | 'archived',
    sku: '',
    image_url: '',
  });

  const supabase = createClient<DB>();

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('error', 'فشل جلب المنتجات');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus, supabase]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      // If categories table doesn't exist, use default categories
      setCategories([
        { id: '1', name: 'إلكترونيات', slug: 'electronics' },
        { id: '2', name: 'إكسسوارات', slug: 'accessories' },
        { id: '3', name: 'ملابس', slug: 'clothing' },
        { id: '4', name: 'منزل ومطبخ', slug: 'home-kitchen' },
        { id: '5', name: 'مستلزمات رياضية', slug: 'sports' },
      ]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  // Show notification
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Generate SKU
  const generateSKU = (name: string, category: string) => {
    const catCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${catCode}-${nameCode}-${randomNum}`;
  };

  // Save Product
  const saveProduct = async () => {
    try {
      setSaving(true);

      // Validation
      if (!formData.name || !formData.price || !formData.category) {
        showNotification('error', 'يرجى ملء الحقول المطلوبة');
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        status: formData.status,
        sku: formData.sku || generateSKU(formData.name, formData.category),
        images: formData.image_url ? [formData.image_url] : [],
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        showNotification('success', 'تم تحديث المنتج بنجاح');
      } else {
        productData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        showNotification('success', 'تم إضافة المنتج بنجاح');
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('error', 'فشل حفظ المنتج');
    } finally {
      setSaving(false);
    }
  };

  // Delete Product
  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      showNotification('success', 'تم حذف المنتج بنجاح');
      setShowDeleteConfirm(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('error', 'فشل حذف المنتج');
    }
  };

  // Add Demo Products
  const addDemoProducts = async () => {
    try {
      setSaving(true);
      
      const demoProducts = [
        {
          name: 'Premium Wireless Bluetooth Headphones',
          description: 'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
          price: 79.99,
          compare_at_price: 99.99,
          cost_price: 35.00,
          category: 'إلكترونيات',
          tags: ['headphones', 'bluetooth', 'wireless', 'audio', 'music'],
          stock_quantity: 50,
          status: 'active' as const,
          sku: 'ELE-HEA-4521',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        },
        {
          name: 'Smart Watch Series X - Black Edition',
          description: 'Advanced smartwatch with health monitoring, GPS tracking, and seamless smartphone integration. Water resistant up to 50 meters.',
          price: 199.99,
          compare_at_price: 249.99,
          cost_price: 85.00,
          category: 'إلكترونيات',
          tags: ['smartwatch', 'fitness', 'health', 'wearable', 'tech'],
          stock_quantity: 30,
          status: 'active' as const,
          sku: 'ELE-SMA-7832',
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
        },
        {
          name: 'Vintage Leather Messenger Bag',
          description: 'Handcrafted genuine leather messenger bag with laptop compartment. Perfect for work and travel. Durable and stylish design.',
          price: 149.99,
          compare_at_price: 189.99,
          cost_price: 55.00,
          category: 'إكسسوارات',
          tags: ['bag', 'leather', 'messenger', 'laptop', 'fashion'],
          stock_quantity: 25,
          status: 'active' as const,
          sku: 'ACC-BAG-2156',
          images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
        },
        {
          name: 'Minimalist Stainless Steel Watch',
          description: 'Elegant minimalist watch with Japanese quartz movement. Scratch-resistant sapphire crystal. Water resistant to 30 meters.',
          price: 129.99,
          compare_at_price: 159.99,
          cost_price: 45.00,
          category: 'إكسسوارات',
          tags: ['watch', 'minimalist', 'fashion', 'accessories', 'steel'],
          stock_quantity: 40,
          status: 'active' as const,
          sku: 'ACC-WAT-9634',
          images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'],
        },
        {
          name: 'Organic Cotton T-Shirt - White',
          description: '100% organic cotton t-shirt with premium stitching. Super soft and comfortable. Available in multiple colors.',
          price: 34.99,
          compare_at_price: 44.99,
          cost_price: 12.00,
          category: 'ملابس',
          tags: ['tshirt', 'cotton', 'organic', 'casual', 'basic'],
          stock_quantity: 100,
          status: 'active' as const,
          sku: 'CLO-TSH-7412',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        },
        {
          name: 'Professional Yoga Mat - Purple',
          description: 'Extra thick non-slip yoga mat with alignment lines. Made from eco-friendly materials. Perfect for yoga and pilates.',
          price: 49.99,
          compare_at_price: 64.99,
          cost_price: 18.00,
          category: 'مستلزمات رياضية',
          tags: ['yoga', 'fitness', 'mat', 'exercise', 'sports'],
          stock_quantity: 60,
          status: 'active' as const,
          sku: 'SPR-YOG-8523',
          images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
        },
        {
          name: 'Ceramic Coffee Mug Set - 4 Pieces',
          description: 'Set of 4 handcrafted ceramic coffee mugs. Microwave and dishwasher safe. Modern minimalist design.',
          price: 44.99,
          compare_at_price: 54.99,
          cost_price: 15.00,
          category: 'منزل ومطبخ',
          tags: ['mug', 'coffee', 'ceramic', 'kitchen', 'home'],
          stock_quantity: 45,
          status: 'active' as const,
          sku: 'HMK-MUG-1596',
          images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500'],
        },
        {
          name: 'Wireless Charging Pad - Fast Charge',
          description: '15W fast wireless charging pad compatible with all Qi-enabled devices. LED indicator and anti-slip base.',
          price: 29.99,
          compare_at_price: 39.99,
          cost_price: 10.00,
          category: 'إلكترونيات',
          tags: ['charger', 'wireless', 'phone', 'tech', 'gadget'],
          stock_quantity: 80,
          status: 'active' as const,
          sku: 'ELE-CHG-3578',
          images: ['https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=500'],
        },
      ];

      const { error } = await supabase.from('products').insert(demoProducts);

      if (error) throw error;
      showNotification('success', `تم إضافة ${demoProducts.length} منتج تجريبي بنجاح`);
      fetchProducts();
    } catch (error) {
      console.error('Error adding demo products:', error);
      showNotification('error', 'فشل إضافة المنتجات التجريبية');
    } finally {
      setSaving(false);
    }
  };

  // Open Modal
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        compare_at_price: product.compare_at_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        category: product.category,
        tags: product.tags?.join(', ') || '',
        stock_quantity: product.stock_quantity.toString(),
        status: product.status,
        sku: product.sku,
        image_url: product.images?.[0] || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        compare_at_price: '',
        cost_price: '',
        category: '',
        tags: '',
        stock_quantity: '10',
        status: 'active',
        sku: '',
        image_url: '',
      });
    }
    setShowAddModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="w-8 h-8 ml-3 text-blue-600" />
              إدارة المنتجات
            </h1>
            <p className="mt-2 text-gray-600">
              إضافة وتعديل وحذف المنتجات في المتجر
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addDemoProducts}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="w-5 h-5 ml-2" />
              إضافة منتجات تجريبية
            </button>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة منتج جديد
            </button>
          </div>
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

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="draft">مسودة</option>
              <option value="archived">مؤرشف</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-4 text-gray-600">
          إجمالي المنتجات: <span className="font-medium text-gray-900">{products.length}</span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="w-12 h-12" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status === 'active' ? 'نشط' : product.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">المخزون: {product.stock_quantity}</span>
                      </div>

                      {/* SKU */}
                      <p className="text-xs text-gray-400 mt-2 font-mono">{product.sku}</p>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => openModal(product)}
                          className="flex-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          تعديل
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(product.id)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المنتج</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">الفئة</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">السعر</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">المخزون</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt="" className="w-10 h-10 rounded object-cover mr-3" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 font-mono">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.stock_quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status === 'active' ? 'نشط' : product.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(product)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-4">ابدأ بإضافة منتجات إلى متجرك</p>
                <button
                  onClick={addDemoProducts}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center"
                >
                  <Download className="w-5 h-5 ml-2" />
                  إضافة منتجات تجريبية
                </button>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المنتج <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل اسم المنتج"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل وصف المنتج"
                    />
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        السعر <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">السعر المقارن</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          value={formData.compare_at_price}
                          onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          value={formData.cost_price}
                          onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category & Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الفئة <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">اختر الفئة</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المخزون</label>
                      <input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العلامات (بالفواصل)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="علامة1, علامة2, علامة3"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Status & SKU */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">نشط</option>
                        <option value="draft">مسودة</option>
                        <option value="archived">مؤرشف</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="اتركه فارغاً للتوليد تلقائياً"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={saveProduct}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {saving ? 'جاري الحفظ...' : (editingProduct ? 'تحديث المنتج' : 'إضافة المنتج')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => deleteProduct(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
