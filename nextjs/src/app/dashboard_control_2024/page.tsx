'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardControlPage() {
  const router = useRouter()

  useEffect(() => {
    // إعادة توجيه إلى صفحة secure-admin
    router.replace('/secure-admin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
        <p className="text-slate-600">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  )
}