'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, DollarSign, Users, LogOut } from 'lucide-react'

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('luxuryhub_admin_session')
      if (session) {
        try {
          const parsedSession = JSON.parse(session)
          if (parsedSession.isAuthenticated) {
            setIsAuthenticated(true)
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxuryhub_admin_session')
    }
    router.push('/admin-control/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">LuxuryHub Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-600">1,247</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">$45,892</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Products</h3>
            <p className="text-2xl font-bold text-purple-600">156</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Customers</h3>
            <p className="text-2xl font-bold text-orange-600">892</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>#1234 - Premium Watch - John Doe - $299.99</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">Shipped</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>#1235 - Luxury Bag - Jane Smith - $599.99</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">Processing</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>#1236 - Designer Sunglasses - Mike Johnson - $199.99</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}