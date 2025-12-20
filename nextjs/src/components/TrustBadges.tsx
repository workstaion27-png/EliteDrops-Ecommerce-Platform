'use client'

import { Shield, Truck, CreditCard, RotateCcw, Phone, Award } from 'lucide-react'

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "256-bit SSL encryption protects your data",
      color: "text-green-600"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $50 worldwide",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "PayPal & credit cards accepted",
      color: "text-purple-600"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day hassle-free returns",
      color: "text-orange-600"
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Expert customer service",
      color: "text-indigo-600"
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Curated luxury products",
      color: "text-luxury-gold"
    }
  ]

  return (
    <div className="bg-white border-y border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Choose LuxuryHub?</h2>
          <p className="text-gray-600">Trusted by thousands of customers worldwide</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="text-center group">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${badge.color}`}>
                <badge.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{badge.title}</h3>
              <p className="text-xs text-gray-600 leading-tight">{badge.description}</p>
            </div>
          ))}
        </div>
        
        {/* Payment Security Logos */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">SSL Secured</span>
              </div>
              <div className="text-xs text-gray-600">256-bit encryption</div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">Accepted payments:</div>
              <div className="flex gap-2">
                <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">VISA</div>
                <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">MC</div>
                <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">PayPal</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-600">Money-back guarantee</div>
              <div className="text-sm font-semibold text-green-600">100% Secure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}