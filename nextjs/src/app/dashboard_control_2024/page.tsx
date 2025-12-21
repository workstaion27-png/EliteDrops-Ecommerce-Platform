'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Eye,
  LogOut,
  Bell,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem('luxuryhub_admin_session')
      if (session) {
        try {
          const parsed = JSON.parse(session)
          const now = Date.now()
          const sessionTimeout = 3600 * 1000
          const idleTimeout = 30 * 60 * 1000
          
          if (
            parsed.isAuthenticated &&
            now - parsed.loginTime < sessionTimeout &&
            now - parsed.lastActivity < idleTimeout
          ) {
            setIsAuthenticated(true)
            localStorage.setItem('luxuryhub_admin_session', JSON.stringify({
              ...parsed,
              lastActivity: now
            }))
          } else {
            localStorage.removeItem('luxuryhub_admin_session')
            router.push('/dashboard_control_2024/login')
          }
        } catch (error) {
          localStorage.removeItem('luxuryhub_admin_session')
          router.push('/dashboard_control_2024/login')
        }
      } else {
        router.push('/dashboard_control_2024/login')
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('luxuryhub_admin_session')
    router.push('/dashboard_control_2024/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const stats = {
    totalOrders: 1247,
    totalRevenue: 45892,
    activeProducts: 156,
    totalCustomers: 892
  }

  const recentOrders = [
    { id: '#1234', customer: 'John Doe', product: 'Premium Watch', amount: 299.99, status: 'Shipped' },
    { id: '#1235', customer: 'Jane Smith', product: 'Luxury Bag', amount: 599.99, status: 'Processing' },
    { id: '#1236', customer: 'Mike Johnson', product: 'Designer Sunglasses', amount: 199.99, status: 'Delivered' },
    { id: '#1237', customer: 'Sarah Wilson', product: 'Luxury Watch', amount: 799.99, status: 'Processing' },
    { id: '#1238', customer: 'David Brown', product: 'Designer Bag', amount: 449.99, status: 'Shipped' }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">LuxuryHub Admin</h1>
                <p className="text-sm text-slate-500">Dashboard Control Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 hover:text-slate-900 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </button>
              
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'products'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Products</span>
              </button>
              
              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'customers'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Customers</span>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
            </nav>
          </aside>

          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalOrders.toLocaleString()}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Products</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.activeProducts}</p>
                      </div>
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Customers</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalCustomers}</p>
                      </div>
                      <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.customer}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.product}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${order.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <button className="text-primary-600 hover:text-primary-900">
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'overview' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 capitalize">{activeTab}</h3>
                  <p className="text-sm text-slate-500 capitalize">{activeTab} management features coming soon.</p>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      {activeTab === 'orders' && <ShoppingCart className="h-6 w-6 text-slate-400" />}
                      {activeTab === 'products' && <Package className="h-6 w-6 text-slate-400" />}
                      {activeTab === 'customers' && <Users className="h-6 w-6 text-slate-400" />}
                      {activeTab === 'analytics' && <BarChart3 className="h-6 w-6 text-slate-400" />}
                      {activeTab === 'settings' && <Settings className="h-6 w-6 text-slate-400" />}
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 mb-2 capitalize">{activeTab} Panel</h4>
                    <p className="text-slate-500">Advanced {activeTab} features will be implemented here.</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}