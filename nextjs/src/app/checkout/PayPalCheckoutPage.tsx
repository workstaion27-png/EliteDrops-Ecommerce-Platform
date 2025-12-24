'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ArrowLeft, ShoppingBag, CreditCard, Truck, Shield, Check, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import { StoreServices } from '@/lib/store-services'
import { paypalScriptOptions } from '@/lib/paypal'

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [cjConversionStatus, setCjConversionStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending')
  const [cjOrderId, setCjOrderId] = useState<string | null>(null)
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

  // Check if cart contains CJ products
  const hasCJProducts = async () => {
    try {
      const productIds = items.map(item => item.product.id)
      const { data: products } = await supabase
        .from('products')
        .select('cj_product_id')
        .in('id', productIds)
        .not('cj_product_id', 'is', null)
      
      return products && products.length > 0
    } catch (error) {
      console.error('Error checking CJ products:', error)
      return false
    }
  }

  // Convert order to CJ Dropshipping automatically
  const convertOrderToCJ = async (orderId: string) => {
    try {
      setCjConversionStatus('processing')
      
      const cjOrder = await StoreServices.createCJOrder(orderId)
      
      setCjConversionStatus('success')
      setCjOrderId(cjOrder.orderId)
      
      console.log('Order converted to CJ successfully:', cjOrder.orderId)
    } catch (error) {
      setCjConversionStatus('error')
      console.error('Failed to convert order to CJ:', error)
      
      // Don't block the success flow if CJ conversion fails
      // Admin can retry manually later
    }
  }

  const createOrder = async () => {
    // Create order in database
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
      // Update order status to paid
      const orderNumber = details.purchase_units[0].custom_id
      
      await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          paypal_order_id: details.id,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)

      // Add order items
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

      // Check if order contains CJ products and convert automatically
      const hasCJ = await hasCJProducts()
      if (hasCJ) {
        await convertOrderToCJ(orderId)
      }

      setSuccess(true)
      setOrderNumber(orderNumber)
      clearCart()
      
    } catch (error) {
      console.error('Order confirmation error:', error)
      setError('حدث خطأ أثناء تأكيد الطلب')
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
            <p className="text-slate-600 mb-2">
              Order Number: <strong>{orderNumber}</strong>
            </p>
            
            {/* CJ Conversion Status */}
            {cjConversionStatus !== 'pending' && (
              <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">تأكيد الطلب</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-600">تم تأكيد الطلب بنجاح</span>
                  </div>
                  
                  {cjConversionStatus === 'processing' && (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-slate-600">جاري إرسال الطلب إلى CJ Dropshipping...</span>
                    </div>
                  )}
                  
                  {cjConversionStatus === 'success' && cjOrderId && (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-slate-600">تم إرسال الطلب إلى CJ بنجاح</span>
                    </div>
                  )}
                  
                  {cjConversionStatus === 'success' && cjOrderId && (
                    <div className="text-xs text-slate-500 mt-2">
                      CJ Order ID: {cjOrderId}
                    </div>
                  )}
                  
                  {cjConversionStatus === 'error' && (
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-slate-600">سيتم إرسال الطلب يدوياً من قبل الإدارة</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-slate-600 mb-6 mt-4">
              شكراً لك على طلبك! سيتم إرسال رسالة تأكيد بالتفاصيل إلى بريدك الإلكتروني.
            </p>
            
            <div className="space-y-3">
              <Link 
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
              >
                Continue Shopping
              </Link>
              
              <div className="text-sm text-slate-500">
                تحتاج مساعدة؟ تواصل معنا على: support@luxuryhub.com
              </div>
            </div>
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">السلة فارغة</h1>
            <p className="text-slate-600 mb-6">أضف بعض المنتجات إلى سلتك أولاً</p>
            <Link 
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
            >
              Browse Products
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
          Back to Cart
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Shipping Information</h1>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
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
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
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
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zip Code *
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
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Australia">Australia</option>
                    <option value="Japan">Japan</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Tunisia">Tunisia</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary and Payment */}
          <div>
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
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
                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pt-6 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-3 mb-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-sky-600" />
                  <span>Free shipping 3-5 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-600" />
                  <span>Secure payment protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-sky-600" />
                  <span>Pay with Visa, MasterCard, or PayPal</span>
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
                    setError('تم إلغاء الدفع')
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