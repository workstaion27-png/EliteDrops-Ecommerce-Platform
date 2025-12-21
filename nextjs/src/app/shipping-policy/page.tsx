import Link from 'next/link'
import { ArrowLeft, Truck, Globe, Clock, Shield } from 'lucide-react'

export default function ShippingPolicyPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Shipping Policy</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Fast, secure, and reliable shipping to customers worldwide
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            
            {/* Quick Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <Clock className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Processing Time</h3>
                <p className="text-sm text-slate-600">1-3 business days</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <Truck className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Shipping Time</h3>
                <p className="text-sm text-slate-600">7-15 business days</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <Shield className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Tracking</h3>
                <p className="text-sm text-slate-600">Full tracking included</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Shipping Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Processing Time</h3>
                <p className="text-slate-600 leading-relaxed">
                  All orders are processed within 1-3 business days (excluding weekends and holidays) after payment confirmation. 
                  During peak seasons or promotional periods, processing times may be extended to 3-5 business days.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Shipping Methods</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  We partner with trusted logistics providers to ensure your orders are delivered safely and on time:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li><strong>Standard Shipping:</strong> 3-5 business days (most popular)</li>
                  <li><strong>Express Shipping:</strong> 5-10 business days (available for select regions)</li>
                  <li><strong>Priority Shipping:</strong> 3-7 business days (premium service)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Shipping Costs</h3>
                <p className="text-slate-600 leading-relaxed">
                  All shipping is completely free for all orders to most destinations worldwide. 
                  No minimum order amount required. All shipping methods (Standard, Express, Priority) 
                  are free for all our customers.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">International Shipping</h3>
                <p className="text-slate-600 leading-relaxed">
                  We ship to most countries worldwide. International orders may be subject to customs duties, taxes, 
                  and brokerage fees imposed by the destination country. These charges are the responsibility of the customer 
                  and are not included in our shipping costs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Tracking Information</h3>
                <p className="text-slate-600 leading-relaxed">
                  Once your order ships, you will receive a tracking number via email. You can use this number to 
                  monitor your package's progress through our order tracking page or the carrier's website. 
                  Tracking information is typically available within 24-48 hours after shipping.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Delivery Issues</h3>
                <p className="text-slate-600 leading-relaxed">
                  If your package is delayed, lost, or damaged during shipping, please contact our customer service team 
                  immediately. We will work with the shipping carrier to resolve the issue and may offer a replacement 
                  or refund depending on the circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Address Accuracy</h3>
                <p className="text-slate-600 leading-relaxed">
                  Please ensure your shipping address is accurate and complete. We are not responsible for packages 
                  that cannot be delivered due to incorrect or incomplete addresses. If a package is returned to us 
                  due to an address issue, additional shipping charges may apply for re-shipment.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mt-12">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Questions About Shipping?</h3>
              <p className="text-slate-600 mb-4">
                If you have any questions about our shipping policy or need assistance with your order, 
                please don't hesitate to contact our customer service team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Contact Support
                </Link>
                <Link 
                  href="/track-order" 
                  className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Track Your Order
                </Link>
              </div>
            </div>

            <div className="text-sm text-slate-500 mt-12 pt-6 border-t border-slate-200">
              <p>Last updated: December 21, 2025</p>
              <p className="mt-2">
                This shipping policy is part of our{' '}
                <Link href="/terms-of-service" className="text-primary-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}