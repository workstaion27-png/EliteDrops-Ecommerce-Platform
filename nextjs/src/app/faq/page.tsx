import Link from 'next/link'
import { ArrowLeft, HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Shipping times vary by location and shipping method. Standard shipping takes 7-15 business days, Express shipping takes 5-10 business days, and Priority shipping takes 3-7 business days."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all items in original condition with tags attached. Custom or personalized items are non-returnable unless defective."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship worldwide! International shipping costs are calculated based on destination and weight. Customers are responsible for customs duties and taxes."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order using the tracking number provided in your shipping confirmation email, or by using our Track Order page with your order number."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and other secure payment methods for your convenience."
    },
    {
      question: "Are your products authentic?",
      answer: "Yes, all our products are 100% authentic. We work directly with premium manufacturers and trusted suppliers to ensure quality and authenticity."
    },
    {
      question: "How do I contact customer service?",
      answer: "You can reach our customer service team via email at support@luxuryhub.com, phone at +1 (555) 123-4567, or through our contact page. We're available 24/7."
    },
    {
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled within 24 hours of placement, before they are processed for shipping. Please contact customer service immediately if you need to cancel."
    }
  ]

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
            <HelpCircle className="h-8 w-8 text-luxury-gold" />
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600">
            Find answers to common questions about LuxuryHub shopping, shipping, returns, and more.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-luxury-gold rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-white/90 mb-6">
            Our customer service team is here to help you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@luxuryhub.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-luxury-gold font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Email Support
            </a>
            <a
              href="tel:+15551234567"
              className="inline-flex items-center justify-center px-6 py-3 bg-luxury-dark-gold text-white font-semibold rounded-lg hover:bg-luxury-dark-gold/90 transition-colors"
            >
              Call Us: +1 (555) 123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
