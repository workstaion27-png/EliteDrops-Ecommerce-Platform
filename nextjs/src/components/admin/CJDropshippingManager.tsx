'use client'

import { useState, useEffect } from 'react'
import { 
  Package, Truck, RefreshCw, Settings, Eye, EyeOff, Check, X, 
  AlertCircle, Key, Sync, Upload, Download, BarChart3, Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CJDropshippingSettings {
  id: string
  api_key: string
  affiliate_id: string
  is_active: boolean
  auto_sync: boolean
  sync_frequency: 'hourly' | 'daily' | 'weekly'
  auto_import_products: boolean
  auto_update_inventory: boolean
  auto_process_orders: boolean
  webhook_url: string
  last_sync: string
  sync_status: 'idle' | 'syncing' | 'success' | 'error'
  total_products: number
  imported_products: number
  config: any
  created_at: string
  updated_at: string
}

interface CJDropshippingProps {
  onUpdate: () => void
}

export default function CJDropshippingManager({ onUpdate }: CJDropshippingProps) {
  const [settings, setSettings] = useState<CJDropshippingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('cj_dropshipping_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setSettings(data || null)
    } catch (err) {
      console.error('Error fetching CJ settings:', err)
      setError('فشل في جلب إعدادات CJ Dropshipping')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('cj_dropshipping_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id)

        if (error) throw error
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('cj_dropshipping_settings')
          .insert([{
            ...settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error
        setSettings(data)
      }

      setSuccess('تم حفظ الإعدادات بنجاح')
      onUpdate()
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const syncProducts = async () => {
    if (!settings?.api_key) {
      setError('يرجى إعداد API Key أولاً')
      return
    }

    setSyncing(true)
    setError('')

    try {
      // محاكاة عملية المزامنة
      setSettings(prev => prev ? { ...prev, sync_status: 'syncing' } : null)
      
      // هنا يتم استدعاء API الحقيقية لـ CJ
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newSettings = {
        ...settings,
        sync_status: 'success' as const,
        last_sync: new Date().toISOString(),
        total_products: Math.floor(Math.random() * 50000) + 10000,
        imported_products: Math.floor(Math.random() * 5000) + 1000
      }
      
      setSettings(newSettings)
      setSuccess('تمت مزامنة المنتجات بنجاح')
      onUpdate()
      
    } catch (err) {
      setSettings(prev => prev ? { ...prev, sync_status: 'error' } : null)
      setError('فشل في مزامنة المنتجات')
    } finally {
      setSyncing(false)
    }
  }

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'syncing': return 'text-blue-600'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-slate-600'
    }
  }

  const getSyncStatusText = (status: string) => {
    switch (status) {
      case 'syncing': return 'جاري المزامنة...'
      case 'success': return 'تمت المزامنة'
      case 'error': return 'خطأ في المزامنة'
      default: return 'غير متزامن'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة CJ Dropshipping</h2>
          <p className="text-slate-600 mt-1">تكامل مع منصة CJ Dropshipping لإدارة المنتجات والطلبات</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={syncProducts}
            disabled={syncing || !settings?.api_key}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'جاري المزامنة...' : 'مزامنة المنتجات'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* CJ Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">حالة التكامل</p>
              <p className="text-2xl font-bold text-slate-900">
                {settings?.is_active ? 'مفعل' : 'معطل'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              settings?.is_active ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Truck className={`h-6 w-6 ${
                settings?.is_active ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">آخر مزامنة</p>
              <p className="text-lg font-bold text-slate-900">
                {settings?.last_sync ? 
                  new Date(settings.last_sync).toLocaleDateString('ar-EG') : 
                  'لم تتم'
                }
              </p>
            </div>
            <Clock className="h-12 w-12 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">حالة المزامنة</p>
              <p className={`text-lg font-bold ${getSyncStatusColor(settings?.sync_status || 'idle')}`}>
                {getSyncStatusText(settings?.sync_status || 'idle')}
              </p>
            </div>
            <Sync className={`h-12 w-12 ${
              settings?.sync_status === 'syncing' ? 'text-blue-600 animate-spin' : 'text-slate-400'
            }`} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">المنتجات المستوردة</p>
              <p className="text-2xl font-bold text-slate-900">
                {settings?.imported_products || 0}
              </p>
            </div>
            <Package className="h-12 w-12 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">إعدادات التكامل</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* API Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings?.api_key || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, api_key: e.target.value } : null)}
                  placeholder="أدخل API Key الخاص بك"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Affiliate ID
              </label>
              <input
                type="text"
                value={settings?.affiliate_id || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, affiliate_id: e.target.value } : null)}
                placeholder="معرف الشريك"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={settings?.webhook_url || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, webhook_url: e.target.value } : null)}
              placeholder="https://yoursite.com/api/cj-webhook"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="text-sm text-slate-500 mt-1">
              سيتم إرسال تحديثات الطلبات إلى هذا الرابط
            </p>
          </div>

          {/* Sync Settings */}
          <div>
            <h4 className="text-lg font-medium text-slate-900 mb-4">إعدادات المزامنة التلقائية</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">تفعيل المزامنة التلقائية</p>
                  <p className="text-sm text-slate-500">مزامنة تلقائية للمنتجات من CJ</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.auto_sync || false}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, auto_sync: e.target.checked } : null)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                />
              </div>

              {settings?.auto_sync && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    تكرار المزامنة
                  </label>
                  <select
                    value={settings?.sync_frequency || 'daily'}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, sync_frequency: e.target.value as any } : null)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="hourly">كل ساعة</option>
                    <option value="daily">يومياً</option>
                    <option value="weekly">أسبوعياً</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">استيراد المنتجات تلقائياً</p>
                  <p className="text-sm text-slate-500">إضافة المنتجات الجديدة تلقائياً</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.auto_import_products || false}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, auto_import_products: e.target.checked } : null)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">تحديث المخزون تلقائياً</p>
                  <p className="text-sm text-slate-500">تحديث كميات المخزون من CJ</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.auto_update_inventory || false}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, auto_update_inventory: e.target.checked } : null)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">معالجة الطلبات تلقائياً</p>
                  <p className="text-sm text-slate-500">إرسال الطلبات تلقائياً إلى CJ</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.auto_process_orders || false}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, auto_process_orders: e.target.checked } : null)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Integration Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">تفعيل التكامل</p>
              <p className="text-sm text-slate-500">تشغيل أو إيقاف التكامل مع CJ Dropshipping</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.is_active || false}
              onChange={(e) => setSettings(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              onClick={saveSettings}
              disabled={saving || !settings?.api_key}
              className="px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {settings && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">إحصائيات المنتجات</h4>
              <Package className="h-8 w-8 text-sky-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">إجمالي منتجات CJ</span>
                <span className="font-semibold">{settings.total_products?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">منتجات مستوردة</span>
                <span className="font-semibold text-green-600">{settings.imported_products?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">معدل الاستيراد</span>
                <span className="font-semibold">
                  {settings.total_products ? 
                    ((settings.imported_products / settings.total_products) * 100).toFixed(1) : 0
                  }%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">حالة المزامنة</h4>
              <Sync className={`h-8 w-8 ${getSyncStatusColor(settings.sync_status)}`} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">الحالة الحالية</span>
                <span className={`font-semibold ${getSyncStatusColor(settings.sync_status)}`}>
                  {getSyncStatusText(settings.sync_status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">آخر محاولة</span>
                <span className="font-semibold">
                  {settings.last_sync ? 
                    new Date(settings.last_sync).toLocaleDateString('ar-EG') : 
                    'لم تتم'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">التكرار</span>
                <span className="font-semibold">{settings.sync_frequency || 'غير محدد'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">الإعدادات النشطة</h4>
              <Settings className="h-8 w-8 text-slate-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">مزامنة تلقائية</span>
                <span className={settings.auto_sync ? 'text-green-600' : 'text-red-600'}>
                  {settings.auto_sync ? 'مفعل' : 'معطل'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">استيراد تلقائي</span>
                <span className={settings.auto_import_products ? 'text-green-600' : 'text-red-600'}>
                  {settings.auto_import_products ? 'مفعل' : 'معطل'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">معالجة تلقائية</span>
                <span className={settings.auto_process_orders ? 'text-green-600' : 'text-red-600'}>
                  {settings.auto_process_orders ? 'مفعل' : 'معطل'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}