'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  LogOut, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  Truck, 
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
  X,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Globe
} from 'lucide-react'
import OrderManagement from '@/components/admin/OrderManagement'
import CJDropshippingIntegration from '@/components/admin/CJDropshippingIntegration'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// TypeScript interfaces for admin panel
interface Order {
  id: string
  customer: string
  total: number
  status: string
  date?: string
}

interface Product {
  id: string
  name: string
  description?: string
  category: string
  price: number
  stock: number
  status: string
  image_url?: string
  created_at?: string
}

interface Customer {
  id: string
  name: string
  email: string
  orders: number
  total: number
  joinDate: string
}

interface NewProductData {
  name: string
  description: string
  category: string
  price: number
  stock: number
  image_url: string
  is_active: boolean
}

interface CJSearchProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
  stock: number
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0
  })
  
  // Add Product Modal States
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState<NewProductData>({
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    image_url: '',
    is_active: true
  })
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // CJ Search States
  const [cjSearchMode, setCjSearchMode] = useState(false)
  const [cjSearchQuery, setCjSearchQuery] = useState('')
  const [cjSearchResults, setCjSearchResults] = useState<CJSearchProduct[]>([])
  const [cjLoading, setCjLoading] = useState(false)
  const [cjPage, setCjPage] = useState(1)
  const [cjImporting, setCjImporting] = useState<{ [key: string]: string }>({})
  const [cjError, setCjError] = useState<string | null>(null)
  
  // Image Upload States
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // Product Edit States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  
  // Reviews States
  const [reviewFilter, setReviewFilter] = useState('all')

  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('luxuryhub_admin_session')
      if (session) {
        try {
          const parsedSession = JSON.parse(session)
          if (parsedSession.isAuthenticated) {
            setIsAuthenticated(true)
            loadDashboardData()
          } else {
            router.push('/admin-control/login')
          }
        } catch (error) {
          router.push('/admin-control/login')
        }
      } else {
        router.push('/admin-control/login')
      }
    }
    setLoading(false)
  }, [router])

  const loadDashboardData = async () => {
    try {
      // Load dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats')
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setDashboardStats(statsData.stats)
      }

      // Load recent orders
      const ordersResponse = await fetch('/api/orders?limit=5')
      const ordersData = await ordersResponse.json()
      if (ordersData.success) {
        setOrders(ordersData.orders || [])
      }

      // Load recent products
      const productsResponse = await fetch('/api/products?limit=5')
      const productsData = await productsResponse.json()
      if (productsData.success) {
        setProducts(productsData.products || [])
      }

      // Load recent customers
      const customersResponse = await fetch('/api/customers?limit=5')
      const customersData = await customersResponse.json()
      if (customersData.success) {
        setCustomers(customersData.customers || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxuryhub_admin_session')
    }
    router.push('/admin-control/login')
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          price: newProduct.price,
          stock: newProduct.stock,
          image_url: newProduct.image_url || null,
          is_active: newProduct.is_active
        }])
        .select()

      if (error) {
        throw error
      }

      setSubmitMessage({ type: 'success', text: 'تم إضافة المنتج بنجاح!' })
      
      // Reset form and refresh products list
      setNewProduct({
        name: '',
        description: '',
        category: '',
        price: 0,
        stock: 0,
        image_url: '',
        is_active: true
      })
      
      // Refresh products list
      loadDashboardData()
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsAddProductModalOpen(false)
        setSubmitMessage(null)
      }, 2000)

    } catch (error: any) {
      console.error('Error adding product:', error)
      setSubmitMessage({ type: 'error', text: `حدث خطأ: ${error.message || 'حدث خطأ غير معروف'}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const openAddProductModal = () => {
    setIsAddProductModalOpen(true)
  }

  // CJ Search Functions
  const handleCJSearch = async () => {
    if (!cjSearchQuery.trim()) return
    
    setCjLoading(true)
    setCjError(null)
    setCjSearchResults([])
    setCjPage(1)

    try {
      const response = await fetch(`/api/cj/search?query=${encodeURIComponent(cjSearchQuery)}&page=1&limit=20`)
      const data = await response.json()

      if (data.success) {
        setCjSearchResults(data.data || [])
      } else {
        setCjError(data.error || 'Failed to search products')
      }
    } catch (error: any) {
      setCjError(error.message || 'Network error occurred')
    } finally {
      setCjLoading(false)
    }
  }

  const handleCJImport = async (product: CJSearchProduct) => {
    setCjImporting(prev => ({ ...prev, [product.id]: 'loading' }))

    try {
      const response = await fetch('/api/cj/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cjProductId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          image_url: product.image
        })
      })

      const data = await response.json()

      if (data.success) {
        setCjImporting(prev => ({ ...prev, [product.id]: 'success' }))
        setSubmitMessage({ type: 'success', text: `تم استيراد "${product.name}" بنجاح!` })
        loadDashboardData()
        
        // Close modal after success
        setTimeout(() => {
          setIsAddProductModalOpen(false)
          setSubmitMessage(null)
          setCjSearchMode(false)
          setCjSearchResults([])
          setCjSearchQuery('')
        }, 2000)
      } else {
        setCjImporting(prev => ({ ...prev, [product.id]: 'error' }))
        if (data.error === 'Product already imported') {
          setSubmitMessage({ type: 'error', text: 'هذا المنتج تم استيراده مسبقاً!' })
        } else {
          setSubmitMessage({ type: 'error', text: data.error || 'فشل في استيراد المنتج' })
        }
      }
    } catch (error: any) {
      setCjImporting(prev => ({ ...prev, [product.id]: 'error' }))
      setSubmitMessage({ type: 'error', text: 'حدث خطأ في الاتصال' })
    }
  }

  const switchToCJSearch = () => {
    setCjSearchMode(true)
    setSubmitMessage(null)
  }

  const switchToManualAdd = () => {
    setCjSearchMode(false)
    setSubmitMessage(null)
  }

  const closeModal = () => {
    setIsAddProductModalOpen(false)
    setSubmitMessage(null)
    setCjSearchMode(false)
    setCjSearchResults([])
    setCjSearchQuery('')
    setCjError(null)
    setNewProduct({
      name: '',
      description: '',
      category: '',
      price: 0,
      stock: 0,
      image_url: '',
      is_active: true
    })
  }

  // Image Upload Functions
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setImageUploadLoading(true)
    const newImages: any[] = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`الملف ${file.name} ليس صورة صحيحة`)
          continue
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`الملف ${file.name} أكبر من 5 ميجابايت`)
          continue
        }
        
        // For demo purposes, we'll create a local URL
        // In production, you would upload to a storage service
        const imageUrl = URL.createObjectURL(file)
        newImages.push({
          url: imageUrl,
          name: file.name,
          size: file.size,
          type: file.type
        })
      }
      
      setUploadedImages(prev => [...prev, ...newImages])
      setSubmitMessage({ type: 'success', text: `تم رفع ${newImages.length} صورة بنجاح!` })
      
      // Clear message after 3 seconds
      setTimeout(() => setSubmitMessage(null), 3000)
      
    } catch (error: any) {
      console.error('Error uploading images:', error)
      setSubmitMessage({ type: 'error', text: 'حدث خطأ أثناء رفع الصور' })
    } finally {
      setImageUploadLoading(false)
    }
  }
  
  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setSubmitMessage({ type: 'success', text: 'تم نسخ الرابط!' })
      setTimeout(() => setSubmitMessage(null), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }
  
  const deleteImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setSubmitMessage({ type: 'success', text: 'تم حذف الصورة!' })
    setTimeout(() => setSubmitMessage(null), 2000)
  }
  
  // Product Edit Functions
  const openEditProduct = (product: Product) => {
    setEditProduct({ ...product })
    setIsEditModalOpen(true)
  }
  
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProduct) return
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editProduct.name,
          description: editProduct.description,
          category: editProduct.category,
          price: editProduct.price,
          stock: editProduct.stock,
          image_url: editProduct.image_url,
          is_active: editProduct.is_active
        })
        .eq('id', editProduct.id)
      
      if (error) throw error
      
      setSubmitMessage({ type: 'success', text: 'تم تحديث المنتج بنجاح!' })
      loadDashboardData()
      
      setTimeout(() => {
        setIsEditModalOpen(false)
        setEditProduct(null)
        setSubmitMessage(null)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error updating product:', error)
      setSubmitMessage({ type: 'error', text: `حدث خطأ: ${error.message}` })
    }
  }
  
  // Reviews Functions
  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId)
      
      if (error) throw error
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status } : review
      ))
      
      setSubmitMessage({ type: 'success', text: 'تم تحديث حالة المراجعة!' })
      setTimeout(() => setSubmitMessage(null), 2000)
      
    } catch (error: any) {
      console.error('Error updating review:', error)
      setSubmitMessage({ type: 'error', text: 'حدث خطأ في تحديث المراجعة' })
    }
  }
  
  const deleteReview = async (reviewId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المراجعة؟')) return
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
      
      if (error) throw error
      
      setReviews(prev => prev.filter(review => review.id !== reviewId))
      setSubmitMessage({ type: 'success', text: 'تم حذف المراجعة!' })
      setTimeout(() => setSubmitMessage(null), 2000)
      
    } catch (error: any) {
      console.error('Error deleting review:', error)
      setSubmitMessage({ type: 'error', text: 'حدث خطأ في حذف المراجعة' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">$45,892</p>
              <p className="text-sm text-green-600">+8% from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Products</h3>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-green-600">+5 new this month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Customers</h3>
              <p className="text-2xl font-bold text-gray-900">892</p>
              <p className="text-sm text-green-600">+23 new this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer} • ${order.total}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab('products')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Orders
              </button>
              <button 
                onClick={() => setActiveTab('customers')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Customers
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button className="text-amber-600 hover:text-amber-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderProducts = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
          <div className="flex items-center gap-4">
            <button 
                onClick={openAddProductModal}
                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج
              </button>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">ID: {product.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`${product.stock < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button className="text-amber-600 hover:text-amber-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => openEditProduct(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderCustomers = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Customer Management</h3>
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">ID: {customer.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.orders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button className="text-amber-600 hover:text-amber-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <p className="text-2xl font-bold text-gray-900">3.2%</p>
              <p className="text-sm text-green-600">+0.3% from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
              <p className="text-2xl font-bold text-gray-900">$145.50</p>
              <p className="text-sm text-green-600">+5.2% from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Customer Retention</h3>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-sm text-green-600">+2.1% from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Monthly Growth</h3>
              <p className="text-2xl font-bold text-gray-900">12.5%</p>
              <p className="text-sm text-green-600">+1.8% from last month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Sales chart would be displayed here</p>
            <p className="text-sm text-gray-400">Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات المتجر</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">اسم المتجر</label>
            <input
              type="text"
              defaultValue="LuxuryHub"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">وصف المتجر</label>
            <textarea
              defaultValue="Curated luxury lifestyle products with uncompromising quality and exceptional service"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input
              type="email"
              defaultValue="support@luxuryhub.com"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الشحن</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">الحد الأدنى للشحن المجاني</label>
            <input
              type="number"
              defaultValue="0"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">الشحن العادي (أيام)</label>
            <input
              type="text"
              defaultValue="3-5 business days"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            تحديث الشحن
          </button>
        </div>
      </div>
    </div>
  )

  const renderImageUpload = () => (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">رفع الصور</h3>
          <p className="text-sm text-gray-500 mt-1">ارفع صور المنتجات والإكسسوارات</p>
        </div>
        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-gray-300 hover:border-amber-400'
            }`}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragActive(false)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              handleImageUpload(e.dataTransfer.files)
            }}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">اسحب الصور هنا أو انقر للاختيار</p>
            <p className="text-sm text-gray-500 mb-4">PNG, JPG, WEBP حتى 5 ميجابايت</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              اختر الصور
            </label>
            {imageUploadLoading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">جاري رفع الصور...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Uploaded Images Gallery */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">معرض الصور المرفوعة</h3>
            <span className="text-sm text-gray-500">{uploadedImages.length} صورة</span>
          </div>
        </div>
        <div className="p-6">
          {uploadedImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد صور مرفوعة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150?text=Error'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyImageUrl(image.url)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="نسخ الرابط"
                      >
                        <Globe className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => deleteImage(index)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 truncate" title={image.name}>
                      {image.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderReviews = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">إدارة المراجعات</h3>
            <div className="flex items-center gap-4">
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">جميع المراجعات</option>
                <option value="pending">في الانتظار</option>
                <option value="approved">موافق عليها</option>
                <option value="rejected">مرفوضة</option>
              </select>
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المراجعات..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مراجعات بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{review.customer_name}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{review.product_name} • {new Date(review.created_at).toLocaleDateString('ar')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.status === 'approved' ? 'bg-green-100 text-green-800' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.status === 'approved' ? 'موافق عليها' :
                         review.status === 'rejected' ? 'مرفوضة' : 'في الانتظار'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{review.content}</p>
                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          موافقة
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <XCircle className="h-4 w-4" />
                          رفض
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )


  const renderAddProductModal = () => {
    if (!isAddProductModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {!cjSearchMode && (
                  <button
                    onClick={switchToCJSearch}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Globe className="h-4 w-4" />
                    Import from CJ
                  </button>
                )}
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {cjSearchMode ? (
                    <>
                      <Globe className="h-5 w-5 text-blue-600" />
                      Import from CJ Dropshipping
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 text-amber-600" />
                      Add New Product
                    </>
                  )}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!cjSearchMode ? (
                // Manual Add Form
                <form onSubmit={handleAddProduct} className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      required
                      placeholder="أدخل اسم المنتج"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الفئة *
                    </label>
                    <select
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">اختر الفئة</option>
                      <option value="bags">حقائب</option>
                      <option value="shoes">أحذية</option>
                      <option value="clothing">ملابس</option>
                      <option value="accessories">إكسسوارات</option>
                      <option value="watches">ساعات</option>
                      <option value="jewelry">مجوهرات</option>
                      <option value="beauty">جمال</option>
                      <option value="tech">تقنية</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكمية *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رابط الصورة
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="image_url"
                        value={newProduct.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <div className="relative group">
                        <div className="p-2 bg-gray-100 rounded-lg border border-gray-300 cursor-help">
                          <ImageIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg">
                          أدخل رابط مباشر للصورة
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف
                    </label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="أدخل وصف المنتج..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={newProduct.is_active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">تفعيل المنتج فوراً</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          إضافة المنتج
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // CJ Search Interface
                <div className="space-y-4">
                  {/* Back to Manual Add */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={switchToManualAdd}
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Manually
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cjSearchQuery}
                      onChange={(e) => setCjSearchQuery(e.target.value)}
                      placeholder="Search CJ Dropshipping products..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleCJSearch()}
                    />
                    <button
                      onClick={handleCJSearch}
                      disabled={cjLoading || !cjSearchQuery.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cjLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Search
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Message */}
                  {cjError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{cjError}</p>
                    </div>
                  )}

                  {/* Search Results */}
                  {cjSearchResults.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Search Results ({cjSearchResults.length})</h4>
                      <div className="grid gap-4 max-h-96 overflow-y-auto">
                        {cjSearchResults.map((product) => (
                          <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=No+Image';
                              }}
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 text-sm">{product.name}</h5>
                              <p className="text-xs text-gray-500 mt-1">Category: {product.category}</p>
                              <p className="text-sm font-medium text-green-600 mt-1">${product.price}</p>
                              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                            </div>
                            <button
                              onClick={() => handleCJImport(product)}
                              disabled={cjImporting[product.id] === 'loading' || cjImporting[product.id] === 'success'}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {cjImporting[product.id] === 'loading' ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Importing...
                                </div>
                              ) : cjImporting[product.id] === 'success' ? (
                                'Imported!'
                              ) : cjImporting[product.id] === 'error' ? (
                                'Failed'
                              ) : (
                                'Import'
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Message */}
              {submitMessage && (
                <div className={`mt-4 p-3 rounded-lg ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <p className="text-sm">{submitMessage.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderEditProductModal = () => {
    if (!isEditModalOpen || !editProduct) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => {
              setIsEditModalOpen(false)
              setEditProduct(null)
            }}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                تعديل المنتج
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditProduct(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  required
                  placeholder="أدخل اسم المنتج"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفئة *
                </label>
                <select
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر الفئة</option>
                  <option value="bags">حقائب</option>
                  <option value="shoes">أحذية</option>
                  <option value="clothing">ملابس</option>
                  <option value="accessories">إكسسوارات</option>
                  <option value="watches">ساعات</option>
                  <option value="jewelry">مجوهرات</option>
                  <option value="beauty">جمال</option>
                  <option value="tech">تقنية</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السعر *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الكمية *
                </label>
                <input
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط الصورة
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editProduct.image_url || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="relative group">
                    <div className="p-2 bg-gray-100 rounded-lg border border-gray-300 cursor-help">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg">
                      أدخل رابط مباشر للصورة
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={editProduct.description || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  rows={4}
                  placeholder="أدخل وصف المنتج..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProduct.is_active}
                    onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">تفعيل المنتج</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditProduct(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  تحديث المنتج
                </button>
              </div>
            </form>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`mx-6 mb-6 p-3 rounded-lg ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="text-sm">{submitMessage.text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">LuxuryHub Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900">
                <Settings className="h-5 w-5" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'orders', label: 'Order Management', icon: ShoppingCart },
              { id: 'cj-dropshipping', label: 'CJdropshipping', icon: Truck },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'image-upload', label: 'Image Upload', icon: ImageIcon },
              { id: 'reviews', label: 'Reviews', icon: FileText },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'cj-dropshipping' && <CJDropshippingIntegration />}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'image-upload' && renderImageUpload()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Add Product Modal */}
      {renderAddProductModal()}
      
      {/* Edit Product Modal */}
      {renderEditProductModal()}
    </div>
  )
}