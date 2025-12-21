'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const categories = ['All', 'Electronics', 'Accessories', 'Home', 'Fitness']

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Luxury Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones with exceptional sound quality and comfort.',
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
          description: 'Sophisticated smartwatch with health monitoring and elegant design.',
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
          description: 'Handcrafted genuine leather wallet with multiple card slots and RFID protection.',
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
          description: 'Premium scented candles with long-lasting fragrance and elegant packaging.',
          price: 45.99,
          compare_price: 65.99,
          images: ['https://images.unsplash.com/photo-1602874801000-b9263cfe1001?w=400'],
          category: 'Home',
          inventory_count: 41,
          is_active: true,
          created_at: '2024-12-04T10:00:00Z',
          updated_at: '2024-12-04T10:00:00Z'
        },
        {
          id: '5',
          name: 'Premium Yoga Mat',
          description: 'Eco-friendly premium yoga mat with superior grip and cushioning.',
          price: 79.99,
          compare_price: 99.99,
          images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'],
          category: 'Fitness',
          inventory_count: 28,
          is_active: true,
          created_at: '2024-12-05T10:00:00Z',
          updated_at: '2024-12-05T10:00:00Z'
        },
        {
          id: '6',
          name: 'Wireless Phone Charger',
          description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
          price: 34.99,
          compare_price: 49.99,
          images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400'],
          category: 'Electronics',
          inventory_count: 55,
          is_active: true,
          created_at: '2024-12-06T10:00:00Z',
          updated_at: '2024-12-06T10:00:00Z'
        },
        {
          id: '7',
          name: 'Designer Sunglasses',
          description: 'UV400 protection designer sunglasses with premium frames and polarized lenses.',
          price: 189.99,
          compare_price: 249.99,
          images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'],
          category: 'Accessories',
          inventory_count: 15,
          is_active: true,
          created_at: '2024-12-07T10:00:00Z',
          updated_at: '2024-12-07T10:00:00Z'
        },
        {
          id: '8',
          name: 'Premium Coffee Grinder',
          description: 'Precision coffee grinder with multiple grind settings for perfect brewing.',
          price: 159.99,
          compare_price: 199.99,
          images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'],
          category: 'Home',
          inventory_count: 22,
          is_active: true,
          created_at: '2024-12-08T10:00:00Z',
          updated_at: '2024-12-08T10:00:00Z'
        }
      ]
      
      let products = mockProducts

      if (selectedCategory && selectedCategory !== 'All') {
        products = products.filter(product => product.category === selectedCategory)
      }

      switch (sortBy) {
        case 'price-low':
          products = products.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          products = products.sort((a, b) => b.price - a.price)
          break
        case 'name':
          products = products.sort((a, b) => a.name.localeCompare(b.name))
          break
        default:
          products = products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }

      setProducts(products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">All Products</h1>
          <p className="text-slate-600">Discover our curated collection of premium products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-600 mb-6">
          Showing {filteredProducts.length} products
        </p>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
