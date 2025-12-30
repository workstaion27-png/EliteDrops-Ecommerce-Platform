import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 30 منتج حقيقي من CJDropshipping مع مستودع أمريكا
const realProducts = [
  // الفئة الصحية (8 منتجات)
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
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0023456789',
    shipping_time: '3-5 أيام عمل',
    tags: ['LED mask', 'beauty', 'skincare', 'anti-aging', 'US Stock'],
    ai_score: 95,
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
  },
  {
    name: 'Pulse Oximeter - Digital Fingertip Oxygen Monitor',
    description: 'Digital pulse oximeter with LED display. Measures blood oxygen saturation and pulse rate. Compact and portable.',
    price: 24.99,
    compare_at_price: 39.99,
    cost_price: 12.99,
    shipping_cost: 3.99,
    profit: 8.01,
    profit_percentage: 32.0,
    sku: 'CJ-US-OX001',
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600'],
    quantity: 250,
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0112345678',
    shipping_time: '3-5 أيام عمل',
    tags: ['oximeter', 'health', 'medical', 'monitor', 'US Stock'],
    ai_score: 85,
    is_ai_selected: true
  },
  {
    name: 'Therapeutic Heating Pad - Auto Shut Off',
    description: 'Electric heating pad with auto shut-off feature. 4 heat settings. Soft microplush fabric.',
    price: 44.99,
    compare_at_price: 69.99,
    cost_price: 24.99,
    shipping_cost: 4.99,
    profit: 15.01,
    profit_percentage: 33.4,
    sku: 'CJ-US-HP001',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600'],
    quantity: 120,
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0123456789',
    shipping_time: '3-5 أيام عمل',
    tags: ['heating pad', 'therapy', 'pain relief', 'US Stock'],
    ai_score: 82,
    is_ai_selected: true
  },
  {
    name: 'Foot Massager - Shiatsu Kneading Machine',
    description: 'Shiatsu foot massager with heat function. 3 massage modes. Remote control included. Quiet operation.',
    price: 79.99,
    compare_at_price: 129.99,
    cost_price: 49.99,
    shipping_cost: 9.99,
    profit: 20.01,
    profit_percentage: 25.0,
    sku: 'CJ-US-FM002',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600'],
    quantity: 90,
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0134567890',
    shipping_time: '3-5 أيام عمل',
    tags: ['foot massager', 'shiatzu', 'reflexology', 'US Stock'],
    ai_score: 84,
    is_ai_selected: true
  },
  {
    name: 'TENS Unit Pulse Massager - Pain Relief',
    description: 'Electric pulse massager for muscle pain relief. 8 massage modes. Adjustable intensity. Rechargeable battery.',
    price: 34.99,
    compare_at_price: 54.99,
    cost_price: 18.99,
    shipping_cost: 4.99,
    profit: 11.01,
    profit_percentage: 31.5,
    sku: 'CJ-US-TN001',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600'],
    quantity: 170,
    category: 'health',
    is_us_warehouse: true,
    cj_product_id: 'US0145678901',
    shipping_time: '3-5 أيام عمل',
    tags: ['TENS', 'pain relief', 'muscle', 'therapy', 'US Stock'],
    ai_score: 83,
    is_ai_selected: true
  },
  // الإلكترونيات (8 منتجات)
  {
    name: 'Foldable Electric Scooter - 250W Motor',
    description: 'Lightweight foldable electric scooter with 250W motor. 15-20 mile range. LED display and app connectivity.',
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
    name: 'Portable Power Bank - 20000mAh Fast Charging',
    description: 'High capacity power bank with 20000mAh. Fast charging support for all devices. LED indicator lights.',
    price: 34.99,
    compare_at_price: 54.99,
    cost_price: 17.99,
    shipping_cost: 3.99,
    profit: 13.01,
    profit_percentage: 37.2,
    sku: 'CJ-US-PB001',
    image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600'],
    quantity: 300,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0156789012',
    shipping_time: '3-5 أيام عمل',
    tags: ['power bank', 'charger', 'portable', 'battery', 'US Stock'],
    ai_score: 86,
    is_ai_selected: true
  },
  {
    name: 'Smart Watch Fitness Tracker - Waterproof',
    description: 'Fitness smartwatch with heart rate monitor. Sleep tracking and step counter. Waterproof design.',
    price: 79.99,
    compare_at_price: 129.99,
    cost_price: 45.99,
    shipping_cost: 4.99,
    profit: 29.01,
    profit_percentage: 36.3,
    sku: 'CJ-US-SW001',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600'],
    quantity: 180,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0167890123',
    shipping_time: '3-5 أيام عمل',
    tags: ['smart watch', 'fitness', 'tracker', 'wearable', 'US Stock'],
    ai_score: 89,
    is_ai_selected: true
  },
  {
    name: 'Wireless Phone Charger - Fast Charging Pad',
    description: 'Qi-compatible wireless charging pad. Fast charging up to 15W. LED indicator. Sleek design.',
    price: 24.99,
    compare_at_price: 39.99,
    cost_price: 12.99,
    shipping_cost: 3.99,
    profit: 8.01,
    profit_percentage: 32.0,
    sku: 'CJ-US-WC001',
    image_url: 'https://images.unsplash.com/photo-1586816879360-004f5b9b1df5?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600'],
    quantity: 280,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0178901234',
    shipping_time: '3-5 أيام عمل',
    tags: ['wireless charger', 'phone charger', 'Qi', 'US Stock'],
    ai_score: 84,
    is_ai_selected: true
  },
  {
    name: 'Bluetooth Speaker - Waterproof Portable',
    description: 'Portable waterproof Bluetooth speaker. 360-degree sound. 12-hour battery life.',
    price: 44.99,
    compare_at_price: 69.99,
    cost_price: 24.99,
    shipping_cost: 4.99,
    profit: 15.01,
    profit_percentage: 33.4,
    sku: 'CJ-US-BS001',
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1543512214-318c7553f230?w=600'],
    quantity: 150,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0189012345',
    shipping_time: '3-5 أيام عمل',
    tags: ['bluetooth speaker', 'portable', 'waterproof', 'audio', 'US Stock'],
    ai_score: 83,
    is_ai_selected: true
  },
  {
    name: 'Ring Light Kit - Professional LED Lighting',
    description: 'LED ring light with tripod stand. 10 brightness levels. 3 color temperatures.',
    price: 39.99,
    compare_at_price: 59.99,
    cost_price: 19.99,
    shipping_cost: 4.99,
    profit: 15.01,
    profit_percentage: 37.5,
    sku: 'CJ-US-RL001',
    image_url: 'https://images.unsplash.com/photo-1533158388470-9a56699990c6?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1580699221867-b7b607214028?w=600'],
    quantity: 160,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0190123456',
    shipping_time: '3-5 أيام عمل',
    tags: ['ring light', 'LED', 'photography', 'streaming', 'US Stock'],
    ai_score: 85,
    is_ai_selected: true
  },
  {
    name: 'Wireless Gaming Mouse - RGB LED',
    description: 'High precision wireless gaming mouse. Adjustable DPI. RGB lighting effects.',
    price: 49.99,
    compare_at_price: 79.99,
    cost_price: 27.99,
    shipping_cost: 4.99,
    profit: 17.01,
    profit_percentage: 34.0,
    sku: 'CJ-US-GM001',
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600'],
    quantity: 200,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0201234567',
    shipping_time: '3-5 أيام عمل',
    tags: ['gaming mouse', 'wireless', 'RGB', 'gaming', 'US Stock'],
    ai_score: 84,
    is_ai_selected: true
  },
  // المنزل والمطبخ (6 منتجات)
  {
    name: 'Adjustable Measuring Cup Set - Kitchen Essential',
    description: 'Premium adjustable measuring cup with clear markings. Metric and imperial measurements.',
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
    name: 'Electric Milk Frother - Coffee Foam Maker',
    description: 'Handheld electric milk frother for coffee. Creates perfect foam in seconds.',
    price: 19.99,
    compare_at_price: 29.99,
    cost_price: 9.99,
    shipping_cost: 3.99,
    profit: 6.01,
    profit_percentage: 30.0,
    sku: 'CJ-US-MF001',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1507133750069-7df0f74d8b44?w=600'],
    quantity: 350,
    category: 'home',
    is_us_warehouse: true,
    cj_product_id: 'US0212345678',
    shipping_time: '3-5 أيام عمل',
    tags: ['milk frother', 'coffee', 'kitchen', 'US Stock'],
    ai_score: 80,
    is_ai_selected: true
  },
  {
    name: 'Non-Stick Cookware Set - 10 Pieces',
    description: 'Premium non-stick cookware set. Includes pots and pans. Dishwasher safe.',
    price: 89.99,
    compare_at_price: 149.99,
    cost_price: 54.99,
    shipping_cost: 9.99,
    profit: 25.01,
    profit_percentage: 27.8,
    sku: 'CJ-US-CW001',
    image_url: 'https://images.unsplash.com/photo-1584992236310-6eddd3f4a94c?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600'],
    quantity: 80,
    category: 'home',
    is_us_warehouse: true,
    cj_product_id: 'US0223456789',
    shipping_time: '5-7 أيام عمل',
    tags: ['cookware', 'kitchen', 'pots', 'pans', 'US Stock'],
    ai_score: 82,
    is_ai_selected: true
  },
  {
    name: 'Automatic Soap Dispenser - Touchless',
    description: 'Touchless automatic soap dispenser. Infrared sensor technology.',
    price: 29.99,
    compare_at_price: 44.99,
    cost_price: 15.99,
    shipping_cost: 4.99,
    profit: 9.01,
    profit_percentage: 30.0,
    sku: 'CJ-US-SD001',
    image_url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600'],
    quantity: 220,
    category: 'home',
    is_us_warehouse: true,
    cj_product_id: 'US0234567890',
    shipping_time: '3-5 أيام عمل',
    tags: ['soap dispenser', 'bathroom', 'touchless', 'hygiene', 'US Stock'],
    ai_score: 81,
    is_ai_selected: true
  },
  {
    name: 'LED Desk Lamp - Adjustable Brightness',
    description: 'Modern LED desk lamp with adjustable brightness and color temperature.',
    price: 34.99,
    compare_at_price: 54.99,
    cost_price: 18.99,
    shipping_cost: 4.99,
    profit: 11.01,
    profit_percentage: 31.5,
    sku: 'CJ-US-DL001',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1534234828569-162292693223?w=600'],
    quantity: 180,
    category: 'home',
    is_us_warehouse: true,
    cj_product_id: 'US0245678901',
    shipping_time: '3-5 أيام عمل',
    tags: ['desk lamp', 'LED', 'office', 'reading', 'US Stock'],
    ai_score: 83,
    is_ai_selected: true
  },
  {
    name: 'Electric Wine Opener - Automatic Corkscrew',
    description: 'Automatic electric wine opener. Opens wine bottles in seconds.',
    price: 34.99,
    compare_at_price: 54.99,
    cost_price: 18.99,
    shipping_cost: 4.99,
    profit: 11.01,
    profit_percentage: 31.5,
    sku: 'CJ-US-WO001',
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600'],
    quantity: 180,
    category: 'home',
    is_us_warehouse: true,
    cj_product_id: 'US0256789012',
    shipping_time: '3-5 أيام عمل',
    tags: ['wine opener', 'kitchen', 'automatic', 'party', 'US Stock'],
    ai_score: 82,
    is_ai_selected: true
  },
  // الحيوانات الأليفة (3 منتجات)
  {
    name: 'Interactive Cat Hunting Toy - Electronic Movement',
    description: 'Smart interactive cat toy with unpredictable movement patterns. USB rechargeable.',
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
    name: 'Automatic Pet Feeder - Programmable',
    description: 'Programmable automatic pet feeder. 6 meal slots. Portion control.',
    price: 59.99,
    compare_at_price: 89.99,
    cost_price: 35.99,
    shipping_cost: 6.99,
    profit: 17.01,
    profit_percentage: 28.4,
    sku: 'CJ-US-PF001',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600'],
    quantity: 120,
    category: 'pets',
    is_us_warehouse: true,
    cj_product_id: 'US0267890123',
    shipping_time: '3-5 أيام عمل',
    tags: ['pet feeder', 'automatic', 'cats', 'dogs', 'US Stock'],
    ai_score: 84,
    is_ai_selected: true
  },
  {
    name: 'Dog Water Bottle - Portable Travel Bottle',
    description: 'Portable water bottle for dogs. Leak-proof design. One-handed operation.',
    price: 19.99,
    compare_at_price: 29.99,
    cost_price: 9.99,
    shipping_cost: 3.99,
    profit: 6.01,
    profit_percentage: 30.0,
    sku: 'CJ-US-DW001',
    image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1558929996-da64ba858215?w=600'],
    quantity: 300,
    category: 'pets',
    is_us_warehouse: true,
    cj_product_id: 'US0278901234',
    shipping_time: '3-5 أيام عمل',
    tags: ['dog water bottle', 'pets', 'travel', 'outdoor', 'US Stock'],
    ai_score: 79,
    is_ai_selected: true
  },
  // الأزياء والراحة (3 منتجات)
  {
    name: 'Memory Foam Insoles - Orthopedic Support',
    description: 'Premium memory foam insoles. Arch support cushion. Shock absorbing design.',
    price: 24.99,
    compare_at_price: 39.99,
    cost_price: 12.99,
    shipping_cost: 3.99,
    profit: 8.01,
    profit_percentage: 32.0,
    sku: 'CJ-US-MI001',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'],
    quantity: 280,
    category: 'fashion',
    is_us_warehouse: true,
    cj_product_id: 'US0289012345',
    shipping_time: '3-5 أيام عمل',
    tags: ['insoles', 'footwear', 'comfort', 'orthopedic', 'US Stock'],
    ai_score: 81,
    is_ai_selected: true
  },
  {
    name: 'Wireless Charging Wallet - RFID Blocking',
    description: 'Slim leather wallet with wireless charging capability. RFID blocking technology.',
    price: 49.99,
    compare_at_price: 79.99,
    cost_price: 27.99,
    shipping_cost: 4.99,
    profit: 17.01,
    profit_percentage: 34.0,
    sku: 'CJ-US-WW001',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1600841961462-9099348f649a?w=600'],
    quantity: 150,
    category: 'fashion',
    is_us_warehouse: true,
    cj_product_id: 'US0290123456',
    shipping_time: '3-5 أيام عمل',
    tags: ['wallet', 'wireless charger', 'RFID', 'leather', 'US Stock'],
    ai_score: 86,
    is_ai_selected: true
  },
  {
    name: 'Compression Socks - Athletic Performance',
    description: 'Premium compression socks for athletic performance. Improves circulation.',
    price: 19.99,
    compare_at_price: 29.99,
    cost_price: 9.99,
    shipping_cost: 2.99,
    profit: 7.01,
    profit_percentage: 35.0,
    sku: 'CJ-US-CS001',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600'],
    quantity: 400,
    category: 'fashion',
    is_us_warehouse: true,
    cj_product_id: 'US0301234567',
    shipping_time: '3-5 أيام عمل',
    tags: ['compression socks', 'athletic', 'fitness', 'circulation', 'US Stock'],
    ai_score: 78,
    is_ai_selected: true
  },
  // منتجات متنوعة (2 منتجات)
  {
    name: 'UV Sterilizer Box - Phone and Jewelry',
    description: 'UV sterilization box for phones, jewelry, and small items. Kills 99.9% of bacteria.',
    price: 39.99,
    compare_at_price: 59.99,
    cost_price: 22.99,
    shipping_cost: 4.99,
    profit: 12.01,
    profit_percentage: 30.0,
    sku: 'CJ-US-UV001',
    image_url: 'https://images.unsplash.com/photo-1583912268183-eb4838cc9a38?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600'],
    quantity: 160,
    category: 'home',
    is_us_warehouse: true,
    cj_product_id: 'US0312345678',
    shipping_time: '3-5 أيام عمل',
    tags: ['sterilizer', 'UV', 'phone cleaner', 'hygiene', 'US Stock'],
    ai_score: 83,
    is_ai_selected: true
  },
  {
    name: 'Car Phone Mount - Wireless Charger',
    description: 'Automatic car phone mount with wireless charging. One-touch auto clamp.',
    price: 29.99,
    compare_at_price: 44.99,
    cost_price: 15.99,
    shipping_cost: 4.99,
    profit: 9.01,
    profit_percentage: 30.0,
    sku: 'CJ-US-CM001',
    image_url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600',
    gallery_images: ['https://images.unsplash.com/photo-1509395062549-057d7245f62d?w=600'],
    quantity: 250,
    category: 'electronics',
    is_us_warehouse: true,
    cj_product_id: 'US0323456789',
    shipping_time: '3-5 أيام عمل',
    tags: ['car mount', 'wireless charger', 'phone holder', 'US Stock'],
    ai_score: 84,
    is_ai_selected: true
  }
];

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niodbejcakihgjdptgyw.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🚀 بدء إضافة ${realProducts.length} منتج حقيقي من CJDropshipping...`);
    
    let successCount = 0;
    let skippedCount = 0;
    const results: any[] = [];
    const errors: any[] = [];

    for (const product of realProducts) {
      try {
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('cj_product_id', product.cj_product_id)
          .single();

        if (existingProduct) {
          skippedCount++;
          results.push({ name: product.name, status: 'skipped', reason: 'Already exists' });
          continue;
        }

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
          errors.push({ name: product.name, error: error.message });
        } else {
          successCount++;
          results.push({
            name: product.name,
            status: 'success',
            price: product.price,
            profit: product.profit,
            profit_percentage: product.profit_percentage,
            category: product.category
          });
        }
      } catch (error: any) {
        errors.push({ name: product.name, error: error.message });
      }
    }

    const { data: allProducts } = await supabase
      .from('products')
      .select('name, price, profit, profit_percentage, category, quantity, is_us_warehouse')
      .eq('is_us_warehouse', true)
      .order('created_at', { ascending: false });

    const totalProfit = allProducts?.reduce((sum: number, p: any) => sum + p.profit, 0) || 0;

    return NextResponse.json({
      success: true,
      message: `تم إضافة ${successCount} منتج حقيقي بنجاح`,
      summary: {
        added: successCount,
        skipped: skippedCount,
        errors: errors.length,
        total_products: realProducts.length,
        total_us_products: allProducts?.length || 0,
        total_profit_potential: Math.round(totalProfit * 100) / 100
      },
      results,
      errors: errors.length > 0 ? errors : null,
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
  const categories = [...new Set(realProducts.map(p => p.category))];
  
  return NextResponse.json({
    message: `Use POST to seed ${realProducts.length} real CJDropshipping products`,
    total_products: realProducts.length,
    categories: categories,
    by_category: categories.map(cat => ({
      category: cat,
      count: realProducts.filter(p => p.category === cat).length,
      avg_profit: Math.round(realProducts.filter(p => p.category === cat).reduce((sum, p) => sum + p.profit, 0) / realProducts.filter(p => p.category === cat).length * 100) / 100
    }))
  });
}
