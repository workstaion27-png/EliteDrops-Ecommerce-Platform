'use client'

import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, Key, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            هذه الصفحة محمية وتتطلب تسجيل دخول للمديرين المعتمدين فقط
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
              <Key className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">بيانات تسجيل الدخول</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-600 mb-1">اسم المستخدم:</p>
                <p className="font-mono text-sm font-medium text-slate-900">elitedrops_admin_2024</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-600 mb-1">كلمة المرور:</p>
                <p className="font-mono text-sm font-medium text-slate-900">SecureAdminPass123</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">مميزات لوحة التحكم</h3>
            </div>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                إدارة المنتجات والطلبات
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                إحصائيات المبيعات والعملاء
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                إعدادات الدفع والشحن
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                تكامل CJ Dropshipping
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard_control_2024')}
            className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Shield className="h-5 w-5 mr-3" />
            الدخول إلى لوحة التحكم
            <ArrowRight className="h-5 w-5 ml-3" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-amber-800 mb-2">
                إشعار أمني
              </h4>
              <p className="text-sm text-amber-700">
                هذه الصفحة محمية وتحتوي على بيانات حساسة. تأكد من تسجيل الخروج بعد الانتهاء من استخدام لوحة التحكم. 
                الجلسة ستنتهي تلقائياً بعد 30 دقيقة من عدم النشاط.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            العودة للموقع الرئيسي
          </Link>
        </div>
      </div>
    </div>
  )
}
