// ============================================================================
// Product Importer Service
// Handles importing products from dropshipping platforms
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Product import interfaces
export interface ImportableProduct {
  external_id: string;
  external_variant_id?: string;
  source_platform: 'zendrop' | 'cj' | 'appscenic';
  name: string;
  description: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price: number;
  images: string[];
  category: string;
  category_id?: string;
  tags: string[];
  inventory_count: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  specifications?: Record<string, string>;
  options?: Array<{ name: string; values: string[] }>;
  warehouse_location: string;
  shipping_time?: string;
  is_active?: boolean;
}

export interface ImportResult {
  success: boolean;
  product_id?: string;
  error?: string;
  warnings?: string[];
}

export interface BulkImportResult {
  total: number;
  imported: number;
  failed: number;
  results: ImportResult[];
}

// Pricing configuration
export interface PricingConfig {
  default_margin_percent: number;
  min_margin_percent: number;
  max_margin_percent: number;
  rounding_strategy: 'nearest_dollar' | 'nearest_99' | 'fixed';
  free_shipping_threshold?: number;
}

// Default pricing configuration
const DEFAULT_PRICING_CONFIG: PricingConfig = {
  default_margin_percent: 50,
  min_margin_percent: 30,
  max_margin_percent: 200,
  rounding_strategy: 'nearest_99',
  free_shipping_threshold: 50
};

/**
 * Calculate selling price based on cost and margin
 */
export function calculatePrice(
  costPrice: number,
  marginPercent: number,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): number {
  // Ensure margin is within bounds
  const validMargin = Math.max(config.min_margin_percent, 
    Math.min(marginPercent, config.max_margin_percent));
  
  // Calculate base price
  const basePrice = costPrice * (1 + validMargin / 100);
  
  // Apply rounding strategy
  let finalPrice: number;
  switch (config.rounding_strategy) {
    case 'nearest_dollar':
      finalPrice = Math.round(basePrice);
      break;
    case 'nearest_99':
      finalPrice = Math.floor(basePrice) + 0.99;
      break;
    case 'fixed':
      finalPrice = Math.round(basePrice * 100) / 100;
      break;
    default:
      finalPrice = basePrice;
  }
  
  return Math.round(finalPrice * 100) / 100;
}

/**
 * Generate URL-friendly slug from product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

/**
 * Import a single product from external platform
 */
export async function importProduct(
  product: ImportableProduct,
  pricingConfig?: PricingConfig
): Promise<ImportResult> {
  try {
    // Get or create category
    let categoryId = product.category_id;
    if (!categoryId && product.category) {
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', product.category)
        .single();
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            name: product.category,
            slug: generateSlug(product.category),
            description: `Products in ${product.category} category`
          })
          .select('id')
          .single();
        
        if (categoryError) {
          console.warn(`Failed to create category: ${product.category}`);
        } else {
          categoryId = newCategory?.id;
        }
      }
    }

    // Check if product already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('external_product_id', product.external_id)
      .eq('source_platform', product.source_platform)
      .single();

    const config = pricingConfig || DEFAULT_PRICING_CONFIG;
    const profitMargin = ((product.price - product.cost_price) / product.cost_price) * 100;
    const calculatedPrice = calculatePrice(product.cost_price, config.default_margin_percent, config);

    const productData = {
      name: product.name.substring(0, 500),
      slug: generateSlug(product.name),
      description: product.description,
      short_description: product.short_description,
      price: product.price || calculatedPrice,
      compare_price: product.compare_price,
      cost_price: product.cost_price,
      profit_margin: profitMargin,
      images: product.images,
      category_id: categoryId,
      tags: product.tags,
      inventory_count: product.inventory_count,
      weight: product.weight,
      dimensions: product.dimensions,
      specifications: product.specifications,
      source_platform: product.source_platform,
      external_product_id: product.external_id,
      external_variant_id: product.external_variant_id,
      warehouse_location: product.warehouse_location,
      is_active: product.is_active !== false
    };

    let productResult;

    if (existingProduct) {
      // Update existing product
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existingProduct.id)
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      productResult = data;
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      productResult = data;
    }

    // Import product images
    if (product.images && product.images.length > 0) {
      const imageRecords = product.images.map((url, index) => ({
        product_id: productResult.id,
        url,
        is_primary: index === 0,
        sort_order: index
      }));

      await supabase
        .from('product_images')
        .upsert(imageRecords.map(img => ({
          ...img,
          id: undefined // Let it generate new ID
        })));
    }

    // Import variants if available
    if (product.options && product.options.length > 0) {
      await importProductVariants(productResult.id, product, config);
    }

    return { 
      success: true, 
      product_id: productResult.id,
      warnings: product.inventory_count < 10 ? ['Low inventory'] : []
    };
  } catch (error) {
    console.error('Error importing product:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Import product variants
 */
async function importProductVariants(
  productId: string,
  product: ImportableProduct,
  config: PricingConfig
): Promise<void> {
  if (!product.options || product.options.length === 0) return;

  // Generate variant combinations
  const combinations = generateVariantCombinations(product.options);
  
  for (const combo of combinations) {
    const variantName = Object.entries(combo)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' / ');

    const variantData = {
      product_id: productId,
      name: variantName,
      options: combo,
      cost_price: product.cost_price,
      price: calculatePrice(product.cost_price, config.default_margin_percent, config),
      inventory_count: product.inventory_count,
      image_url: product.images[0]
    };

    await supabase
      .from('product_variants')
      .upsert(variantData);
  }
}

/**
 * Generate all combinations of variant options
 */
function generateVariantCombinations(
  options: Array<{ name: string; values: string[] }>
): Array<Record<string, string>> {
  if (options.length === 0) return [];
  
  const result: Array<Record<string, string>> = [];
  
  function generate(index: number, current: Record<string, string>) {
    if (index === options.length) {
      result.push({ ...current });
      return;
    }
    
    const option = options[index];
    for (const value of option.values) {
      current[option.name] = value;
      generate(index + 1, current);
      delete current[option.name];
    }
  }
  
  generate(0, {});
  return result;
}

/**
 * Bulk import multiple products
 */
export async function bulkImportProducts(
  products: ImportableProduct[],
  pricingConfig?: PricingConfig
): Promise<BulkImportResult> {
  const results: ImportResult[] = [];
  let imported = 0;
  let failed = 0;

  for (const product of products) {
    const result = await importProduct(product, pricingConfig);
    results.push(result);
    
    if (result.success) {
      imported++;
    } else {
      failed++;
    }
  }

  return {
    total: products.length,
    imported,
    failed,
    results
  };
}

/**
 * Get product recommendations based on profit margin
 */
export async function getHighProfitProducts(
  minMarginPercent: number = 50,
  limit: number = 20
): Promise<any[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      images:product_images(url, is_primary)
    `)
    .gte('profit_margin', minMarginPercent)
    .eq('is_active', true)
    .order('profit_margin', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching high profit products:', error);
    return [];
  }

  return data || [];
}

/**
 * Get products by warehouse location
 */
export async function getProductsByWarehouse(
  warehouseLocation: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ products: any[]; total: number }> {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const { data, error, count } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      images:product_images(url, is_primary),
      variants:product_variants(id, name, price, inventory_count)
    `, { count: 'exact' })
    .eq('warehouse_location', warehouseLocation)
    .eq('is_active', true)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by warehouse:', error);
    return { products: [], total: 0 };
  }

  return { products: data || [], total: count || 0 };
}

