#!/usr/bin/env python3
"""
Add sample products to Supabase database
"""

import asyncio
import aiohttp

async def add_products_to_supabase():
    """Add sample products to Supabase"""
    
    # Supabase configuration
    SUPABASE_URL = "https://niodbejcakihgjdptgyw.supabase.co"
    SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2RiZWpjYWtpaGdqZHB0Z3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzM0NzU0MiwiZXhwIjoyMDUyOTIzNTQyfQ.LLz5vR_N5l8uVxT_1VZQ5s4c8K3qJD8nXlL1tQqQYzE"
    
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # Sample products data
    products = [
        {
            "name": "Luxury Wireless Headphones",
            "description": "Premium noise-cancelling wireless headphones with exceptional sound quality and comfort. Features advanced active noise cancellation, 30-hour battery life, and premium materials.",
            "price": 299.99,
            "compare_price": 399.99,
            "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
            "category": "Electronics",
            "inventory_count": 25,
            "is_active": True
        },
        {
            "name": "Elegant Smart Watch",
            "description": "Sophisticated smartwatch with health monitoring and elegant design. Track your fitness, monitor heart rate, and stay connected with style.",
            "price": 449.99,
            "compare_price": 599.99,
            "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
            "category": "Electronics",
            "inventory_count": 18,
            "is_active": True
        },
        {
            "name": "Premium Leather Wallet",
            "description": "Handcrafted genuine leather wallet with multiple card slots and RFID protection. Made from premium Italian leather.",
            "price": 89.99,
            "compare_price": 129.99,
            "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
            "category": "Accessories",
            "inventory_count": 32,
            "is_active": True
        },
        {
            "name": "Luxury Home Fragrance",
            "description": "Premium scented candles with long-lasting fragrance and elegant packaging. Hand-poured with natural wax.",
            "price": 45.99,
            "compare_price": 65.99,
            "images": ["https://images.unsplash.com/photo-1602874801000-b9263cfe1001?w=800"],
            "category": "Home",
            "inventory_count": 41,
            "is_active": True
        },
        {
            "name": "Premium Yoga Mat",
            "description": "Eco-friendly premium yoga mat with superior grip and cushioning. Made from natural rubber and cork.",
            "price": 79.99,
            "compare_price": 99.99,
            "images": ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"],
            "category": "Fitness",
            "inventory_count": 28,
            "is_active": True
        },
        {
            "name": "Wireless Phone Charger",
            "description": "Fast wireless charging pad compatible with all Qi-enabled devices. Features sleek design and fast charging.",
            "price": 34.99,
            "compare_price": 49.99,
            "images": ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800"],
            "category": "Electronics",
            "inventory_count": 55,
            "is_active": True
        },
        {
            "name": "Designer Sunglasses",
            "description": "UV400 protection designer sunglasses with premium frames and polarized lenses. Handcrafted acetate frames.",
            "price": 189.99,
            "compare_price": 249.99,
            "images": ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"],
            "category": "Accessories",
            "inventory_count": 15,
            "is_active": True
        },
        {
            "name": "Premium Coffee Grinder",
            "description": "Precision coffee grinder with multiple grind settings for perfect brewing. Burr grinder with 40mm stainless steel burrs.",
            "price": 159.99,
            "compare_price": 199.99,
            "images": ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"],
            "category": "Home",
            "inventory_count": 22,
            "is_active": True
        }
    ]
    
    async with aiohttp.ClientSession() as session:
        added_count = 0
        errors = []
        
        for product in products:
            try:
                async with session.post(
                    f"{SUPABASE_URL}/rest/v1/products",
                    headers=headers,
                    json=product
                ) as response:
                    if response.status in [200, 201]:
                        added_count += 1
                        print(f"✅ Added: {product['name']}")
                    else:
                        error_text = await response.text()
                        errors.append(f"❌ {product['name']}: {error_text}")
                        print(f"❌ Failed to add {product['name']}: {error_text}")
            except Exception as e:
                errors.append(f"❌ {product['name']}: {str(e)}")
                print(f"❌ Error adding {product['name']}: {e}")
        
        print(f"\n{'='*50}")
        print(f"Summary: {added_count} products added successfully")
        if errors:
            print(f"Errors: {len(errors)}")
            for error in errors[:3]:
                print(f"  {error}")

if __name__ == "__main__":
    asyncio.run(add_products_to_supabase())
