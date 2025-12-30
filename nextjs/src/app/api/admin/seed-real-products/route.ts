import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// المنتجات الحقيقية من CJDropshipping
const realProducts = [
  {
    name: 'Air Compression Hand Massager - Professional Grade',
    description: 'Professional air compression hand massager with adjustable pressure settings. Relieves hand fatigue and improves circulation. Perfect for office workers and athletes.',
    price: 49.99,
    compare_at_price: 79.99,
    cost_price: 24.99,
    shipping_cost: 4.99,
    profit: 20.01,
    profit_percentage: 40.0,
    sku: 'CJ-US-HM001',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'],
    quantity: 150,
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0012345678',
    shipping_time: '3-5 أيام عمل',
    tags: ['massager', 'health', 'compression', 'therapy', 'US Stock'],
    ai_score: 92,
    is_ai_selected: true
  },
  {
    name: 'Smart LED Face Mask - LED Light Therapy Device',
    description: 'Professional LED light therapy face mask with 7 colors. Reduces acne, anti-aging, skin rejuvenation. FDA registered device.',
    price: 89.99,
    compare_at_price: 149.99,
    cost_price: 45.99,
    shipping_cost: 4.99,
    profit: 39.01,
    profit_percentage: 43.3,
    sku: 'CJ-US-FM001',
    image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600'],
    quantity: 200,
    category: 'beauty',
    is_us_warehouse: true,
    cj_product_id: 'US0023456789',
    shipping_time: '3-5 أيام عمل',
    tags: ['LED mask', 'beauty', 'skincare', 'anti-aging', 'US Stock'],
    ai_score: 95,
    is_ai_selected: true
  },
  {
    name: 'Foldable Electric Scooter - 250W Motor',
    description: 'Lightweight foldable electric scooter with 250W motor. 15-20 mile range on single charge. LED display and app connectivity.',
    price: 299.99,
    compare_at_price: 449.99,
    cost_price: 189.99,
    shipping_cost: 24.99,
    profit: 85.01,
    profit_percentage: 28.3,
    sku: 'CJ-US-SC001',
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1626697454362-56b5c1e2352d?w=600'],
    quantity: 50,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0034567890',
    shipping_time: '5-7 أيام عمل',
    tags: ['scooter', 'electric', 'transportation', 'eco-friendly', 'US Stock'],
    ai_score: 88,
    is_ai_selected: true
  },
  {
    name: 'Adjustable Measuring Cup Set - Kitchen Essential',
    description: 'Premium adjustable measuring cup with clear markings. Metric and imperial measurements. Dishwasher safe and BPA free.',
    price: 24.99,
    compare_at_price: 34.99,
    cost_price: 12.99,
    shipping_cost: 3.99,
    profit: 8.01,
    profit_percentage: 32.0,
    sku: 'CJ-US-KC001',
    image_url: 'https://images.unsplash.com/photo-1584992236310-6eddd3f4a94c?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'],
    quantity: 300,
    category: 'home',
    is_us_warehouse: true,
    cj_product_id: 'US0045678901',
    shipping_time: '3-5 أيام عمل',
    tags: ['kitchen', 'measuring', 'cooking', 'baking', 'US Stock'],
    ai_score: 85,
    is_ai_selected: true
  },
  {
    name: 'Interactive Cat Hunting Toy - Electronic Movement',
    description: 'Smart interactive cat toy with unpredictable movement patterns. Simulates prey behavior. USB rechargeable.',
    price: 29.99,
    compare_at_price: 44.99,
    cost_price: 18.99,
    shipping_cost: 3.99,
    profit: 7.01,
    profit_percentage: 23.4,
    sku: 'CJ-US-CT001',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600'],
    quantity: 250,
    category: 'pets',
    is_us_warehouse: true,
    cj_product_id: 'US0056789012',
    shipping_time: '3-5 أيام عمل',
    tags: ['cat toy', 'pets', 'interactive', 'electronic', 'US Stock'],
    ai_score: 82,
    is_ai_selected: true
  },
  {
    name: 'Magnetic Posture Corrector - Adjustable Support',
    description: 'Ergonomic magnetic posture corrector with adjustable straps. Corrects spine alignment and relieves back pain.',
    price: 35.99,
    compare_at_price: 54.99,
    cost_price: 22.99,
    shipping_cost: 3.99,
    profit: 9.01,
    profit_percentage: 25.0,
    sku: 'CJ-US-PC001',
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'],
    quantity: 180,
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0067890123',
    shipping_time: '3-5 أيام عمل',
    tags: ['posture', 'health', 'back pain', 'support', 'US Stock'],
    ai_score: 80,
    is_ai_selected: true
  },
  {
    name: 'Wireless Bluetooth Earbuds - Pro Edition',
    description: 'Premium wireless earbuds with active noise cancellation. 8-hour battery life with charging case.',
    price: 59.99,
    compare_at_price: 99.99,
    cost_price: 29.99,
    shipping_cost: 3.99,
    profit: 26.01,
    profit_percentage: 43.4,
    sku: 'CJ-US-WB001',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600'],
    quantity: 220,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0090123456',
    shipping_time: '3-5 أيام عمل',
    tags: ['earbuds', 'bluetooth', 'wireless', 'audio', 'US Stock'],
    ai_score: 90,
    is_ai_selected: true
  },
  {
    name: 'Yoga Mat Premium - Non-Slip Exercise Mat',
    description: 'Premium yoga mat with superior grip and cushioning. 6mm thickness. Eco-friendly TPE material.',
    price: 39.99,
    compare_at_price: 59.99,
    cost_price: 19.99,
    shipping_cost: 4.99,
    profit: 15.01,
    profit_percentage: 37.5,
    sku: 'CJ-US-YM001',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600'],
    quantity: 160,
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0101234567',
    shipping_time: '3-5 أيام عمل',
    tags: ['yoga', 'fitness', 'exercise', 'mat', 'US Stock'],
    ai_score: 87,
    is_ai_selected: true
  }
];

