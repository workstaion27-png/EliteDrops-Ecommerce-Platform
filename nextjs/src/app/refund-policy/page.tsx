import Link from 'next/link'
import { ArrowLeft, RefreshCw, Shield, Clock } from 'lucide-react'

export default function RefundPolicyPage() {
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
            <RefreshCw className="h-8 w-8 text-luxury-gold" />
            <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: December 21, 2025</p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Satisfaction is Our Priority</h3>
              <p className="text-blue-800">
                At LuxuryHub, we stand behind the quality of our products. If you're not completely satisfied with your purchase, 
                we're here to make it right.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Return Window</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">30 Days</p>
            <p className="text-sm text-gray-600">from delivery date</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Refund Process</h3>
            </div>
            <p className="text-lg font-bold text-blue-600">5-7 Days</p>
            <p className="text-sm text-gray-600">after approval</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Free Returns</h3>
            </div>
            <p className="text-lg font-bold text-purple-600">Yes</p>
            <p className="text-sm text-gray-600">prepaid shipping labels</p>
          </div>
        </div>

        {/* Detailed Policy */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Return Policy</h2>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Eligibility */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility for Returns</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Items must be in original condition and packaging</li>
                <li>All original tags and labels must be attached</li>
                <li>Returns must be initiated within 30 days of delivery</li>
                <li>Items must not show signs of wear, use, or damage</li>
                <li>Custom or personalized items are non-returnable unless defective</li>
              </ul>
            </section>

            {/* How to Return */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Initiate a Return</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Log into your LuxuryHub account</li>
                <li>Go to "My Orders" and select the item to return</li>
                <li>Click "Return Item" and follow the prompts</li>
                <li>Print the prepaid return shipping label</li>
                <li>Package the item securely with the original packaging</li>
                <li>Drop off at any authorized shipping location</li>
              </ol>
            </section>

            {/* Refund Process */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Process</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-luxury-gold text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="font-medium">Return Received & Inspected (1-2 days)</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-luxury-gold text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="font-medium">Refund Approval (2-3 days)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-luxury-gold text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="font-medium">Refund Processed (3-5 days to your account)</span>
                </div>
              </div>
            </section>

            {/* Exceptions */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Non-Returnable Items</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Custom or personalized products</li>
                <li>Intimate or sanitary goods</li>
                <li>Perishable items (food, flowers, etc.)</li>
                <li>Items damaged due to customer misuse</li>
                <li>Items returned after 30 days from delivery</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                Our customer service team is here to help you with any questions about returns or refunds.
              </p>
              <div className="bg-luxury-light-gold rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-luxury-black mb-2">Email Support</h4>
                    <p className="text-luxury-dark-gold">support@luxuryhub.com</p>
                    <p className="text-sm text-gray-600">Response within 24 hours</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-luxury-black mb-2">Phone Support</h4>
                    <p className="text-luxury-dark-gold">1-800-LUXURY-HUB</p>
                    <p className="text-sm text-gray-600">24/7 Customer Service</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}