/**
 * Update product pricing based on margin
 */
export async function updateProductPricing(
  productId: string,
  newMarginPercent: number,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): Promise<boolean> {
  // Get current product
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('cost_price')
    .eq('id', productId)
    .single();

  if (fetchError || !product) {
    console.error('Product not found:', productId);
    return false;
  }

  const newPrice = calculatePrice(product.cost_price, newMarginPercent, config);
  const newProfitMargin = ((newPrice - product.cost_price) / product.cost_price) * 100;

  const { error: updateError } = await supabase
    .from('products')
    .update({
      price: newPrice,
      profit_margin: newProfitMargin,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (updateError) {
    console.error('Error updating product price:', updateError);
    return false;
  }

  return true;
}

/**
 * Bulk update pricing for category or all products
 */
export async function bulkUpdatePricing(
  filters: {
    categoryId?: string;
    warehouseLocation?: string;
    sourcePlatform?: string;
  },
  newMarginPercent: number,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): Promise<{ updated: number; errors: number }> {
  let query = supabase
    .from('products')
    .select('id, cost_price')
    .eq('is_active', true);

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.warehouseLocation) {
    query = query.eq('warehouse_location', filters.warehouseLocation);
  }
  if (filters.sourcePlatform) {
    query = query.eq('source_platform', filters.sourcePlatform);
  }

  const { data: products, error: fetchError } = await query;

  if (fetchError) {
    console.error('Error fetching products for pricing update:', fetchError);
    return { updated: 0, errors: 0 };
  }

  let updated = 0;
  let errors = 0;

  for (const product of products || []) {
    const success = await updateProductPricing(product.id, newMarginPercent, config);
    if (success) {
      updated++;
    } else {
      errors++;
    }
  }

  return { updated, errors };
}

/**
 * Sync inventory from platform
 */
export async function syncInventory(
  platform: 'zendrop' | 'cj' | 'appscenic'
): Promise<{ synced: number; errors: number }> {
  // This would integrate with the respective platform API
  // For now, it's a placeholder
  console.log(`Syncing inventory from ${platform}...`);
  
  // Get all products from this platform
  const { data: products, error } = await supabase
    .from('products')
    .select('id, external_product_id, source_platform')
    .eq('source_platform', platform);

  if (error) {
    console.error('Error fetching products:', error);
    return { synced: 0, errors: 0 };
  }

  let synced = 0;
  let errors = 0;

  for (const product of products || []) {
    // In real implementation, call platform API to get inventory
    // const inventory = await getPlatformInventory(platform, product.external_product_id);
    // await supabase.from('products').update({ inventory_count: inventory }).eq('id', product.id);
    synced++;
  }

  return { synced, errors };
}

export default {
  importProduct,
  bulkImportProducts,
  calculatePrice,
  generateSlug,
  getHighProfitProducts,
  getProductsByWarehouse,
  updateProductPricing,
  bulkUpdatePricing,
  syncInventory
};
