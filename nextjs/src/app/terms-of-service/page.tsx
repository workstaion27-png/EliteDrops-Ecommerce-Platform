import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react'

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            The terms and conditions that govern your use of LuxuryHub services
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            
            {/* Quick Reference */}
            <div className="bg-slate-50 rounded-lg p-6 mb-12">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Reference</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Age Requirement</p>
                    <p className="text-xs text-slate-600">You must be 18+ to use our services</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Order Changes</p>
                    <p className="text-xs text-slate-600">Changes allowed within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Returns Policy</p>
                    <p className="text-xs text-slate-600">30-day return window (see details)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">International Orders</p>
                    <p className="text-xs text-slate-600">Customs fees may apply</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">1. Acceptance of Terms</h2>
            
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                By accessing and using the LuxuryHub website and services, you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, please do 
                not use this service.
              </p>
              
              <p className="text-slate-600 leading-relaxed">
                These Terms of Service apply to all visitors, users, and others who access or use the service. 
                We reserve the right to update these terms at any time without prior notice.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">2. Use of Service</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Eligibility</h3>
                <p className="text-slate-600 leading-relaxed">
                  You must be at least 18 years old to use this service. By using our service, you represent 
                  and warrant that you have the legal capacity to enter into these terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Account Responsibilities</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, 
                  and current at all times. You are responsible for:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Safeguarding your account password and login credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Promptly notifying us of any unauthorized use of your account</li>
                  <li>Maintaining the accuracy of your account information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Prohibited Uses</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  You may not use our service for any unlawful purpose or to solicit others to engage in 
                  unlawful activities, including but not limited to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</li>
                  <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
                  <li>Submitting false or misleading information</li>
                  <li>Uploading or transmitting viruses or any other type of malicious code</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">3. Products and Services</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Product Information</h3>
                <p className="text-slate-600 leading-relaxed">
                  We strive to provide accurate product descriptions, images, and pricing. However, we do not 
                  warrant that product descriptions or other content is accurate, complete, reliable, current, 
                  or error-free. Colors may appear differently on your screen than actual product colors.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Pricing and Availability</h3>
                <p className="text-slate-600 leading-relaxed">
                  All prices are subject to change without notice. We reserve the right to modify or discontinue 
                  any product at any time. We are not liable for any price changes or product discontinuations. 
                  Product availability is not guaranteed and may change without notice.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Order Acceptance</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your receipt of an order confirmation does not signify our acceptance of your order. We reserve 
                  the right to refuse or cancel any order for any reason, including but not limited to product 
                  availability, errors in product or pricing information, or problems identified by our credit 
                  and fraud avoidance department.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">4. Payment and Billing</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Payment Methods</h3>
                <p className="text-slate-600 leading-relaxed">
                  We accept various payment methods including major credit cards, debit cards, and digital 
                  payment platforms. All payments are processed securely through third-party payment processors. 
                  We do not store your payment information on our servers.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Billing and Pricing</h3>
                <p className="text-slate-600 leading-relaxed">
                  You agree to provide current, complete, and accurate billing information. You are responsible 
                  for all charges incurred, including applicable taxes, shipping costs, and customs duties for 
                  international orders.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Payment Disputes</h3>
                <p className="text-slate-600 leading-relaxed">
                  In case of payment disputes, we will work with you and the payment processor to resolve the 
                  issue. Unauthorized or fraudulent charges should be reported immediately to your payment 
                  provider and to us.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">5. Shipping and Delivery</h2>
            
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Please refer to our{' '}
                <Link href="/shipping-policy" className="text-primary-600 hover:underline">
                  Shipping Policy
                </Link>{' '}
                for detailed information about shipping methods, timeframes, and costs. Key points include:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Processing time: 1-3 business days</li>
                <li>Shipping time: 7-15 business days for most destinations</li>
                <li>International orders may be subject to customs delays and additional fees</li>
                <li>Risk of loss passes to you upon delivery to the shipping address</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">6. Returns and Refunds</h2>
            
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Please refer to our{' '}
                <Link href="/refund-policy" className="text-primary-600 hover:underline">
                  Refund Policy
                </Link>{' '}
                for detailed information about returns and refunds. Generally:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>30-day return window for most items</li>
                <li>Items must be in original condition with tags attached</li>
                <li>Return shipping costs are the customer's responsibility unless item was defective</li>
                <li>Refunds are processed to the original payment method</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">7. Intellectual Property</h2>
            
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                The service and its original content, features, and functionality are and will remain the 
                exclusive property of LuxuryHub and its licensors. The service is protected by copyright, 
                trademark, and other laws. Our trademarks and trade dress may not be used in connection with 
                any product or service without our prior written consent.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">8. Limitation of Liability</h2>
            
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                In no event shall LuxuryHub, nor its directors, employees, partners, agents, suppliers, or 
                affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                resulting from your use of the service.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">9. Contact Information</h2>
            
            <div className="bg-slate-50 rounded-lg p-6 mt-8">
              <p className="text-slate-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Contact Legal Team
                </Link>
              </div>
            </div>

            <div className="text-sm text-slate-500 mt-12 pt-6 border-t border-slate-200">
              <p>Last updated: December 21, 2025</p>
              <p className="mt-2">
                These terms constitute the entire agreement between you and LuxuryHub regarding the use of our service. 
                Any failure to enforce any provision of these terms shall not be considered a waiver of those provisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}