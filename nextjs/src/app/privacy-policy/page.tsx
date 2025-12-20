import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, UserCheck } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we protect and handle your personal information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            
            {/* Trust Indicators */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <Lock className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Data Protection</h3>
                <p className="text-sm text-slate-600">Industry-standard encryption</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <Eye className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Transparency</h3>
                <p className="text-sm text-slate-600">Clear data usage policies</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <UserCheck className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Your Rights</h3>
                <p className="text-sm text-slate-600">Full control over your data</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Personal Information</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  When you create an account or place an order, we may collect the following information:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Name and contact information (email address, phone number, mailing address)</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Account credentials and preferences</li>
                  <li>Order history and communication preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Automatically Collected Information</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  When you visit our website, we automatically collect certain information:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website and search terms</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">How We Use Your Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Order Processing and Fulfillment</h3>
                <p className="text-slate-600 leading-relaxed">
                  We use your personal information to process and fulfill your orders, including order confirmation, 
                  shipping notifications, and customer service communications.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Communication and Marketing</h3>
                <p className="text-slate-600 leading-relaxed">
                  With your consent, we may send you promotional emails about new products, special offers, 
                  and updates. You can unsubscribe from marketing communications at any time using the 
                  unsubscribe link in our emails or by contacting us directly.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Website Improvement</h3>
                <p className="text-slate-600 leading-relaxed">
                  We analyze website usage data to improve our services, user experience, and product offerings. 
                  This helps us understand customer preferences and optimize our website functionality.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Legal Compliance</h3>
                <p className="text-slate-600 leading-relaxed">
                  We may use or disclose your information when required by law, to protect our rights, 
                  or to ensure the safety and security of our users and website.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">Information Sharing and Disclosure</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Third-Party Service Providers</h3>
                <p className="text-slate-600 leading-relaxed">
                  We work with trusted third-party service providers to operate our business, including:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-2">
                  <li>Payment processors for secure payment handling</li>
                  <li>Shipping carriers for order fulfillment</li>
                  <li>Email service providers for communication</li>
                  <li>Analytics providers for website optimization</li>
                </ul>
                <p className="text-slate-600 leading-relaxed mt-2">
                  These providers are contractually obligated to protect your information and use it only 
                  for the purposes we specify.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Business Transfers</h3>
                <p className="text-slate-600 leading-relaxed">
                  In the event of a merger, acquisition, or sale of our business, your personal information 
                  may be transferred as part of the transaction. We will notify you of any such change 
                  in ownership or control of your personal information.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">Your Rights and Choices</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Access and Control</h3>
                <p className="text-slate-600 leading-relaxed">
                  You have the right to access, update, or delete your personal information. You can manage 
                  your account settings or contact us to request changes to your data.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Marketing Communications</h3>
                <p className="text-slate-600 leading-relaxed">
                  You can opt out of marketing communications at any time by clicking the unsubscribe link 
                  in our emails or contacting us directly. You will continue to receive non-marketing 
                  communications related to your orders and account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Cookies and Tracking</h3>
                <p className="text-slate-600 leading-relaxed">
                  You can control cookies through your browser settings. However, disabling cookies may 
                  affect the functionality of our website and your shopping experience.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">Data Security</h2>
            
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                These measures include:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">Contact Us</h2>
            
            <div className="bg-slate-50 rounded-lg p-6 mt-8">
              <p className="text-slate-600 mb-4">
                If you have any questions about this Privacy Policy or how we handle your personal information, 
                please contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Contact Privacy Team
                </Link>
              </div>
            </div>

            <div className="text-sm text-slate-500 mt-12 pt-6 border-t border-slate-200">
              <p>Last updated: December 21, 2025</p>
              <p className="mt-2">
                This privacy policy is effective immediately and governs our collection, use, and disclosure 
                of your personal information. We may update this policy from time to time, and any changes 
                will be posted on this page.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}