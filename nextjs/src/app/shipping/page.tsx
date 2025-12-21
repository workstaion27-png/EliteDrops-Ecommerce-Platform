import Link from 'next/link'
import { ArrowLeft, Truck } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-luxury-gold hover:text-luxury-dark-gold transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LuxuryHub
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-8 w-8 text-luxury-gold" />
            <h1 className="text-3xl font-bold text-gray-900">Shipping Information</h1>
          </div>
          <p className="text-gray-600">
            Everything you need to know about shipping your LuxuryHub orders worldwide.
          </p>
        </div>

        {/* Shipping Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Options</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Standard Shipping</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">7-15</p>
              <p className="text-sm text-gray-600">business days</p>
              <p className="text-xs text-gray-500 mt-2">Most popular option</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Express Shipping</h3>
              <p className="text-2xl font-bold text-purple-600 mb-2">5-10</p>
              <p className="text-sm text-gray-600">business days</p>
              <p className="text-xs text-gray-500 mt-2">Select regions only</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Priority Shipping</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">3-7</p>
              <p className="text-sm text-gray-600">business days</p>
              <p className="text-xs text-gray-500 mt-2">Premium service</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Time</h3>
              <p className="text-gray-600">
                All orders are processed within 1-3 business days (excluding weekends and holidays) 
                after payment confirmation. During peak seasons or promotional periods, processing 
                time may extend to 3-5 business days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                We offer free shipping on orders over $100 USD to most destinations worldwide. 
                Shipping costs are calculated based on destination, weight, and selected shipping method, 
                and are displayed at checkout before payment confirmation.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">International Shipping</h3>
              <p className="text-gray-600">
                We ship to most countries worldwide. Please note that customs duties, taxes, and 
                brokerage fees imposed by the destination country are the responsibility of the 
                customer and are not included in our shipping costs.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Tracking</h3>
              <p className="text-gray-600">
                Full tracking is included for all orders. You'll receive a tracking number via email 
                once your order ships. Tracking information is typically available within 24-48 hours 
                after shipping and can be monitored via our order tracking page or the carrier's website.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Address Accuracy</h3>
              <p className="text-gray-600">
                Customers are responsible for ensuring accurate and complete shipping addresses. 
                LuxuryHub is not responsible for non-deliverable packages due to incorrect or 
                incomplete addresses. Additional shipping charges may apply for re-shipment if a 
                package is returned due to address issues.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Issues</h3>
              <p className="text-gray-600">
                If you experience delayed, lost, or damaged packages, please contact our customer 
                service team immediately. We'll work with the shipping carrier to resolve the issue 
                and may offer a replacement or refund depending on the circumstances.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Questions?</h3>
            <p className="text-gray-600 mb-4">
              Our shipping specialists are here to help with any questions about delivery options, 
              tracking, or international shipping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:support@luxuryhub.com"
                className="inline-flex items-center justify-center px-4 py-2 bg-luxury-gold text-white font-medium rounded-lg hover:bg-luxury-dark-gold transition-colors"
              >
                Email: support@luxuryhub.com
              </a>
              <a
                href="tel:+15551234567"
                className="inline-flex items-center justify-center px-4 py-2 border border-luxury-gold text-luxury-gold font-medium rounded-lg hover:bg-luxury-gold hover:text-white transition-colors"
              >
                Phone: +1 (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
