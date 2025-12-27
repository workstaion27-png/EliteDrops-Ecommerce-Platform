import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';
import { importProduct, bulkImportProducts, calculatePrice, getHighProfitProducts, getProductsByWarehouse, bulkUpdatePricing, syncInventory } from '@/lib/product-importer';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const platform = searchParams.get('platform');
    const category = searchParams.get('category');
    const warehouse = searchParams.get('warehouse');
    const minMargin = parseFloat(searchParams.get('min_margin') || '0');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(url, is_primary),
        variants:product_variants(id, name, price, inventory_count)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (platform) query = query.eq('source_platform', platform);
    if (category) query = query.eq('category_id', category);
    if (warehouse) query = query.eq('warehouse_location', warehouse);
    if (minMargin > 0) query = query.gte('profit_margin', minMargin);
    if (featured === 'true') query = query.eq('is_featured', true);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      products: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Import product or bulk import
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    switch (action) {
      case 'import_single': {
        const result = await importProduct(body.product, body.pricingConfig);
        return NextResponse.json(result);
      }

      case 'import_bulk': {
        const result = await bulkImportProducts(body.products, body.pricingConfig);
        return NextResponse.json(result);
      }

      case 'get_high_profit': {
        const products = await getHighProfitProducts(body.minMargin, body.limit);
        return NextResponse.json({ success: true, products });
      }

      case 'get_by_warehouse': {
        const result = await getProductsByWarehouse(body.warehouse, body.options);
        return NextResponse.json({ success: true, ...result });
      }

      case 'update_pricing': {
        const result = await bulkUpdatePricing(body.filters, body.marginPercent, body.pricingConfig);
        return NextResponse.json({ success: true, ...result });
      }

      case 'sync_inventory': {
        const result = await syncInventory(body.platform);
        return NextResponse.json({ success: true, ...result });
      }

      case 'calculate_price': {
        const price = calculatePrice(body.costPrice, body.marginPercent, body.pricingConfig);
        return NextResponse.json({ success: true, price });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
