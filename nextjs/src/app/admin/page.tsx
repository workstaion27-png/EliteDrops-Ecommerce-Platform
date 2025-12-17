'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, 
  Settings, LogOut, Search, RefreshCw, Eye, Truck, Check, X
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Product, Order } from '@/types'

type Tab = 'dashboard' | 'orders' | 'products' | 'customers'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  })
  const { user, logout } = useAuthStore()

  useEffect(() => {
    fetchData()
  }, [])

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

      setStats({
        totalOrders: ordersData.length,
        totalRevenue: ordersData.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
        totalProducts: productsData.length,
        totalCustomers: customersData.length,
      })
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
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
    }
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
  ]

  return (
    <div className="pt-16 min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 min-h-[calc(100vh-64px)] fixed left-0 top-16">
          <div className="p-4">
            <h2 className="text-white font-bold text-lg mb-6">Admin Panel</h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <Link
                href="/"
                className="flex items-center px-4 py-3 text-slate-300 hover:text-white transition-colors"
              >
                <Eye className="h-5 w-5 mr-3" />
                View Store
              </Link>
              <button
                onClick={() => {
                  supabase.auth.signOut()
                  logout()
                }}
                className="w-full flex items-center px-4 py-3 text-slate-300 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <button
                  onClick={fetchData}
                  className="flex items-center px-4 py-2 text-slate-600 hover:text-primary-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Total Orders</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
                    </div>
                    <ShoppingCart className="h-10 w-10 text-primary-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Revenue</p>
                      <p className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <BarChart3 className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Products</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalProducts}</p>
                    </div>
                    <Package className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Customers</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalCustomers}</p>
                    </div>
                    <Users className="h-10 w-10 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">Recent Orders</h2>
                </div>
                <div className="divide-y divide-slate-200">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{order.order_number}</p>
                        <p className="text-sm text-slate-500">{order.customer_email || 'Guest'}</p>
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
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-8">Orders</h1>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{order.order_number}</td>
                        <td className="px-6 py-4 text-slate-600">{order.customer_email || 'Guest'}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold">${order.total_amount}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                <button className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">
                  Add Product
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
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
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleProductActive(product.id, product.is_active)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            {product.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customers */}
          {activeTab === 'customers' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-8">Customers</h1>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                          No customers yet
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {customer.first_name} {customer.last_name}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
