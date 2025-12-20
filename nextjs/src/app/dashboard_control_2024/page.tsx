'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut } from 'lucide-react'
import { useAdminAuth } from '@/store/adminAuth'

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAdminAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  const handleLogout = () => {
    logout()
    router.push('/dashboard_control_2024/login')
  }

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
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-slate-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">Admin Dashboard</h4>
              <p className="text-slate-500">Welcome to LuxuryHub Admin Panel</p>
              <p className="text-slate-500 mt-2">Full functionality coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}