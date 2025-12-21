'use client'

import { useState, useEffect } from 'react'
import { User, Package, LogOut, Settings, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, setUser, logout } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      // Mock orders data
      const mockOrders = [
        {
          id: '1',
          order_number: 'LH-2024-001',
          status: 'delivered',
          total_amount: 299.99,
          created_at: '2024-12-15T10:00:00Z'
        },
        {
          id: '2',
          order_number: 'LH-2024-002',
          status: 'shipped',
          total_amount: 149.99,
          created_at: '2024-12-10T14:30:00Z'
        }
      ]
      setOrders(mockOrders)
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          setUser({ 
            id: data.user.id, 
            email: data.user.email || '', 
            role: email.includes('admin') ? 'admin' : 'customer' 
          })
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          setUser({ 
            id: data.user.id, 
            email: data.user.email || '', 
            role: 'customer' 
          })
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
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

  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-slate-600 mt-2">
                {isLogin ? 'Sign in to your account' : 'Join LuxuryHub today'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-6 text-slate-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary-600 font-medium ml-1 hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <Link
                href="/admin"
                className="block text-center text-sm text-slate-500 hover:text-primary-600"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-slate-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <User className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-slate-900">Profile</h3>
            <p className="text-sm text-slate-500 mt-1">{user.email}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <ShoppingBag className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-slate-900">Orders</h3>
            <p className="text-sm text-slate-500 mt-1">{orders.length} total orders</p>
          </div>
          <Link href="/admin" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <Settings className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-slate-900">Admin Panel</h3>
            <p className="text-sm text-slate-500 mt-1">Manage store</p>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Order History</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No orders yet</p>
              <Link href="/products" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{order.order_number}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">${order.total_amount.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
