'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAdminAuthStore } from '@/store/adminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminAuthStore()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const success = await login(credentials)
      if (success) {
        router.push('/dashboard_control_2024')
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">لوحة التحكم الآمنة</h1>
            <p className="text-slate-600">تسجيل الدخول إلى إدارة EliteDrops</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                placeholder="ادخل اسم المستخدم"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors pr-12"
                  placeholder="ادخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              لوحة التحكم محمية ومشفرة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}