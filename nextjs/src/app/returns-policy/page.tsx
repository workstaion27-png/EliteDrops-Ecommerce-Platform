import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'

export default function ReturnsPolicyPage() {
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
            <RotateCcw className="h-8 w-8 text-luxury-gold" />
            <h1 className="text-3xl font-bold text-gray-900">Returns Policy</h1>
          </div>
          <p className="text-gray-600">
            Learn about our hassle-free return process and policies at LuxuryHub.
          </p>
        </div>

        {/* Returns Policy Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Policy Overview</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Return Window</h3>
              <p className="text-gray-600">
                We offer a 30-day return window from the delivery date for all eligible items. 
                Items must be in their original condition with all tags and packaging intact.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Return Process</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Log into your LuxuryHub account</li>
                <li>Navigate to "My Orders" section</li>
                <li>Select the item you wish to return</li>
                <li>Click "Return Item" and follow the prompts</li>
                <li>Print the prepaid return shipping label</li>
                <li>Package the item securely with original packaging</li>
                <li>Drop off at any authorized shipping location</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Refund Timeline</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Return Received & Inspected:</strong> 1-2 business days</li>
                <li><strong>Refund Approval:</strong> 2-3 business days</li>
                <li><strong>Refund Processed:</strong> 3-5 business days to your account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Return Shipping</h3>
              <p className="text-gray-600">
                We provide prepaid return shipping labels for all returns. There is no cost to you for 
                returning items within the 30-day window.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-Returnable Items</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Custom or personalized products</li>
                <li>Intimate or sanitary goods</li>
                <li>Perishable items (food, flowers, etc.)</li>
                <li>Items damaged due to customer misuse</li>
                <li>Items returned after 30 days from delivery</li>
                <li>Items without original tags or packaging</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exchange Policy</h3>
              <p className="text-gray-600">
                We offer exchanges for different sizes or colors when available. Please contact our 
                customer service team to inquire about exchange options for your specific item.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help with Returns?</h3>
            <p className="text-gray-600 mb-4">
              Our customer service team is here to assist you with any return-related questions.
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
