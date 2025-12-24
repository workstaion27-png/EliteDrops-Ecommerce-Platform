import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cjProductId, name, description, category, price, stock, image_url, variantId } = body

    if (!cjProductId || !name) {
      return NextResponse.json({
        success: false,
        error: 'Product ID and name are required'
      }, { status: 400 })
    }

    // Check if product already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('cj_product_id', cjProductId)
      .single()

    if (existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product already imported',
        productId: existingProduct.id
      }, { status: 400 })
    }

    // Insert product into database
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([{
        name,
        description: description || '',
        category: category || 'other',
        price: price || 0,
        stock: stock || 0,
        image_url: image_url || null,
        cj_product_id: cjProductId,
        cj_variant_id: variantId || null,
        is_active: true,
        source: 'cj_dropshipping'
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase Insert Error:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to save product'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Product imported successfully'
    })

  } catch (error: any) {
    console.error('Import Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to import product'
    }, { status: 500 })
  }
}
