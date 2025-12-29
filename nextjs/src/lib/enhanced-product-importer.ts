/**
 * Enhanced Product Importer with SEO
 * نظام استيراد المنتجات المتقدم مع تحسين SEO
 * 
 * المميزات:
 * - استيراد من CJ مع بيانات كاملة
 * - توليد SEO احترافي تلقائياً
 * - توليد SKU فريد
 * - تحسين الصور والوصف
 * - التكامل مع نظام الطلبات
 */

import { createClient } from '@/lib/supabase';
import { seoService, generateOptimizedSKU, generateProductSlug } from './seo-service';
import type { Database } from './types/supabase';

interface CJProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  stock: number;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants?: Array<{
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
  }>;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
}

interface ImportResult {
  success: boolean;
  productId?: string;
  sku?: string;
  seoData?: any;
  error?: string;
}

interface ImportConfig {
  autoApprove: boolean;
  profitMargin: number;
  minPrice: number;
  maxPrice: number;
  categories: string[];
  excludeWords: string[];
  generateSEO: boolean;
  syncInventory: boolean;
}

export class EnhancedProductImporter {
  private supabase: ReturnType<typeof createClient<Database>>;
  
  constructor() {
    this.supabase = createClient<Database>();
  }

  /**
   * استيراد منتج من CJ مع SEO كامل
   */
  async importProduct(
    cjProduct: CJProductData,
    config: Partial<ImportConfig> = {}
  ): Promise<ImportResult> {
    try {
      // 1. التحقق من وجود المنتج مسبقاً
      const existingProduct = await this.checkExistingProduct(cjProduct.id);
      if (existingProduct) {
        return {
          success: true,
          productId: existingProduct.id,
          sku: existingProduct.sku,
        };
      }

      // 2. التحقق من صلاحية المنتج
      const validation = this.validateProduct(cjProduct, config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.reason,
        };
      }

      // 3. توليد SKU فريد
      const sku = generateOptimizedSKU(
        cjProduct.category,
        cjProduct.name,
        cjProduct.variants?.[0]?.attributes?.color?.substring(0, 3).toUpperCase()
      );

      // 4. تنظيف وتحسين الوصف
      const cleanedDescription = this.cleanDescription(cjProduct.description);

      // 5. توليد SEO إذا كان مفعل
      let seoData = null;
      if (config.generateSEO !== false) {
        seoData = await seoService.generateProductSEO({
          productName: cjProduct.name,
          description: cleanedDescription,
          category: cjProduct.category,
          price: cjProduct.price,
          images: [cjProduct.image, ...cjProduct.images],
          sku: sku,
          currentStock: cjProduct.stock,
          rating: cjProduct.rating,
        });
      }

      // 6. إنشاء المنتج في قاعدة البيانات
      const productData = {
        name: cjProduct.name,
        slug: generateProductSlug(cjProduct.name),
        description: cleanedDescription,
        price: cjProduct.price,
        compare_at_price: Math.round(cjProduct.price * 1.3 * 100) / 100, // سعر مقارن أعلى بـ 30%
        cost_price: cjProduct.costPrice,
        images: [cjProduct.image, ...cjProduct.images].filter(Boolean),
        category: cjProduct.category,
        subcategory: cjProduct.subcategory || null,
        tags: cjProduct.tags || [],
        
        // بيانات CJ
        source: 'cj',
        cj_product_id: cjProduct.id,
        sku: sku,
        
        // المخزون
        stock_quantity: cjProduct.stock,
        track_inventory: true,
        allow_backorder: false,
        
        // الأبعاد والوزن
        weight: cjProduct.weight,
        length: cjProduct.dimensions?.length || null,
        width: cjProduct.dimensions?.width || null,
        height: cjProduct.dimensions?.height || null,
        
        // الحالة
        status: 'active',
        
        // SEO
        seo_title: seoData?.title || null,
        seo_description: seoData?.metaDescription || null,
        keywords: seoData?.keywords || [],
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: product, error: productError } = await this.supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();

      if (productError) {
        throw new Error(`فشل إنشاء المنتج: ${productError.message}`);
      }

      // 7. إضافة المتغيرات (Variants) إذا وجدت
      if (cjProduct.variants && cjProduct.variants.length > 0) {
        await this.importVariants(product.id, cjProduct.variants, sku);
      }

      // 8. حفظ بيانات SEO الكاملة
      if (seoData && product.id) {
        await seoService.saveProductSEO(product.id, seoData);
      }

      return {
        success: true,
        productId: product.id,
        sku: sku,
        seoData: seoData,
      };
    } catch (error: any) {
      console.error('خطأ في استيراد المنتج:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * استيراد منتج من CJ مع تحسين SEO بالذكاء الاصطناعي
   */
  async importWithAIEnhancement(
    cjProduct: CJProductData,
    aiPrompt?: string
  ): Promise<ImportResult> {
    // 1. استيراد المنتج أولاً
    const importResult = await this.importProduct(cjProduct, {
      generateSEO: false, // سننشئ SEO متقدماً بالذكاء الاصطناعي
    });

    if (!importResult.success || !importResult.productId) {
      return importResult;
    }

    // 2. تحسين المنتج بالذكاء الاصطناعي
    const enhancedContent = await this.enhanceWithAI(
      cjProduct,
      aiPrompt
    );

    // 3. تحديث المنتج بالمحتوى المحسّن
    await this.supabase
      .from('products')
      .update({
        name: enhancedContent.title,
        description: enhancedContent.description,
        seo_title: enhancedContent.seoTitle,
        seo_description: enhancedContent.seoDescription,
        keywords: enhancedContent.keywords,
        tags: enhancedContent.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', importResult.productId);

    // 4. حفظ بيانات SEO
    await seoService.saveProductSEO(importResult.productId, enhancedContent.seoData);

    return {
      ...importResult,
      seoData: enhancedContent.seoData,
    };
  }

  /**
   * تحسين المنتج بالذكاء الاصطناعي
   */
  private async enhanceWithAI(
    cjProduct: CJProductData,
    customPrompt?: string
  ): Promise<any> {
    // تحسين اسم المنتج
    const enhancedTitle = this.enhanceTitle(cjProduct.name);

    // تحسين الوصف
    const enhancedDescription = this.enhanceDescription(
      cjProduct.name,
      cjProduct.description,
      cjProduct.price
    );

    // توليد محتوى SEO
    const seoData = await seoService.generateProductSEO({
      productName: enhancedTitle,
      description: enhancedDescription,
      category: cjProduct.category,
      price: cjProduct.price,
      images: [cjProduct.image, ...cjProduct.images],
      sku: importResult.sku || generateOptimizedSKU(cjProduct.category, enhancedTitle),
    });

    // استخراج الكلمات المفتاحية والعلامات
    const keywords = [
      ...seoData.keywords,
      cjProduct.category.toLowerCase(),
      'dropshipping',
      'online shopping',
    ];

    const tags = [
      ...seoData.tags,
      cjProduct.category.toLowerCase(),
      'new arrival',
      'best seller',
    ];

    return {
      title: enhancedTitle,
      description: enhancedDescription,
      seoTitle: seoData.title,
      seoDescription: seoData.metaDescription,
      keywords: [...new Set(keywords)],
      tags: [...new Set(tags)],
      seoData: seoData,
    };
  }

  /**
   * تحسين عنوان المنتج
   */
  private enhanceTitle(title: string): string {
    // إضافة كلمات تسويقية
    const marketingPrefixes = ['Premium', 'High Quality', 'Best Selling', 'New'];
    const marketingSuffixes = ['Edition', 'Style', 'Collection'];

    // اختيار بادئة مناسبة
    const prefix = marketingPrefixes[Math.floor(Math.random() * marketingPrefixes.length)];
    
    // تحسين الاسم
    let enhanced = title
      .replace(/\b(for|with|in|on)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // إضافة البادئة إذا كان الاسم قصير
    if (enhanced.length < 30) {
      enhanced = `${prefix} ${enhanced}`;
    }

    return enhanced;
  }

  /**
   * تحسين وصف المنتج
   */
  private enhanceDescription(
    title: string, 
    originalDescription: string, 
    price: number
  ): string {
    const features = this.extractFeatures(originalDescription);
    
    let enhancedDescription = `**${title}**\n\n`;
    
    // إضافة معلومات السعر
    enhancedDescription += `💰 Price: $${price.toFixed(2)}\n\n`;
    
    // إضافة المميزات
    if (features.length > 0) {
      enhancedDescription += `✨ **Features:**\n`;
      features.forEach(feature => {
        enhancedDescription += `• ${feature}\n`;
      });
      enhancedDescription += '\n';
    }
    
    // إضافة الوصف الأصلي المنظف
    enhancedDescription += `📝 **Description:**\n${this.cleanDescription(originalDescription)}\n\n`;
    
    // إضافة معلومات الشحن
    enhancedDescription += `🚚 **Shipping:**\n• Fast worldwide shipping\n• Secure packaging\n• 30-day return policy\n\n`;
    
    // إضافة سبب الشراء
    enhancedDescription += `🎯 **Why Choose Us:**\n• High quality products\n• Excellent customer service\n• Competitive prices\n• Fast delivery`;

    return enhancedDescription;
  }

  /**
   * استخراج المميزات من الوصف
   */
  private extractFeatures(description: string): string[] {
    const features: string[] = [];
    
    // البحث عن أنماط المميزات
    const featurePatterns = [
      /•\s*([^•\n]+)/g,
      /[-•]\s*([A-Z][^.!\n]+)/g,
      /Features?[:\s]+([^.]+)/gi,
    ];

    for (const pattern of featurePatterns) {
      const matches = description.matchAll(pattern);
      for (const match of matches) {
        const feature = match[1]?.trim();
        if (feature && feature.length > 5 && feature.length < 100) {
          features.push(feature);
        }
      }
    }

    // أخذ أول 5 مميزات
    return features.slice(0, 5);
  }

  /**
   * التحقق من وجود المنتج
   */
  private async checkExistingProduct(cjProductId: string) {
    const { data } = await this.supabase
      .from('products')
      .select('id, sku')
      .eq('cj_product_id', cjProductId)
      .single();

    return data;
  }

  /**
   * التحقق من صلاحية المنتج
   */
  private validateProduct(
    product: CJProductData,
    config: Partial<ImportConfig>
  ): { valid: boolean; reason?: string } {
    // التحقق من السعر
    if (config.minPrice && product.price < config.minPrice) {
      return { valid: false, reason: 'السعر أقل من الحد الأدنى' };
    }
    if (config.maxPrice && product.price > config.maxPrice) {
      return { valid: false, reason: 'السعر أعلى من الحد الأقصى' };
    }

    // التحقق من الفئات
    if (config.categories && config.categories.length > 0) {
      const categoryMatch = config.categories.some(
        cat => product.category.toLowerCase().includes(cat.toLowerCase())
      );
      if (!categoryMatch) {
        return { valid: false, reason: 'الفئة غير موجودة في القائمة المسموحة' };
      }
    }

    // التحقق من كلمات الاستبعاد
    if (config.excludeWords && config.excludeWords.length > 0) {
      const productText = `${product.name} ${product.description}`.toLowerCase();
      const hasExcludedWord = config.excludeWords.some(
        word => productText.includes(word.toLowerCase())
      );
      if (hasExcludedWord) {
        return { valid: false, reason: 'المنتج يحتوي على كلمة مستبعدة' };
      }
    }

    // التحقق من المخزون
    if (product.stock < 1) {
      return { valid: false, reason: 'المنتج غير متوفر في المخزون' };
    }

    return { valid: true };
  }

  /**
   * تنظيف الوصف
   */
  private cleanDescription(description: string): string {
    return description
      // إزالة HTML tags
      .replace(/<[^>]*>/g, '\n')
      // إزالة الروابط
      .replace(/https?:\/\/[^\s]+/g, '')
      // إزالة الأرقام الطويلة (روابط)
      .replace(/\b\d{10,}\b/g, '')
      // تصحيح المسافات
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * استيراد المتغيرات (Variants)
   */
  private async importVariants(
    productId: string,
    variants: CJProductData['variants'],
    baseSku: string
  ): Promise<void> {
    const variantData = variants.map((variant, index) => {
      // توليد SKU للمتغير
      const variantSku = `${baseSku}-VAR${index + 1}`;
      
      return {
        product_id: productId,
        sku: variantSku,
        name: variant.name,
        price: variant.price,
        stock_quantity: variant.stock,
        attributes: variant.attributes,
        cj_variant_id: variant.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    await this.supabase.from('product_variants').insert(variantData);
  }

  /**
   * استيراد مجموعة منتجات
   */
  async importProducts(
    products: CJProductData[],
    config: Partial<ImportConfig> = {}
  ): Promise<{
    imported: number;
    skipped: number;
    failed: number;
    results: ImportResult[];
  }> {
    const results: ImportResult[] = [];
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
      const result = await this.importProduct(product, config);
      results.push(result);

      if (result.success) {
        if (result.productId) {
          imported++;
        } else {
          skipped++;
        }
      } else {
        failed++;
      }
    }

    return {
      imported,
      skipped,
      failed,
      results,
    };
  }
}

export const enhancedProductImporter = new EnhancedProductImporter();
