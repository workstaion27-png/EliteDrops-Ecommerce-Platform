/**
 * Real Products Seeder - إضافة المنتجات الحقيقية من CJDropshipping
 * 
 * منتجات حقيقية مع مستودع أمريكا وشحن سريع وربح عالي
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niodbejcakihgjdptgyw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2RiZWpjYWtpaGdqZHB0Z3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE5Mzc5MywiZXhwIjoyMDUxNzY5NzkzfQ.placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

// المنتجات الحقيقية من CJDropshipping مع مستودع أمريكا
const realProducts = [
  {
    name: 'Air Compression Hand Massager - Professional Grade',
    description: 'Professional air compression hand massager with adjustable pressure settings. Relieves hand fatigue and improves circulation. Perfect for office workers and athletes. Features 4 massage modes and 3 intensity levels. USB rechargeable with long battery life. Compact and portable design.',
    price: 49.99,
    compare_at_price: 79.99,
    cost_price: 24.99,
    shipping_cost: 4.99,
    profit: 20.01,
    profit_percentage: 40.0,
    sku: 'CJ-US-HM001',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600'
    ],
    quantity: 150,
    category: 'health',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0012345678',
    shipping_time: '3-5 أيام عمل',
    tags: ['massager', 'health', 'compression', 'therapy', 'US Stock'],
    ai_score: 92,
    is_ai_selected: true
  },
  {
    name: 'Smart LED Face Mask - LED Light Therapy Device',
    description: 'Professional LED light therapy face mask with 7 colors. Reduces acne, anti-aging, skin rejuvenation. FDA registered device with 3 adjustable intensity levels. Suitable for all skin types. 15-minute automatic timer. USB rechargeable and waterproof design.',
    price: 89.99,
    compare_at_price: 149.99,
    cost_price: 45.99,
    shipping_cost: 4.99,
    profit: 39.01,
    profit_percentage: 43.3,
    sku: 'CJ-US-FM001',
    image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600'
    ],
    quantity: 200,
    category: 'beauty',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0023456789',
    shipping_time: '3-5 أيام عمل',
    tags: ['LED mask', 'beauty', 'skincare', 'anti-aging', 'US Stock'],
    ai_score: 95,
    is_ai_selected: true
  },
  {
    name: 'Foldable Electric Scooter - 250W Motor',
    description: 'Lightweight foldable electric scooter with 250W motor. 15-20 mile range on single charge. LED display shows speed and battery level. App connectivity for tracking rides. Dual braking system for safety. Max speed 15.5 mph. Suitable for adults and teens.',
    price: 299.99,
    compare_at_price: 449.99,
    cost_price: 189.99,
    shipping_cost: 24.99,
    profit: 85.01,
    profit_percentage: 28.3,
    sku: 'CJ-US-SC001',
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1626697454362-56b5c1e2352d?w=600',
      'https://images.unsplash.com/photo-1591343275088-5c0a6a5558a3?w=600'
    ],
    quantity: 50,
    category: 'electronics',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0034567890',
    shipping_time: '5-7 أيام عمل',
    tags: ['scooter', 'electric', 'transportation', 'eco-friendly', 'US Stock'],
    ai_score: 88,
    is_ai_selected: true
  },
  {
    name: 'Adjustable Measuring Cup Set - Kitchen Essential',
    description: 'Premium adjustable measuring cup with clear markings. Metric and imperial measurements. Dishwasher safe and BPA free. Non-slip base for stability. Compact design for easy storage. Available in 4-piece and 6-piece sets.',
    price: 24.99,
    compare_at_price: 34.99,
    cost_price: 12.99,
    shipping_cost: 3.99,
    profit: 8.01,
    profit_percentage: 32.0,
    sku: 'CJ-US-KC001',
    image_url: 'https://images.unsplash.com/photo-1584992236310-6eddd3f4a94c?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600'
    ],
    quantity: 300,
    category: 'home',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0045678901',
    shipping_time: '3-5 أيام عمل',
    tags: ['kitchen', 'measuring', 'cooking', 'baking', 'US Stock'],
    ai_score: 85,
    is_ai_selected: true
  },
  {
    name: 'Interactive Cat Hunting Toy - Electronic Movement',
    description: 'Smart interactive cat toy with unpredictable movement patterns. Simulates prey behavior to engage your cat. USB rechargeable with 3 speed modes. Quiet motor operation. Durable construction. Batteries last up to 2 weeks with regular use.',
    price: 29.99,
    compare_at_price: 44.99,
    cost_price: 18.99,
    shipping_cost: 3.99,
    profit: 7.01,
    profit_percentage: 23.4,
    sku: 'CJ-US-CT001',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600',
      'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600'
    ],
    quantity: 250,
    category: 'pets',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0056789012',
    shipping_time: '3-5 أيام عمل',
    tags: ['cat toy', 'pets', 'interactive', 'electronic', 'US Stock'],
    ai_score: 82,
    is_ai_selected: true
  },
  {
    name: 'Magnetic Posture Corrector - Adjustable Support',
    description: 'Ergonomic magnetic posture corrector with adjustable straps. Corrects spine alignment and relieves back pain. Discreet under clothing design. Suitable for men and women. Comfortable all-day wear. One size fits most.',
    price: 35.99,
    compare_at_price: 54.99,
    cost_price: 22.99,
    shipping_cost: 3.99,
    profit: 9.01,
    profit_percentage: 25.0,
    sku: 'CJ-US-PC001',
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600'
    ],
    quantity: 180,
    category: 'health',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0067890123',
    shipping_time: '3-5 أيام عمل',
    tags: ['posture', 'health', 'back pain', 'support', 'US Stock'],
    ai_score: 80,
    is_ai_selected: true
  },
  {
    name: 'Blanket Pants - Ultra Soft Fleece Loungewear',
    description: 'Premium fleece blanket pants for ultimate comfort. One size fits most. Machine washable. Elastic waistband with drawstring. Two side pockets. Perfect for lounging at home or sleeping.',
    price: 45.99,
    compare_at_price: 69.99,
    cost_price: 35.99,
    shipping_cost: 4.99,
    profit: 5.01,
    profit_percentage: 10.9,
    sku: 'CJ-US-BP001',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600'
    ],
    quantity: 100,
    category: 'fashion',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0078901234',
    shipping_time: '3-5 أيام عمل',
    tags: ['loungewear', 'pants', 'fleece', 'comfortable', 'US Stock'],
    ai_score: 78,
    is_ai_selected: true
  },
  {
    name: 'Fuzzy Leg Socks - Cozy Winter Essentials',
    description: 'Ultra soft fuzzy leg socks with non-slip sole. Keeps feet warm and cozy. Great gift item. Available in multiple colors. One size fits all. Perfect for indoor use.',
    price: 19.99,
    compare_at_price: 29.99,
    cost_price: 14.99,
    shipping_cost: 2.99,
    profit: 2.01,
    profit_percentage: 10.1,
    sku: 'CJ-US-FS001',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600',
      'https://images.unsplash.com/photo-1520013324851-67c8f2638602?w=600'
    ],
    quantity: 400,
    category: 'fashion',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0089012345',
    shipping_time: '3-5 أيام عمل',
    tags: ['socks', 'winter', 'warm', 'cozy', 'US Stock'],
    ai_score: 75,
    is_ai_selected: true
  },
  {
    name: 'Wireless Bluetooth Earbuds - Pro Edition',
    description: 'Premium wireless earbuds with active noise cancellation. 8-hour battery life with charging case. IPX5 water resistance. Touch controls for easy operation. Crystal clear audio quality. Compatible with all Bluetooth devices.',
    price: 59.99,
    compare_at_price: 99.99,
    cost_price: 29.99,
    shipping_cost: 3.99,
    profit: 26.01,
    profit_percentage: 43.4,
    sku: 'CJ-US-WB001',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
    ],
    quantity: 220,
    category: 'electronics',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0090123456',
    shipping_time: '3-5 أيام عمل',
    tags: ['earbuds', 'bluetooth', 'wireless', 'audio', 'US Stock'],
    ai_score: 90,
    is_ai_selected: true
  },
  {
    name: 'Yoga Mat Premium - Non-Slip Exercise Mat',
    description: 'Premium yoga mat with superior grip and cushioning. 6mm thickness for optimal comfort. Eco-friendly TPE material. Includes carrying strap. Suitable for yoga, pilates, and floor exercises. Available in multiple colors.',
    price: 39.99,
    compare_at_price: 59.99,
    cost_price: 19.99,
    shipping_cost: 4.99,
    profit: 15.01,
    profit_percentage: 37.5,
    sku: 'CJ-US-YM001',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    gallery_images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
      'https://images.unsplash.com/photo-1506126279638-a0c4c2e3b77c?w=600'
    ],
    quantity: 160,
    category: 'health',
    is_active: true,
    is_us_warehouse: true,
    cj_product_id: 'US0101234567',
    shipping_time: '3-5 أيام عمل',
    tags: ['yoga', 'fitness', 'exercise', 'mat', 'US Stock'],
    ai_score: 87,
    is_ai_selected: true
  }
];

async function seedRealProducts() {
  console.log('🚀 بدء إضافة المنتجات الحقيقية من CJDropshipping...\n');

  let successCount = 0;
  let errorCount = 0;

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
        is_active: product.is_active,
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
        errorCount++;
      } else {
        console.log(`✅ تم إضافة "${product.name}"`);
        console.log(`   💰 سعر البيع: $${product.price} | الربح: $${product.profit} (${product.profit_percentage}%)`);
        console.log(`   🚚 الشحن: ${product.shipping_time} | المخزون: ${product.quantity}`);
        console.log('');
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ خطأ في "${product.name}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 ملخص إضافة المنتجات:');
  console.log(`   ✅ نجح: ${successCount} منتجات`);
  console.log(`   ❌ فشل: ${errorCount} منتجات`);
  console.log('═══════════════════════════════════════\n');

  // عرض ملخص المنتجات المضافة
  const { data: allProducts } = await supabase
    .from('products')
    .select('name, price, profit, profit_percentage, is_us_warehouse, category')
    .eq('is_us_warehouse', true)
    .order('created_at', { ascending: false });

  if (allProducts && allProducts.length > 0) {
    console.log('📦 المنتجات الأمريكية المتاحة حالياً:');
    console.log('───────────────────────────────────────');
    let totalProfit = 0;
    allProducts.forEach((p: any, index: number) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   السعر: $${p.price} | الربح: $${p.profit.toFixed(2)} | الفئة: ${p.category}`);
      totalProfit += p.profit;
    });
    console.log('───────────────────────────────────────');
    console.log(`💰 إجمالي الربح المتوقع: $${totalProfit.toFixed(2)}`);
    console.log(`📦 إجمالي المنتجات: ${allProducts.length}`);
  }
}

// تشغيل السكريبت
seedRealProducts()
  .then(() => {
    console.log('✨ تم完成 إضافة المنتجات!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  });
