import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function CategoriesPage() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('products').select('category').eq('is_active', true)
      if (data) {
        const counts = data.reduce((acc: Record<string, number>, item) => {
          const cat = item.category || 'Other'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {})
        setCategoryCounts(counts)
      }
    }
    fetchCategories()
  }, [])

  const categories = [
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600', description: 'Gadgets, accessories, and tech essentials' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', description: 'Wallets, bags, and everyday carry items' },
    { name: 'Home', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600', description: 'Decor, lighting, and home essentials' },
    { name: 'Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600', description: 'Workout gear and fitness equipment' },
  ]

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Shop by Category</h1>
          <p className="text-slate-600">Browse our curated collections</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link key={category.name} to={`/products?category=${category.name}`} className="group relative rounded-2xl overflow-hidden aspect-[16/9]">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                <p className="text-white/80 mb-2">{category.description}</p>
                <span className="text-sm text-white/60">{categoryCounts[category.name] || 0} products</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
