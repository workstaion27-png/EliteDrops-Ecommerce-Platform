'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Globe2, Lock, Gem, MessageCircle } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import TrustBadges from '@/components/TrustBadges'
import CountdownTimer from '@/components/CountdownTimer'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Mock data for featured products
      const mockFeaturedProducts: Product[] = [
        {
          id: '1',
          name: 'Luxury Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones',
          price: 299.99,
          compare_price: 399.99,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
          category: 'Electronics',
          inventory_count: 25,
          is_active: true,
          created_at: '2024-12-01T10:00:00Z',
          updated_at: '2024-12-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Elegant Smart Watch',
          description: 'Sophisticated smartwatch with health monitoring',
          price: 449.99,
          compare_price: 599.99,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
          category: 'Electronics',
          inventory_count: 18,
          is_active: true,
          created_at: '2024-12-02T10:00:00Z',
          updated_at: '2024-12-02T10:00:00Z'
        },
        {
          id: '3',
          name: 'Premium Leather Wallet',
          description: 'Handcrafted genuine leather wallet',
          price: 89.99,
          compare_price: 129.99,
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
          category: 'Accessories',
          inventory_count: 32,
          is_active: true,
          created_at: '2024-12-03T10:00:00Z',
          updated_at: '2024-12-03T10:00:00Z'
        },
        {
          id: '4',
          name: 'Luxury Home Fragrance',
          description: 'Premium scented candles',
          price: 45.99,
          compare_price: 65.99,
          images: ['https://images.unsplash.com/photo-1602874801000-b9263cfe1001?w=400'],
          category: 'Home',
          inventory_count: 41,
          is_active: true,
          created_at: '2024-12-04T10:00:00Z',
          updated_at: '2024-12-04T10:00:00Z'
        }
      ]
      
      setFeaturedProducts(mockFeaturedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: 'Luxury Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', count: 45, badge: 'Premium' },
    { name: 'Designer Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', count: 32, badge: 'Exclusive' },
    { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400', count: 28, badge: 'Handpicked' },
    { name: 'Fitness & Wellness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', count: 24, badge: 'Top Rated' },
  ]

  const features = [
    { icon: Globe2, title: 'Free Worldwide Shipping', description: 'All orders delivered free worldwide' },
    { icon: Lock, title: 'Secure & Protected', description: '256-bit SSL encryption' },
    { icon: Gem, title: 'Premium Quality', description: 'Curated luxury products' },
    { icon: MessageCircle, title: '24/7 Premium Support', description: 'Expert customer service' },
  ]

  // Special offer countdown - set to 7 days from now
  const specialOfferEnd = new Date()
  specialOfferEnd.setDate(specialOfferEnd.getDate() + 7)

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-luxury-black via-luxury-dark-gray to-luxury-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23C5A059\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-luxury-gold/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-luxury-gold/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 bg-luxury-gold/20 border border-luxury-gold/30 rounded-full mb-6">
                <span className="text-luxury-gold text-sm font-medium">✨ New Collection Just Arrived</span>
              </div>
              <h1 className="text-4
              
              xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Luxury Redefined<br />
                <span className="text-luxury-gold">Crafted for You</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                Discover an exclusive collection of premium products curated for the discerning customer. 
                Experience luxury without compromise with our worldwide shipping and lifetime quality guarantee.
              </p>
              
              {/* Special Offer Countdown */}
              <div className="mb-8">
                <CountdownTimer 
                  endDate={specialOfferEnd}
                  title="🎁 Holiday Special: 25% OFF Everything"
                  className="max-w-md"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-luxury-gold text-luxury-black font-bold rounded-lg hover:bg-luxury-light-gold transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Shop Premium Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/track-order"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-luxury-gold text-luxury-gold font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
                >
                  Track Your Order
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-luxury-gold/20">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-luxury-gold" />
                  <span className="text-sm text-gray-300">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-luxury-gold" />
                  <span className="text-sm text-gray-300">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="h-5 w-5 text-luxury-gold" />
                  <span className="text-sm text-gray-300">Money Back</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Video placeholder */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 rounded-2xl border border-luxury-gold/30 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">✨</span>
                    </div>
                    <p className="text-luxury-gold font-medium">Premium Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-luxury-gold/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-luxury-gold" />
                </div>
                <h3 className="font-semibold text-luxury-black">{feature.title}</h3>
                <p className="text-sm text-luxury-dark-gray">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-luxury-light-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-luxury-black">Curated Collections</h2>
              <p className="text-luxury-dark-gray mt-2">Handpicked premium products for the discerning customer</p>
            </div>
            <Link href="/categories" className="text-luxury-gold font-medium hover:text-luxury-dark-gold transition-colors">
              View All Collections →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 to-transparent" />
                
                {/* Badge */}
                {category.badge && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-luxury-gold text-luxury-black text-xs font-bold rounded-full">
                    {category.badge}
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-white/90">{category.count} curated items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-luxury-black">Trending Now</h2>
              <p className="text-luxury-dark-gray mt-2">Customer favorites and bestsellers</p>
            </div>
            <Link href="/products" className="text-luxury-gold font-medium hover:text-luxury-dark-gold transition-colors">
              View All Products →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-luxury-black to-luxury-dark-gray text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience Luxury Today</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust LuxuryHub for premium products and exceptional service. 
            Your satisfaction is our guarantee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-luxury-gold text-luxury-black font-bold rounded-lg hover:bg-luxury-light-gold transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/track-order"
              className="inline-flex items-center px-8 py-4 border-2 border-luxury-gold text-luxury-gold font-semibold rounded-lg hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
            >
              Track Your Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
