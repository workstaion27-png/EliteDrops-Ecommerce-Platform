'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react'

interface AdminLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void
  error?: string
}

export default function AdminLogin({ onLogin, error }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    onLogin(credentials)
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            لوحة التحكم الآمنة
          </h2>
          <p className="text-slate-300">
            تسجيل دخول للمديرين المعتمدين فقط
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="sr-only">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-slate-600 placeholder-slate-400 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:z-10"
                  placeholder="اسم المستخدم"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-slate-600 placeholder-slate-400 text-white bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:z-10"
                  placeholder="كلمة المرور"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-sky-400 mr-2" />
              <div className="text-sm text-slate-300">
                <p className="font-medium">إشعار أمني:</p>
                <p>هذا النظام محمي ومحفوظ. جميع محاولات الدخول مراقبة.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول الآمن'}
            </button>
          </div>

          {/* Security Features */}
          <div className="text-center">
            <div className="text-xs text-slate-400 space-y-1">
              <p>🔒 اتصال مشفر</p>
              <p>🛡️ حماية من الهجمات</p>
              <p>⏱️ انتهاء صلاحية الجلسة</p>
            </div>
          </div>
        </form>

        {/* Demo Credentials (Remove in production) */}
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 text-sm">
          <p className="text-yellow-200 font-medium mb-2">بيانات تجريبية للاختبار:</p>
          <p className="text-yellow-100">المستخدم: elitedrops_admin_2024</p>
          <p className="text-yellow-100">كلمة المرور: SecureAdminPass123!@#</p>
          <p className="text-yellow-300 mt-2 text-xs">⚠️ قم بتغيير هذه البيانات في الإنتاج</p>
        </div>
      </div>
    </div>
  )
}