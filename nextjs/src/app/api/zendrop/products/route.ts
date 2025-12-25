// Zendrop API Route Handlers - Server-side API endpoints
// These routes handle communication with Zendrop API

import { NextRequest, NextResponse } from 'next/server'
import { ZendropClient, ZendropProduct } from '@/lib/zendrop'

// Initialize Zendrop client
function getClient(): ZendropClient | null {
  const apiKey = process.env.ZENDROP_API_KEY
  if (!apiKey) {
    return null
  }
  return new ZendropClient(apiKey)
}

// ============ GET /api/zendrop/products ============
export async function GET(request: NextRequest) {
  try {
    const client = getClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Zendrop API key not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const products = await client.getProducts({
      page,
      per_page: perPage,
      category,
      search,
    })

    // Transform to our product format
    const transformedProducts = products.data.map((product: ZendropProduct) => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      compare_price: product.compare_at_price,
      images: product.images,
      category: product.category,
      inventory_count: product.inventory,
      sku: product.sku,
      is_active: product.inventory > 0,
      zendrop_id: product.id,
    }))

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: products.pagination,
    })
  } catch (error) {
    console.error('Zendrop products error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// ============ POST /api/zendrop/products ============
export async function POST(request: NextRequest) {
  try {
    const client = getClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Zendrop API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { action, productId, ...data } = body

    switch (action) {
      case 'import': {
        // Import a single product from Zendrop
        const product = await client.getProduct(parseInt(productId))
        
        const transformedProduct = {
          name: product.name,
          description: product.description,
          price: product.price,
          compare_price: product.compare_at_price,
          images: product.images,
          category: product.category,
          inventory_count: product.inventory,
          sku: product.sku,
          is_active: product.inventory > 0,
          zendrop_id: product.id,
          variants: product.variants,
        }

        return NextResponse.json({
          success: true,
          product: transformedProduct,
        })
      }

      case 'bulk_import': {
        // Import multiple products
        const { productIds } = data
        const importedProducts = []

        for (const id of productIds) {
          const product = await client.getProduct(parseInt(id))
          importedProducts.push({
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            images: product.images,
          })
        }

        return NextResponse.json({
          success: true,
          imported: importedProducts,
          count: importedProducts.length,
        })
      }

      case 'sync_inventory': {
        // Sync inventory for a product
        const inventory = await client.getInventory(parseInt(productId))
        return NextResponse.json({
          success: true,
          productId,
          inventory,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Zendrop product action error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process action' },
      { status: 500 }
    )
  }
}