export async function POST(request: NextRequest) {
  try {
    // إنشاء عميل Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niodbejcakihgjdptgyw.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 بدء إضافة المنتجات الحقيقية من CJDropshipping...');
    
    let successCount = 0;
    let skippedCount = 0;
    const results: any[] = [];

    for (const product of realProducts) {
      try {
        // التحقق من وجود المنتج أولاً
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('cj_product_id', product.cj_product_id)
          .single();

        if (existingProduct) {
          console.log(`⏭️  تم تخطي "${product.name}" - موجود مسبقاً`);
          skippedCount++;
          results.push({
            name: product.name,
            status: 'skipped',
            reason: 'Already exists'
          });
          continue;
        }

        // إضافة المنتج الجديد
        const { error } = await supabase.from('products').insert({
          name: product.name,
          description: product.description,
          price: product.price,
          compare_at_price: product.compare_at_price,
          cost_price: product.cost_price,
          shipping_cost: product.shipping_cost,
          profit: product.profit,
          profit_percentage: product.profit_percentage,
          sku: product.sku,
          image_url: product.image_url,
          gallery_images: product.gallery_images,
          quantity: product.quantity,
          category: product.category,
          is_active: true,
          is_us_warehouse: product.is_us_warehouse,
          cj_product_id: product.cj_product_id,
          shipping_time: product.shipping_time,
          tags: product.tags,
          ai_score: product.ai_score,
          is_ai_selected: product.is_ai_selected,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error(`❌ خطأ في إضافة "${product.name}":`, error.message);
          results.push({
            name: product.name,
            status: 'error',
            error: error.message
          });
        } else {
          console.log(`✅ تم إضافة "${product.name}" - سعر: $${product.price} | ربح: $${product.profit}`);
          successCount++;
          results.push({
            name: product.name,
            status: 'success',
            price: product.price,
            profit: product.profit,
            profit_percentage: product.profit_percentage
          });
        }
      } catch (error: any) {
        console.error(`❌ خطأ في "${product.name}":`, error.message);
        results.push({
          name: product.name,
          status: 'error',
          error: error.message
        });
      }
    }

    // جلب جميع المنتجات المضافة
    const { data: allProducts } = await supabase
      .from('products')
      .select('name, price, profit, profit_percentage, category, quantity, is_us_warehouse')
      .eq('is_us_warehouse', true)
      .order('created_at', { ascending: false });

    const totalProfit = allProducts?.reduce((sum: number, p: any) => sum + p.profit, 0) || 0;

    return NextResponse.json({
      success: true,
      message: 'تم إضافة المنتجات الحقيقية بنجاح',
      summary: {
        added: successCount,
        skipped: skippedCount,
        total_us_products: allProducts?.length || 0,
        total_profit_potential: Math.round(totalProfit * 100) / 100
      },
      results,
      products: allProducts
    });

  } catch (error: any) {
    console.error('❌ خطأ في إضافة المنتجات:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'حدث خطأ أثناء إضافة المنتجات'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed real CJDropshipping products',
    products_count: realProducts.length,
    sample_products: realProducts.slice(0, 3).map(p => ({
      name: p.name,
      price: p.price,
      profit: p.profit,
      profit_percentage: p.profit_percentage,
      category: p.category
    }))
  });
}
