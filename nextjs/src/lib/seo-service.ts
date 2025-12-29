/**
 * SEO Optimization Service
 * خدمة تحسين محركات البحث للمنتجات
 * 
 * المميزات:
 * - توليد عناوين SEO محسنة
 * - إنشاء وصف Meta احترافي
 * - توليد الكلمات المفتاحية والعلامات
 * - إنشاء Schema Markup
 * - تحسين URLs
 * - توليد Alt Text للصور
 */

import { createClient } from '@/lib/supabase';
import type { Database } from './types/supabase';

interface SEOData {
  title: string;
  metaDescription: string;
  keywords: string[];
  tags: string[];
  url: string;
  ogTitle: string;
  ogDescription: string;
  schemaMarkup: object;
  altTexts: string[];
}

interface ProductSEOInput {
  productName: string;
  description: string;
  category: string;
  price: number;
  brand?: string;
  images: string[];
  sku: string;
  currentStock?: number;
  rating?: number;
}

interface SEOSettings {
  siteName: string;
  siteUrl: string;
  defaultTitleTemplate: string;
  maxTitleLength: number;
  maxDescriptionLength: number;
  maxKeywords: number;
  includeBrandInTitle: boolean;
  includePriceInTitle: boolean;
  generateSchemaMarkup: boolean;
}

// الإعدادات الافتراضية
const DEFAULT_SEOSettings: SEOSettings = {
  siteName: 'LuxuryHub',
  siteUrl: 'https://luxuryhub.com',
  defaultTitleTemplate: '{productName} | {brand} - {siteName}',
  maxTitleLength: 60,
  maxDescriptionLength: 160,
  maxKeywords: 10,
  includeBrandInTitle: true,
  includePriceInTitle: false,
  generateSchemaMarkup: true,
};

