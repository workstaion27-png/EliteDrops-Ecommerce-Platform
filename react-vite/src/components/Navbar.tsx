import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const itemCount = getItemCount()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-sky-600" />
            <span className="text-xl font-bold text-slate-900">EliteDrops</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-sky-600 transition-colors">Home</Link>
            <Link to="/products" className="text-slate-600 hover:text-sky-600 transition-colors">Products</Link>
            <Link to="/categories" className="text-slate-600 hover:text-sky-600 transition-colors">Categories</Link>
            <Link to="/about" className="text-slate-600 hover:text-sky-600 transition-colors">About</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/account" className="p-2 text-slate-600 hover:text-sky-600 transition-colors">
              <User className="h-5 w-5" />
            </Link>
            
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-sky-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-sky-600 rounded-full">
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
              <Link to="/" className="text-slate-600 hover:text-sky-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/products" className="text-slate-600 hover:text-sky-600" onClick={() => setIsMenuOpen(false)}>Products</Link>
              <Link to="/categories" className="text-slate-600 hover:text-sky-600" onClick={() => setIsMenuOpen(false)}>Categories</Link>
              <Link to="/about" className="text-slate-600 hover:text-sky-600" onClick={() => setIsMenuOpen(false)}>About</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
