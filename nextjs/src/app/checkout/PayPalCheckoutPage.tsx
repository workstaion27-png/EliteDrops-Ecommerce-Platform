'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ArrowLeft, ShoppingBag, CreditCard, Truck, Shield, Check } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import { paypalScriptOptions } from '@/lib/paypal'

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const { items, getTotal, clearCart } = useCartStore()
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const createOrder = async () => {
    // إنشاء طلب في قاعدة البيانات
    const orderNumber = `EL${Date.now().toString().slice(-6)}`
    
    const orderData = {
      order_number: orderNumber,
      status: 'pending',
      total_amount: total,
      subtotal: subtotal,
      shipping_cost: shipping,
      tax_amount: tax,
      currency: 'USD',
      customer_email: formData.email,
      shipping_address: {
        line1: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zip,
        country: formData.country,
      },
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create order')
    }

    return orderNumber
  }

  const handlePayPalSuccess = async (details: any) => {
    setLoading(true)
    try {
      // تحديث حالة الطلب إلى مدفوع
      const orderNumber = details.purchase_units[0].custom_id
      
      await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          paypal_order_id: details.id,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)

      // إضافة عناصر الطلب
      const orderId = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .single()
        .then(res => res.data?.id || '')
      
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_name: item.product.name,
        quantity: item.quantity,
        price_at_time: item.product.price,
      }))

      if (orderItems.length > 0) {
        await supabase
          .from('order_items')
          .insert(orderItems)
      }

      setSuccess(true)
      setOrderNumber(orderNumber)
      clearCart()
      
    } catch (error) {
      console.error('Order confirmation error:', error)
      setError('حدث خطأ في تأكيد الطلب')
    } finally {
      setLoading(false)
    }
  }

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error)
    setError('فشل في معالجة الدفع')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">تم تأكيد الطلب!</h1>
            <p className="text-slate-600 mb-4">
              رقم الطلب: <strong>{orderNumber}</strong>
            </p>
            <p className="text-slate-600 mb-6">
              شكراً لك على طلبك! سيتم إرسال تأكيد بالتفاصيل إلى بريدك الإلكتروني.
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
            >
              مواصلة التسوق
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">سلة التسوق فارغة</h1>
            <p className="text-slate-600 mb-6">أضف بعض المنتجات إلى سلة التسوق أولاً</p>
            <Link 
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/cart" className="inline-flex items-center text-slate-600 hover:text-sky-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة إلى السلة
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* معلومات الطلب */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-8">معلومات الشحن</h1>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="أحمد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الاسم الأخير *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="محمد"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="123 شارع رئيسي"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    المدينة *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="القاهرة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الولاية/المحافظة *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="القاهرة"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الرمز البريدي *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الدولة *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="United States">الولايات المتحدة</option>
                    <option value="Canada">كندا</option>
                    <option value="United Kingdom">المملكة المتحدة</option>
                    <option value="Germany">ألمانيا</option>
                    <option value="France">فرنسا</option>
                    <option value="Spain">إسبانيا</option>
                    <option value="Italy">إيطاليا</option>
                    <option value="Netherlands">هولندا</option>
                    <option value="Australia">أستراليا</option>
                    <option value="Japan">اليابان</option>
                    <option value="Saudi Arabia">المملكة العربية السعودية</option>
                    <option value="United Arab Emirates">الإمارات العربية المتحدة</option>
                    <option value="Egypt">مصر</option>
                    <option value="Jordan">الأردن</option>
                    <option value="Lebanon">لبنان</option>
                    <option value="Morocco">المغرب</option>
                    <option value="Tunisia">تونس</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* ملخص الطلب والدفع */}
          <div>
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">ملخص الطلب</h2>
              
              {/* المنتجات */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                      <img 
                        src={item.product.images[0] || 'https://via.placeholder.com/64'} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{item.product.name}</h3>
                      <p className="text-sm text-slate-500">الكمية: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* المجاميع */}
              <div className="space-y-3 mb-6 pt-6 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">المجموع الفرعي</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">الشحن</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'مجاني' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">الضريبة</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200">
                  <span>المجموع الكلي</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="space-y-3 mb-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-sky-600" />
                  <span>شحن مجاني 3-5 أيام عمل</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-600" />
                  <span>دفع آمن ومحمي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-sky-600" />
                  <span>ادفع بالفيزا، الماستر كارد، أو PayPal</span>
                </div>
              </div>

              {/* PayPal Checkout */}
              <PayPalScriptProvider options={paypalScriptOptions}>
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "blue",
                    shape: "rect",
                    label: "paypal"
                  }}
                  createOrder={async () => {
                    if (!formData.email || !formData.firstName || !formData.lastName || 
                        !formData.address || !formData.city || !formData.state || !formData.zip) {
                      setError('يرجى ملء جميع الحقول المطلوبة')
                      return ''
                    }
                    
                    try {
                      const orderNumber = await createOrder()
                      return orderNumber
                    } catch (error) {
                      console.error('Error creating order:', error)
                      setError('فشل في إنشاء الطلب')
                      return ''
                    }
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      const details = await actions.order.capture()
                      await handlePayPalSuccess(details)
                    }
                  }}
                  onError={handlePayPalError}
                  onCancel={() => {
                    setError('تم إلغاء عملية الدفع')
                  }}
                />
              </PayPalScriptProvider>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}