'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package, CheckCircle, XCircle, Image, DollarSign, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_price: number
  images: string[]
  category: string
  inventory_count: number
  is_active: boolean
}

export default function ProductManagement() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality noise-cancelling wireless headphones',
      price: 299.99,
      compare_price: 399.99,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
      category: 'Electronics',
      inventory_count: 25,
      is_active: true
    }
  ])
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    image: '',
    category: 'Electronics',
    inventory_count: '10'
  })

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      compare_price: parseFloat(formData.compare_price) || parseFloat(formData.price) * 1.2,
      images: [formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      category: formData.category,
      inventory_count: parseInt(formData.inventory_count),
      is_active: true
    }

    setProducts([...products, newProduct])
    resetForm()
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const handleToggleActive = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, is_active: !p.is_active } : p
    ))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      compare_price: '',
      image: '',
      category: 'Electronics',
      inventory_count: '10'
    })
    setShowAddForm(false)
    setEditingProduct(null)
  }

  const categories = ['Electronics', 'Accessories', 'Home', 'Fitness', 'Beauty', 'Clothing']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-luxury-gold text-white px-4 py-2 rounded-lg hover:bg-luxury-dark-gold"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Products</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${products.reduce((sum, p) => sum + p.price * p.inventory_count, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Tag className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Categories</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(products.map(p => p.category)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compare Price ($)</label>
                <input
                  type="number"
                  value={formData.compare_price}
                  onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.inventory_count}
                  onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-luxury-gold text-white py-3 rounded-lg hover:bg-luxury-dark-gold font-medium"
              >
                Add Product
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">${product.price}</p>
                      {product.compare_price > product.price && (
                        <p className="text-sm text-slate-400 line-through">${product.compare_price}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        product.inventory_count > 10 
                          ? 'bg-green-100 text-green-700' 
                          : product.inventory_count > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inventory_count} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          product.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.is_active ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
