'use client'

import { Product } from '@/types'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
  }

  const discount = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-600 hover:text-white"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-xs text-primary-600 font-medium mb-1">{product.category}</p>
          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
            {product.compare_price && (
              <span className="text-sm text-slate-400 line-through">${product.compare_price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
