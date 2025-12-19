'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, 
  Settings, LogOut, Search, RefreshCw, Eye, Truck, Check, X,
  Plus, Edit, Trash2, TrendingUp, DollarSign, ShoppingBag, CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAdminAuthStore } from '@/store/adminAuth'
import { Product, Order } from '@/types'
import AdminLogin from '@/components/admin/AdminLogin'
import ProductModal from '@/components/admin/ProductModal'
import PaymentGateways from '@/components/admin/PaymentGateways'
import CJDropshippingManager from '@/components/admin/CJDropshippingManager'

type Tab = 'dashboard' | 'orders' | 'products' | 'customers' | 'reports' | 'shipping' | 'payment-gateways' | 'cj-dropshipping'
type TimeRange = 'today' | 'week' | 'month' | 'year'

export default function DashboardControlPage() {
  const router = useRouter()
  const { session, login, logout, checkSession, updateActivity } = useAdminAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
    topProducts: [] as Product[],
    recentActivity: [] as any[]
  })

  // التحقق من الجلسة عند تحميل الصفحة
  useEffect(() => {
    if (!checkSession()) {
      // الجلسة منتهية الصلاحية
      logout()
    } else {
      // تحديث نشاط الجلسة
      updateActivity()
      fetchData()
    }
  }, [])

  // تحديث نشاط الجلسة كل 5 دقائق
  useEffect(() => {
    const interval = setInterval(updateActivity, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setError('')
    const success = await login(credentials)
    
    if (success) {
      fetchData()
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
      ])

      const ordersData = ordersRes.data || []
      const productsData = productsRes.data || []
      const customersData = customersRes.data || []

      setOrders(ordersData)
      setProducts(productsData)
      setCustomers(customersData)

      // حساب الإحصائيات
      const totalRevenue = ordersData.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      const topProducts = productsData.slice(0, 5)

      setStats({
        totalOrders: ordersData.length,
        totalRevenue,
        totalProducts: productsData.length,
        totalCustomers: customersData.length,
        ordersGrowth: calculateGrowth(ordersData, timeRange),
        revenueGrowth: calculateRevenueGrowth(ordersData, timeRange),
        topProducts,
        recentActivity: getRecentActivity(ordersData, productsData)
      })

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('حدث خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const calculateGrowth = (orders: Order[], timeRange: TimeRange): number => {
    const now = new Date()
    let periodStart: Date
    
    switch (timeRange) {
      case 'today':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'year':
        periodStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
    }
    
    const currentPeriodOrders = orders.filter(o => new Date(o.created_at) >= periodStart)
    const previousPeriodStart = new Date(periodStart.getTime() - (now.getTime() - periodStart.getTime()))
    const previousPeriodOrders = orders.filter(o => new Date(o.created_at) >= previousPeriodStart && new Date(o.created_at) < periodStart)
    
    if (previousPeriodOrders.length === 0) return 100
    
    return ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100
  }

  const calculateRevenueGrowth = (orders: Order[], timeRange: TimeRange): number => {
    const now = new Date()
    let periodStart: Date
    
    switch (timeRange) {
      case 'today':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'year':
        periodStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
    }
    
    const currentPeriodRevenue = orders
      .filter(o => new Date(o.created_at) >= periodStart)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0)
    
    const previousPeriodStart = new Date(periodStart.getTime() - (now.getTime() - periodStart.getTime()))
    const previousPeriodRevenue = orders
      .filter(o => new Date(o.created_at) >= previousPeriodStart && new Date(o.created_at) < periodStart)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0)
    
    if (previousPeriodRevenue === 0) return 100
    
    return ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
  }

  const getRecentActivity = (orders: Order[], products: Product[]) => {
    return [
      ...orders.slice(0, 3).map(o => ({ type: 'order', data: o })),
      ...products.slice(0, 2).map(p => ({ type: 'product', data: p }))
    ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
    } catch (err) {
      console.error('Error updating order:', err)
      setError('فشل في تحديث حالة الطلب')
    }
  }

  const toggleProductActive = async (productId: string, isActive: boolean) => {
    try {
      await supabase
        .from('products')
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq('id', productId)
      
      setProducts(products.map(p => p.id === productId ? { ...p, is_active: !isActive } : p))
    } catch (err) {
      console.error('Error updating product:', err)
      setError('فشل في تحديث حالة المنتج')
    }
  }

  const handleProductSave = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p))
    } else {
      setProducts([product, ...products])
    }
    setShowProductModal(false)
    setEditingProduct(null)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payment-gateways', label: 'Payment Gates', icon: CreditCard },
    { id: 'cj-dropshipping', label: 'CJ Dropshipping', icon: Truck },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'shipping', label: 'Shipping', icon: Package },
  ]

  // عرض صفحة تسجيل الدخول إذا لم يكن مسجل دخول
  if (!session?.isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} error={error} />
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-sky-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 min-h-[calc(100vh-64px)] fixed left-0 top-16">
          <div className="p-4">
            <h2 className="text-white font-bold text-lg mb-2">لوحة التحكم الآمنة</h2>
            <p className="text-slate-400 text-sm mb-6">
              مرحباً، {session?.username}
            </p>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-4 border-t border-slate-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
                <div className="flex gap-2">
                  {(['today', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {range === 'today' && 'اليوم'}
                      {range === 'week' && 'الأسبوع'}
                      {range === 'month' && 'الشهر'}
                      {range === 'year' && 'السنة'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">إجمالي الطلبات</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{stats.ordersGrowth.toFixed(1)}%
                      </p>
                    </div>
                    <ShoppingCart className="h-10 w-10 text-sky-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">إجمالي الإيرادات</p>
                      <p className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{stats.revenueGrowth.toFixed(1)}%
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">المنتجات</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalProducts}</p>
                    </div>
                    <Package className="h-10 w-10 text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">العملاء</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalCustomers}</p>
                    </div>
                    <Users className="h-10 w-10 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Recent Orders & Top Products */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-900">الطلبات الأخيرة</h2>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{order.order_number}</p>
                          <p className="text-sm text-slate-500">{order.customer_email || 'ضيف'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="font-semibold">${order.total_amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-900">أفضل المنتجات</h2>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {stats.topProducts.map((product) => (
                      <div key={product.id} className="p-4 flex items-center gap-4">
                        <img
                          src={product.images[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.price}</p>
                          <p className="text-sm text-slate-500">{product.inventory_count} متوفر</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">إدارة المنتجات</h1>
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setShowProductModal(true)
                  }}
                  className="inline-flex items-center px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  إضافة منتج جديد
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">المنتج</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الفئة</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">السعر</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">المخزون</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0] || '/placeholder.jpg'}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <span className="font-medium text-slate-900 line-clamp-1">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{product.category}</td>
                        <td className="px-6 py-4 font-semibold">${product.price}</td>
                        <td className="px-6 py-4 text-slate-600">{product.inventory_count}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product)
                                setShowProductModal(true)
                              }}
                              className="text-sm font-medium text-sky-600 hover:text-sky-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleProductActive(product.id, product.is_active)}
                              className="text-sm font-medium text-sky-600 hover:text-sky-700"
                            >
                              {product.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-8">إدارة الطلبات</h1>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الطلب</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">العميل</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">التاريخ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">المجموع</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{order.order_number}</p>
                            <p className="text-sm text-slate-500">{order.id.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{order.customer_email || 'ضيف'}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(order.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 font-semibold">${order.total_amount}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">معلق</option>
                            <option value="paid">مدفوع</option>
                            <option value="processing">قيد المعالجة</option>
                            <option value="shipped">تم الشحن</option>
                            <option value="delivered">تم التسليم</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm font-medium text-sky-600 hover:text-sky-700">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-8">التقارير المتقدمة</h1>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">إحصائيات المبيعات</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">إجمالي المبيعات</span>
                      <span className="font-semibold">${stats.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">متوسط قيمة الطلب</span>
                      <span className="font-semibold">${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">معدل النمو</span>
                      <span className={`font-semibold ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">أداء المنتجات</h3>
                  <div className="space-y-4">
                    {stats.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-slate-900">{product.name}</span>
                        </div>
                        <span className="font-semibold">${product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-8">إدارة الشحن</h1>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">رقم الطلب</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">العميل</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">العنوان</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">حالة الشحن</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">رقم التتبع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped').map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{order.order_number}</td>
                        <td className="px-6 py-4 text-slate-600">{order.customer_email}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {order.shipping_address ? 
                            `${order.shipping_address.city}, ${order.shipping_address.country}` : 
                            'غير محدد'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status === 'paid' && 'جاهز للشحن'}
                            {order.status === 'processing' && 'قيد التحضير'}
                            {order.status === 'shipped' && 'تم الشحن'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {order.tracking_number || 'غير متوفر'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Gateways */}
          {activeTab === 'payment-gateways' && (
            <PaymentGateways onUpdate={fetchData} />
          )}

          {/* CJ Dropshipping */}
          {activeTab === 'cj-dropshipping' && (
            <CJDropshippingManager onUpdate={fetchData} />
          )}

          {/* Customers */}
          {activeTab === 'customers' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-8">إدارة العملاء</h1>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">العميل</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">البريد الإلكتروني</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">تاريخ التسجيل</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الطلبات</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {customer.first_name && customer.last_name ? 
                                `${customer.first_name} ${customer.last_name}` : 
                                'عميل'
                              }
                            </p>
                            {customer.phone && (
                              <p className="text-sm text-slate-500">{customer.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(customer.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {orders.filter(o => o.customer_email === customer.email).length} طلب
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm font-medium text-sky-600 hover:text-sky-700">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false)
            setEditingProduct(null)
          }}
          product={editingProduct}
          onSave={handleProductSave}
        />
      )}
    </div>
  )
}