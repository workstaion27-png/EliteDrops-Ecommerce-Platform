'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, DollarSign, Settings, Eye, EyeOff, Plus, Trash2, 
  Edit, Check, X, AlertCircle, Key, Shield, Globe, Zap
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PaymentGateway {
  id: string
  name: string
  type: 'paypal' | 'stripe' | 'visa' | 'mastercard' | 'american_express'
  api_key: string
  secret_key?: string
  is_active: boolean
  config: any
  created_at: string
  updated_at: string
}

interface PaymentGatewaysProps {
  onUpdate: () => void
}

export default function PaymentGateways({ onUpdate }: PaymentGatewaysProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGateways(data || [])
    } catch (err) {
      console.error('Error fetching gateways:', err)
      setError('فشل في جلب بيانات بوابات الدفع')
    } finally {
      setLoading(false)
    }
  }

  const toggleGatewayStatus = async (gatewayId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({ 
          is_active: !isActive, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', gatewayId)

      if (error) throw error
      
      setGateways(gateways.map(g => 
        g.id === gatewayId ? { ...g, is_active: !isActive } : g
      ))
      
      setSuccess(isActive ? 'تم إلغاء تفعيل البوابة بنجاح' : 'تم تفعيل البوابة بنجاح')
      onUpdate()
    } catch (err) {
      setError('فشل في تحديث حالة البوابة')
    }
  }

  const deleteGateway = async (gatewayId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البوابة؟')) return

    try {
      const { error } = await supabase
        .from('payment_gateways')
        .delete()
        .eq('id', gatewayId)

      if (error) throw error
      
      setGateways(gateways.filter(g => g.id !== gatewayId))
      setSuccess('تم حذف البوابة بنجاح')
      onUpdate()
    } catch (err) {
      setError('فشل في حذف البوابة')
    }
  }

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'paypal': return '🟦'
      case 'stripe': return '🟣'
      case 'visa': return '🔵'
      case 'mastercard': return '🔴'
      case 'american_express': return '🟢'
      default: return '💳'
    }
  }

  const getGatewayName = (type: string) => {
    switch (type) {
      case 'paypal': return 'PayPal'
      case 'stripe': return 'Stripe'
      case 'visa': return 'Visa'
      case 'mastercard': return 'MasterCard'
      case 'american_express': return 'American Express'
      default: return type
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'نشط' : 'معطل'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">إدارة بوابات الدفع</h2>
        <button
          onClick={() => {
            setEditingGateway(null)
            setShowAddModal(true)
          }}
          className="inline-flex items-center px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          إضافة بوابة دفع
        </button>
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">البوابة</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">النوع</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">API Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">تاريخ الإعداد</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {gateways.map((gateway) => (
              <tr key={gateway.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getGatewayIcon(gateway.type)}</span>
                    <div>
                      <p className="font-medium text-slate-900">{gateway.name}</p>
                      <p className="text-sm text-slate-500">بوابة دفع {getGatewayName(gateway.type)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                    {getGatewayName(gateway.type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-slate-600">
                      {gateway.api_key ? `${gateway.api_key.substring(0, 8)}...` : 'غير محدد'}
                    </span>
                    {gateway.api_key && (
                      <button className="text-slate-400 hover:text-slate-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(gateway.is_active)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(gateway.created_at).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingGateway(gateway)
                        setShowAddModal(true)
                      }}
                      className="p-2 text-slate-600 hover:text-sky-600 transition-colors"
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleGatewayStatus(gateway.id, gateway.is_active)}
                      className={`p-2 transition-colors ${
                        gateway.is_active 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-slate-600 hover:text-green-600'
                      }`}
                      title={gateway.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                    >
                      {gateway.is_active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteGateway(gateway.id)}
                      className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {gateways.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد بوابات دفع</h3>
            <p className="text-slate-500 mb-4">ابدأ بإضافة بوابة دفع واحدة على الأقل</p>
            <button
              onClick={() => {
                setEditingGateway(null)
                setShowAddModal(true)
              }}
              className="inline-flex items-center px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              إضافة بوابة دفع
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Gateway Modal */}
      {showAddModal && (
        <GatewayModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setEditingGateway(null)
          }}
          gateway={editingGateway}
          onSave={() => {
            fetchGateways()
            onUpdate()
          }}
        />
      )}
    </div>
  )
}

// Gateway Modal Component
function GatewayModal({ isOpen, onClose, gateway, onSave }: {
  isOpen: boolean
  onClose: () => void
  gateway: PaymentGateway | null
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: gateway?.name || '',
    type: gateway?.type || 'paypal',
    api_key: gateway?.api_key || '',
    secret_key: gateway?.secret_key || '',
    is_active: gateway?.is_active ?? true,
    config: gateway?.config || {}
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSecrets, setShowSecrets] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (gateway) {
        // Update existing gateway
        const { error } = await supabase
          .from('payment_gateways')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', gateway.id)

        if (error) throw error
      } else {
        // Create new gateway
        const { error } = await supabase
          .from('payment_gateways')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في حفظ البوابة')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">
            {gateway ? 'تعديل بوابة الدفع' : 'إضافة بوابة دفع جديدة'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Gateway Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              اسم البوابة *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="مثال: بوابة PayPal الرئيسية"
            />
          </div>

          {/* Gateway Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              نوع البوابة *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="visa">Visa</option>
              <option value="mastercard">MasterCard</option>
              <option value="american_express">American Express</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API Key *
            </label>
            <div className="relative">
              <input
                type={showSecrets ? 'text' : 'password'}
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                required
                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="أدخل API Key"
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showSecrets ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Secret Key */}
          {['paypal', 'stripe'].includes(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={formData.secret_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="أدخل Secret Key (اختياري)"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecrets ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900">
              تفعيل البوابة (ستظهر في صفحة الدفع)
            </label>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-yellow-600 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">إشعار أمني:</p>
                <p className="text-yellow-700">سيتم حفظ هذه البيانات بشكل آمن ومشفر. تأكد من عدم مشاركتها مع أي شخص غير مخول.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : (gateway ? 'تحديث البوابة' : 'إضافة البوابة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}