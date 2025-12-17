import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, Lock, ArrowLeft, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const { items, getTotal, clearCart } = useCartStore()
  
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', address: '', city: '', state: '', zip: '', country: 'United States',
    cardNumber: '', expiry: '', cvc: '',
  })

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const cartItems = items.map(item => ({
        product_id: item.product.id, cj_product_id: item.product.cj_product_id,
        product_name: item.product.name, product_image_url: item.product.images[0],
        quantity: item.quantity, price: item.product.price,
      }))

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({
          amount: total, currency: 'usd', cartItems, customerEmail: formData.email,
          shippingAddress: { line1: formData.address, city: formData.city, state: formData.state, postal_code: formData.zip, country: formData.country },
        }),
      })

      const result = await response.json()
      if (result.error) throw new Error(result.error.message || 'Payment failed')

      setOrderNumber(result.data.orderNumber)
      setSuccess(true)
      clearCart()
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !success) {
    navigate('/cart')
    return null
  }

  if (success) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="h-8 w-8 text-green-600" /></div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-600 mb-4">Thank you for your purchase. Your order number is:</p>
          <p className="text-xl font-mono font-bold text-sky-600 mb-8">{orderNumber}</p>
          <p className="text-sm text-slate-500 mb-8">We will send a confirmation email to {formData.email}</p>
          <Link to="/products" className="inline-flex items-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/cart" className="inline-flex items-center text-slate-600 hover:text-sky-600 mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back to Cart</Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Contact Information</h2>
                <input type="email" name="email" placeholder="Email address" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First name" required value={formData.firstName} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  <input type="text" name="lastName" placeholder="Last name" required value={formData.lastName} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <input type="text" name="address" placeholder="Address" required value={formData.address} onChange={handleChange} className="w-full mt-4 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <input type="text" name="city" placeholder="City" required value={formData.city} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  <input type="text" name="state" placeholder="State" required value={formData.state} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  <input type="text" name="zip" placeholder="ZIP" required value={formData.zip} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Payment (Visa Card)</h2>
                  <div className="flex items-center text-sm text-slate-500"><Lock className="h-4 w-4 mr-1" />Secure</div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input type="text" name="cardNumber" placeholder="Card number" required maxLength={19} value={formData.cardNumber} onChange={handleChange} className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="expiry" placeholder="MM/YY" required maxLength={5} value={formData.expiry} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    <input type="text" name="cvc" placeholder="CVC" required maxLength={4} value={formData.cvc} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>}

              <button type="submit" disabled={loading} className="w-full py-4 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {loading ? <span className="animate-pulse">Processing...</span> : <><Lock className="h-4 w-4 mr-2" />Pay ${total.toFixed(2)}</>}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img src={item.product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} alt={item.product.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-600 text-white text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-sm text-slate-500">${item.product.price.toFixed(2)}</p>
                    </div>
                    <p className="font-medium text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-slate-600"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-slate-900 text-lg pt-3 border-t border-slate-200"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
