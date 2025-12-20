import Link from 'next/link'
import { Package, Users, Award, Globe } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About LuxuryHub</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Curating luxury lifestyle products with uncompromising quality and exceptional service, delivered to your doorstep worldwide.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Our Story</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            LuxuryHub was born from a vision to democratize luxury lifestyle products without compromising on 
            quality or authenticity. We meticulously curate each item in our collection, working directly with 
            premium manufacturers and trusted suppliers to ensure every product meets our exacting standards.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Our commitment goes beyond just selling products – we're building lasting relationships with our customers. 
            Every order is personally overseen by our quality team, and our customer success specialists work around 
            the clock to ensure your shopping experience exceeds expectations. When you choose LuxuryHub, you're 
            not just making a purchase; you're joining a community that values quality, style, and exceptional service.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            We believe luxury should be accessible, transparent, and trustworthy. That's why we provide detailed 
            product information, authentic customer reviews, and a seamless order tracking experience. Your trust 
            is our greatest asset, and we work tirelessly to earn and maintain it with every interaction.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Curated Luxury</h3>
              <p className="text-slate-600 text-sm">
                Each product is hand-selected and undergoes rigorous quality inspection to meet luxury standards.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Client-Centric Service</h3>
              <p className="text-slate-600 text-sm">
                Dedicated support team ensuring personalized attention and complete satisfaction.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Exceptional Value</h3>
              <p className="text-slate-600 text-sm">
                Premium quality at fair prices, delivering unmatched value in every purchase.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Worldwide Excellence</h3>
              <p className="text-slate-600 text-sm">
                Seamless global delivery with full tracking and white-glove service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-primary-100 mb-8">
            Discover our curated luxury collection and experience the LuxuryHub standard of excellence.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  )
}
