'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, User, Menu, X, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const getItemCount = useCartStore((state) => state.getItemCount)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const itemCount = mounted ? getItemCount() : 0

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-luxury-gold to-luxury-dark-gold rounded-xl flex items-center justify-center shadow-xl">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-luxury-black tracking-tight">LuxuryHub</span>
              <span className="text-xs text-luxury-gold font-medium tracking-widest uppercase">Premium Collection</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-600 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-slate-600 hover:text-primary-600 transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-slate-600 hover:text-primary-600 transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-primary-600 transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-600 hover:text-primary-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <Link href="/account" className="p-2 text-slate-600 hover:text-primary-600 transition-colors">
              <User className="h-5 w-5" />
            </Link>
            
            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-primary-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-slate-600 hover:text-primary-600">Home</Link>
              <Link href="/products" className="text-slate-600 hover:text-primary-600">Products</Link>
              <Link href="/categories" className="text-slate-600 hover:text-primary-600">Categories</Link>
              <Link href="/about" className="text-slate-600 hover:text-primary-600">About</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
