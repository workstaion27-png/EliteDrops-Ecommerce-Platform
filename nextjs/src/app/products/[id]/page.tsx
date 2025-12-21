'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Gem, Heart, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'
import ProductReviews from '@/components/ProductReviews'
import CountdownTimer from '@/components/CountdownTimer'
import TrustBadges from '@/components/TrustBadges'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [reviews, setReviews] = useState([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent quality and fast delivery. Very satisfied with this purchase!',
      date: '2024-12-15',
      verified: true,
      helpful: 12
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      rating: 4,
      comment: 'Good product overall, though delivery took a bit longer than expected.',
      date: '2024-12-10',
      verified: true,
      helpful: 8
    },
    {
      id: '3',
      customerName: 'Emma Wilson',
      rating: 5,
      comment: 'Amazing quality! Will definitely buy again.',
      date: '2024-12-08',
      verified: true,
      helpful: 15
    }
  ])
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      // Mock data for products
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Luxury Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones with exceptional sound quality and comfort. Features advanced active noise cancellation, 30-hour battery life, and premium materials for long-lasting comfort.',
          price: 299.99,
          compare_price: 399.99,
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'
          ],
          category: 'Electronics',
          inventory_count: 25,
          is_active: true,
          created_at: '2024-12-01T10:00:00Z',
          updated_at: '2024-12-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Elegant Smart Watch',
          description: 'Sophisticated smartwatch with health monitoring and elegant design. Track your fitness, monitor heart rate, and stay connected with style.',
          price: 449.99,
          compare_price: 599.99,
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'
          ],
          category: 'Electronics',
          inventory_count: 18,
          is_active: true,
          created_at: '2024-12-02T10:00:00Z',
          updated_at: '2024-12-02T10:00:00Z'
        },
        {
          id: '3',
          name: 'Premium Leather Wallet',
          description: 'Handcrafted genuine leather wallet with multiple card slots and RFID protection. Made from premium Italian leather with elegant design.',
          price: 89.99,
          compare_price: 129.99,
          images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'
          ],
          category: 'Accessories',
          inventory_count: 32,
          is_active: true,
          created_at: '2024-12-03T10:00:00Z',
          updated_at: '2024-12-03T10:00:00Z'
        },
        {
          id: '4',
          name: 'Luxury Home Fragrance',
          description: 'Premium scented candles with long-lasting fragrance and elegant packaging. Hand-poured with natural wax and premium fragrances.',
          price: 45.99,
          compare_price: 65.99,
          images: [
            'https://images.unsplash.com/photo-1602874801000-b9263cfe1001?w=800',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'
          ],
          category: 'Home',
          inventory_count: 41,
          is_active: true,
          created_at: '2024-12-04T10:00:00Z',
          updated_at: '2024-12-04T10:00:00Z'
        },
        {
          id: '5',
          name: 'Premium Yoga Mat',
          description: 'Eco-friendly premium yoga mat with superior grip and cushioning. Made from natural rubber and cork for the ultimate yoga experience.',
          price: 79.99,
          compare_price: 99.99,
          images: [
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
            'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800'
          ],
          category: 'Fitness',
          inventory_count: 28,
          is_active: true,
          created_at: '2024-12-05T10:00:00Z',
          updated_at: '2024-12-05T10:00:00Z'
        },
        {
          id: '6',
          name: 'Wireless Phone Charger',
          description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Features sleek design and fast charging technology.',
          price: 34.99,
          compare_price: 49.99,
          images: [
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800'
          ],
          category: 'Electronics',
          inventory_count: 55,
          is_active: true,
          created_at: '2024-12-06T10:00:00Z',
          updated_at: '2024-12-06T10:00:00Z'
        },
        {
          id: '7',
          name: 'Designer Sunglasses',
          description: 'UV400 protection designer sunglasses with premium frames and polarized lenses. Handcrafted acetate frames with premium finishes.',
          price: 189.99,
          compare_price: 249.99,
          images: [
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'
          ],
          category: 'Accessories',
          inventory_count: 15,
          is_active: true,
          created_at: '2024-12-07T10:00:00Z',
          updated_at: '2024-12-07T10:00:00Z'
        },
        {
          id: '8',
          name: 'Premium Coffee Grinder',
          description: 'Precision coffee grinder with multiple grind settings for perfect brewing. Burr grinder with 40mm stainless steel burrs.',
          price: 159.99,
          compare_price: 199.99,
          images: [
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800'
          ],
          category: 'Home',
          inventory_count: 22,
          is_active: true,
          created_at: '2024-12-08T10:00:00Z',
          updated_at: '2024-12-08T10:00:00Z'
        }
      ]
      
      const product = mockProducts.find(p => p.id === id)
      setProduct(product || null)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewReview = (newReview: Omit<any, 'id' | 'date' | 'helpful'>) => {
    const review = {
      ...newReview,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    }
    setReviews(prev => [review, ...prev])
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0
  const totalReviews = reviews.length

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-200 rounded-xl animate-pulse aspect-square" />
            <div className="space-y-4">
              <div className="bg-slate-200 h-8 rounded animate-pulse" />
              <div className="bg-slate-200 h-6 rounded animate-pulse w-1/2" />
              <div className="bg-slate-200 h-24 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h2>
          <Link href="/products" className="text-primary-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/products" className="inline-flex items-center text-slate-600 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl overflow-hidden aspect-square">
              <img
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-primary-600 font-medium">{product.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
              {product.compare_price && (
                <>
                  <span className="text-xl text-slate-400 line-through">${product.compare_price.toFixed(2)}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Countdown Timer - Show when there's a discount */}
            {product.compare_price && (
              <div className="mb-6">
                <CountdownTimer 
                  endDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} 
                  title="Limited Time Offer" 
                />
              </div>
            )}

            <p className="text-slate-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Customer Reviews */}
            <div className="mb-8">
              <ProductReviews 
                productId={product.id}
                reviews={reviews}
                averageRating={averageRating}
                totalReviews={totalReviews}
                onNewReview={handleNewReview}
              />
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-slate-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-500">{product.inventory_count} in stock</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <Gem className="h-5 w-5" />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Heart className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mb-6">
              <TrustBadges />
            </div>

            {/* Features */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Truck className="h-5 w-5 text-primary-600" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Shield className="h-5 w-5 text-primary-600" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
