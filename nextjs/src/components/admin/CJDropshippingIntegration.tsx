'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Download, 
  RefreshCw, 
  Package, 
  ExternalLink,
  Check,
  AlertCircle,
  Truck,
  DollarSign,
  TrendingUp
} from 'lucide-react'

interface CJProduct {
  productId: string
  productName: string
  productUrl: string
  price: number
  imageUrl: string
  category: string
}

interface ImportProductData {
  cjProductId: string
  productName: string
  price: number
  imageUrl: string
  category: string
}

export default function CJDropshippingIntegration() {
  const [activeTab, setActiveTab] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CJProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [importedProducts, setImportedProducts] = useState<ImportProductData[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/cj-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'categories' })
      })
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const searchProducts = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/products/cj-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'search',
          data: {
            query: searchQuery,
            category: selectedCategory,
            limit: 20
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.products || [])
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const importProduct = async (cjProductId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/products/cj-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'import',
          data: { cjProductId }
        })
      })
      const data = await response.json()
      if (data.success) {
        // Add to imported products list
        const product = searchResults.find(p => p.productId === cjProductId)
        if (product) {
          setImportedProducts(prev => [...prev, {
            cjProductId,
            productName: product.productName,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category
          }])
        }
        alert('Product imported successfully!')
      }
    } catch (error) {
      console.error('Error importing product:', error)
      alert('Failed to import product')
    } finally {
      setLoading(false)
    }
  }

  const syncProduct = async (cjProductId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/products/cj-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync',
          data: { cjProductId }
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Product synced successfully!')
      }
    } catch (error) {
      console.error('Error syncing product:', error)
      alert('Failed to sync product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">CJdropshipping Integration</h3>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Product Sourcing</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'search', label: 'Search Products', icon: Search },
            { id: 'imported', label: 'Imported Products', icon: Package },
            { id: 'sync', label: 'Sync Products', icon: RefreshCw }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter product name or keyword..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={searchProducts}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((product) => (
                  <div key={product.productId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.productName}
                      </h4>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-green-600">
                          ${product.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => importProduct(product.productId)}
                          disabled={loading}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Import
                        </button>
                        <button
                          onClick={() => window.open(product.productUrl, '_blank')}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'imported' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Recently Imported Products</h4>
            {importedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {importedProducts.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{product.productName}</h5>
                        <p className="text-sm text-green-600 font-medium">${product.price}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products imported yet</p>
                <p className="text-sm text-gray-400">Search and import products from CJdropshipping</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Sync Products</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Update product prices, inventory, and availability from CJdropshipping
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-lg font-bold text-gray-900">156</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Imported</p>
                    <p className="text-lg font-bold text-gray-900">24</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Need Sync</p>
                    <p className="text-lg font-bold text-gray-900">8</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sync Success</p>
                    <p className="text-lg font-bold text-gray-900">98%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync All Products
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Schedule Auto-Sync
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}