// Simple local products data - Replace with your own products
// This file acts as your product database

export const LOCAL_PRODUCTS = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality noise-cancelling wireless headphones with 30-hour battery life. Premium sound quality and comfortable design.',
    price: 299.99,
    compare_price: 399.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'
    ],
    category: 'Electronics',
    inventory_count: 25,
    is_active: true
  },
  {
    id: '2',
    name: 'Elegant Smart Watch',
    description: 'Sophisticated smartwatch with health monitoring, fitness tracking, and elegant design that complements any outfit.',
    price: 449.99,
    compare_price: 599.99,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
    ],
    category: 'Electronics',
    inventory_count: 18,
    is_active: true
  },
  {
    id: '3',
    name: 'Luxury Leather Wallet',
    description: 'Handcrafted genuine leather wallet with RFID protection. Elegant design with multiple card slots.',
    price: 89.99,
    compare_price: 129.99,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'
    ],
    category: 'Accessories',
    inventory_count: 32,
    is_active: true
  },
  {
    id: '4',
    name: 'Aromatherapy Candle Set',
    description: 'Premium scented candles with natural wax and long-lasting fragrances. Perfect for home ambiance.',
    price: 45.99,
    compare_price: 65.99,
    images: [
      'https://images.unsplash.com/photo-1602874801000-b9263cfe1001?w=800'
    ],
    category: 'Home',
    inventory_count: 41,
    is_active: true
  },
  {
    id: '5',
    name: 'Premium Yoga Mat',
    description: 'Eco-friendly yoga mat with superior grip and cushioning. Non-slip surface for optimal performance.',
    price: 79.99,
    compare_price: 99.99,
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
    ],
    category: 'Fitness',
    inventory_count: 28,
    is_active: true
  },
  {
    id: '6',
    name: 'Wireless Fast Charger',
    description: 'Qi-compatible wireless charging pad with fast charging technology. Sleek design for any desk.',
    price: 34.99,
    compare_price: 49.99,
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'
    ],
    category: 'Electronics',
    inventory_count: 55,
    is_active: true
  },
  {
    id: '7',
    name: 'Designer Sunglasses',
    description: 'UV400 protection polarized lenses with premium acetate frames. Includes luxury case.',
    price: 189.99,
    compare_price: 249.99,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'
    ],
    category: 'Accessories',
    inventory_count: 15,
    is_active: true
  },
  {
    id: '8',
    name: 'Artisan Coffee Grinder',
    description: 'Precision burr grinder with 40mm conical burrs. 40 grind settings for perfect extraction.',
    price: 159.99,
    compare_price: 199.99,
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'
    ],
    category: 'Home',
    inventory_count: 22,
    is_active: true
  }
]

// Helper functions
export function getProductById(id: string) {
  return LOCAL_PRODUCTS.find(p => p.id === id)
}

export function getProductsByCategory(category: string) {
  if (category === 'All') return LOCAL_PRODUCTS
  return LOCAL_PRODUCTS.filter(p => p.category === category)
}

export function getAllCategories() {
  const categories = new Set(LOCAL_PRODUCTS.map(p => p.category))
  return ['All', ...Array.from(categories)]
}

export function searchProducts(query: string) {
  const lowerQuery = query.toLowerCase()
  return LOCAL_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  )
}