export class SEOService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private settings: SEOSettings;
  
  constructor(settings?: Partial<SEOSettings>) {
    this.supabase = createClient<Database>();
    this.settings = { ...DEFAULT_SEOSettings, ...settings };
  }

  /**
   * توليد بيانات SEO كاملة للمنتج
   */
  async generateProductSEO(input: ProductSEOInput): Promise<SEOData> {
    // تنظيف وتحسين اسم المنتج
    const cleanedName = this.cleanProductName(input.productName);
    
    // استخراج العلامة التجارية من الاسم
    const brand = input.brand || this.extractBrand(cleanedName);
    
    // توليد العنوان
    const title = this.generateTitle(cleanedName, brand);
    
    // توليد الوصف Meta
    const metaDescription = this.generateMetaDescription(cleanedName, input.description, input.price);
    
    // توليد الكلمات المفتاحية
    const keywords = this.generateKeywords(cleanedName, input.category, input.price);
    
    // توليد العلامات (Tags)
    const tags = this.generateTags(cleanedName, input.category, brand);
    
    // توليد URL محسّن
    const url = this.generateURL(cleanedName, input.sku);
    
    // توليد Open Graph data
    const ogTitle = this.generateOGTitle(cleanedName, brand);
    const ogDescription = this.generateOGDescription(metaDescription);
    
    // توليد Schema Markup
    const schemaMarkup = this.settings.generateSchemaMarkup 
      ? this.generateSchemaMarkup(input, title, url) 
      : {};
    
    // توليد Alt Text للصور
    const altTexts = this.generateAltTexts(cleanedName, brand, input.images.length);

    return {
      title,
      metaDescription,
      keywords,
      tags,
      url,
      ogTitle,
      ogDescription,
      schemaMarkup,
      altTexts,
    };
  }

  /**
   * تحسين اسم المنتج (إزالة الرموز والكلمات غير الضرورية)
   */
  private cleanProductName(name: string): string {
    return name
      // استبدال الرموز برموز مناسبة
      .replace(/[$#@!%^&*()_+=\[\]{};':"\\|,.<>\/?]/g, ' ')
      // إزالة الكلمات غير الضرورية
      .replace(/\b(for|and|or|the|a|an|with|free|cheap|hot|sale|new|best)\b/gi, ' ')
      // تصحيح الأخطاء الإملائية الشائعة
      .replace(/\b(freee|freeee|chep|cheep)\b/gi, '')
      // إزالة المسافات المتعددة
      .replace(/\s+/g, ' ')
      // إزالة الأرقام المنفردة في البداية
      .replace(/^\d+\s*/, '')
      // تحويل الحرف الأول إلى حرف كبير
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * استخراج العلامة التجارية من اسم المنتج
   */
  private extractBrand(name: string): string {
    const commonBrands = [
      'Apple', 'Samsung', 'Nike', 'Adidas', 'Puma', 'Guess',
      'Michael Kors', 'Coach', 'Calvin Klein', 'Levis', 'Zara',
      'H&M', 'Uniqlo', 'Xiaomi', 'Huawei', 'Sony', 'Bose'
    ];

    for (const brand of commonBrands) {
      if (name.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    // استخراج كلمة واحدة قوية كعلامة تجارية
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0];
    }

    return this.settings.siteName;
  }

  /**
   * توليد عنوان SEO محسّن
   */
  private generateTitle(productName: string, brand: string): string {
    let title = productName;

    // إضافة العلامة التجارية
    if (this.settings.includeBrandInTitle && brand !== this.settings.siteName) {
      title = `${productName} - ${brand}`;
    }

    // إضافة اسم الموقع
    title = `${title} | ${this.settings.siteName}`;

    // تقليص العنوان إذا كان طويلاً
    if (title.length > this.settings.maxTitleLength) {
      title = this.truncateText(title, this.settings.maxTitleLength - 3);
    }

    return title;
  }

  /**
   * توليد وصف Meta (Description)
   */
  private generateMetaDescription(productName: string, description: string, price: number): string {
    // استخراج الجمل المهمة من الوصف
    const sentences = description
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    // أخذ أول جملتين أو ثلاث
    let metaDescription = sentences.slice(0, 2).join('. ');

    // إضافة معلومات السعر
    if (this.settings.includePriceInTitle) {
      metaDescription += ` Price: $${price.toFixed(2)}.`;
    }

    // إضافة دعوة للعمل
    if (!metaDescription.toLowerCase().includes('shop') && 
        !metaDescription.toLowerCase().includes('buy')) {
      metaDescription += ` Shop now at ${this.settings.siteName}!`;
    }

    // تقليص إذا كان طويلاً
    if (metaDescription.length > this.settings.maxDescriptionLength) {
      metaDescription = this.truncateText(metaDescription, this.settings.maxDescriptionLength - 3);
    }

    return metaDescription;
  }

  /**
   * توليد الكلمات المفتاحية
   */
  private generateKeywords(productName: string, category: string, price: number): string[] {
    const keywords: string[] = [];

    // إضافة كلمات من اسم المنتج
    const nameWords = productName.split(' ').filter(w => w.length > 3);
    keywords.push(...nameWords.slice(0, 5));

    // إضافة الفئة
    keywords.push(category.toLowerCase());

    // إضافة كلمات مفتاحية عامة للتجارة الإلكترونية
    keywords.push(
      'online shopping',
      'buy online',
      'best quality',
      'fast shipping'
    );

    // إضافة حسب السعر
    if (price < 20) {
      keywords.push('affordable', 'budget friendly');
    } else if (price > 100) {
      keywords.push('premium', 'luxury');
    }

    // إزالة التكرار والحد الأقصى
    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords.slice(0, this.settings.maxKeywords);
  }

  /**
   * توليد العلامات (Tags)
   */
  private generateTags(productName: string, category: string, brand: string): string[] {
    const tags: string[] = [];

    // إضافة كلمات من اسم المنتج
    const words = productName.split(' ');
    words.forEach(word => {
      if (word.length > 3) {
        tags.push(word.toLowerCase());
      }
    });

    // إضافة الفئة
    tags.push(category.toLowerCase());

    // إضافة العلامة التجارية
    tags.push(brand.toLowerCase());

    // إضافة علامات شائعة
    tags.push('dropshipping', 'free shipping', 'new arrival');

    return [...new Set(tags)];
  }

  /**
   * توليد URL محسّن
   */
  private generateURL(productName: string, sku: string): string {
    // تحويل الاسم إلى slug
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // إضافة SKU
    return `/products/${slug}-${sku}`.toLowerCase();
  }

  /**
   * توليد Open Graph Title
   */
  private generateOGTitle(productName: string, brand: string): string {
    let ogTitle = productName;
    if (brand !== this.settings.siteName) {
      ogTitle = `${ogTitle} by ${brand}`;
    }
    return ogTitle;
  }

  /**
   * توليد Open Graph Description
   */
  private generateOGDescription(metaDescription: string): string {
    // Open Graph descriptions can be longer (up to 200 chars)
    if (metaDescription.length > 200) {
      return this.truncateText(metaDescription, 197) + '...';
    }
    return metaDescription;
  }

  /**
   * توليد Schema Markup (JSON-LD)
   */
  private generateSchemaMarkup(
    input: ProductSEOInput, 
    title: string, 
    url: string
  ): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: input.description,
      sku: input.sku,
      brand: {
        '@type': 'Brand',
        name: input.brand || this.settings.siteName,
      },
      offers: {
        '@type': 'Offer',
        url: `${this.settings.siteUrl}${url}`,
        priceCurrency: 'USD',
        price: input.price.toFixed(2),
        availability: input.currentStock && input.currentStock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: this.settings.siteName,
        },
      },
      image: input.images,
      ...(input.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: input.rating,
          reviewCount: 1,
        },
      }),
    };
  }

  /**
   * توليد Alt Text للصور
   */
  private generateAltTexts(productName: string, brand: string, imageCount: number): string[] {
    const altTexts: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      let altText = `${productName}`;
      
      if (brand !== this.settings.siteName) {
        altText = `${brand} ${altText}`;
      }

      if (i === 0) {
        altText = `${altText} - Main Image - View Product`;
      } else if (i === 1) {
        altText = `${altText} - Side View`;
      } else if (i === 2) {
        altText = `${altText} - Detail View`;
      } else if (i === imageCount - 1) {
        altText = `${altText} - All Angles`;
      } else {
        altText = `${altText} - Image ${i + 1}`;
      }

      altTexts.push(altText);
    }

    return altTexts;
  }

  /**
   * قص النص مع إضافة ...
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * حفظ بيانات SEO في قاعدة البيانات
   */
  async saveProductSEO(productId: string, seoData: SEOData): Promise<void> {
    await this.supabase.from('product_seo').upsert({
      product_id: productId,
      seo_title: seoData.title,
      meta_description: seoData.metaDescription,
      keywords: seoData.keywords,
      tags: seoData.tags,
      canonical_url: seoData.url,
      og_title: seoData.ogTitle,
      og_description: seoData.ogDescription,
      schema_markup: seoData.schemaMarkup,
      alt_texts: seoData.altTexts,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * جلب بيانات SEO للمنتج
   */
  async getProductSEO(productId: string) {
    const { data, error } = await this.supabase
      .from('product_seo')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * توليد sitemap XML للمنتجات
   */
  generateSitemapXML(products: Array<{ id: string; url: string; updatedAt: string }>): string {
    const baseUrl = this.settings.siteUrl;
    
    const urls = products.map(product => `
      <url>
        <loc>${baseUrl}${product.url}</loc>
        <lastmod>${product.updatedAt.split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  /**
   * توليد robots.txt
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.settings.siteUrl}/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/

# Disallow dynamic parameters
Disallow: /*?
`;
  }
}

// إنشاء instance افتراضي
export const seoService = new SEOService();

// دوال مساعدة للاستخدام المباشر

/**
 * دالة سريعة لتوليد SEO لمنتج
 */
export async function quickSEOGenerate(input: ProductSEOInput): Promise<SEOData> {
  const service = new SEOService();
  return await service.generateProductSEO(input);
}

/**
 * توليد SKU محسّن
 */
export function generateOptimizedSKU(
  category: string, 
  productName: string, 
  suffix?: string
): string {
  // استخراج الأحرف الأولى من الفئة
  const categoryCode = category
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');

  // استخراج معلومات من الاسم
  const words = productName.split(' ').filter(w => w.length > 3);
  const nameCode = words.length > 0 
    ? words[0].substring(0, 3).toUpperCase()
    : 'PRD';

  // توليد رقم عشوائي فريد
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  // دمج everything
  const sku = `${categoryCode}-${nameCode}-${randomNum}${suffix ? '-' + suffix : ''}`;

  return sku;
}

/**
 * توليد slug من اسم المنتج
 */
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
