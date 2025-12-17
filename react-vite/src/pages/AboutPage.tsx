import { Link } from 'react-router-dom'
import { Package, Users, Award, Globe } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen">
      <section className="bg-gradient-to-br from-sky-600 to-sky-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About EliteDrops</h1>
          <p className="text-xl text-sky-100 max-w-2xl mx-auto">Your trusted destination for premium products at unbeatable prices, shipped directly to your door.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Our Story</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">EliteDrops was founded with a simple mission: to bring premium products to customers worldwide without the premium price tag. By partnering with trusted suppliers through CJ Dropshipping, we are able to offer a curated selection of high-quality products at competitive prices.</p>
          <p className="text-lg text-slate-600 leading-relaxed">Our team works tirelessly to source the best products, ensure quality control, and provide exceptional customer service. We believe that everyone deserves access to great products, and we are committed to making that a reality.</p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center"><div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="h-8 w-8 text-sky-600" /></div><h3 className="font-semibold text-slate-900 mb-2">Quality Products</h3><p className="text-slate-600 text-sm">Every product is carefully selected and quality checked before listing.</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="h-8 w-8 text-sky-600" /></div><h3 className="font-semibold text-slate-900 mb-2">Customer First</h3><p className="text-slate-600 text-sm">Your satisfaction is our top priority with 24/7 support.</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4"><Award className="h-8 w-8 text-sky-600" /></div><h3 className="font-semibold text-slate-900 mb-2">Best Prices</h3><p className="text-slate-600 text-sm">Competitive pricing without compromising on quality.</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4"><Globe className="h-8 w-8 text-sky-600" /></div><h3 className="font-semibold text-slate-900 mb-2">Global Shipping</h3><p className="text-slate-600 text-sm">Fast and reliable shipping to customers worldwide.</p></div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-sky-100 mb-8">Explore our collection of premium products and experience the EliteDrops difference.</p>
          <Link to="/products" className="inline-flex items-center px-8 py-4 bg-white text-sky-600 font-semibold rounded-lg hover:bg-sky-50 transition-colors">Browse Products</Link>
        </div>
      </section>
    </div>
  )
}
