import { NextRequest, NextResponse } from 'next/server'
import { cjAPI } from '@/lib/cjdropshipping'
import { StoreServices } from '@/lib/store-services'

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'search':
        return await handleProductSearch(data)
      
      case 'import':
        return await handleProductImport(data)
      
      case 'sync':
        return await handleProductSync(data)
      
      case 'categories':
        return await handleGetCategories()
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('CJ products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

async function handleProductSearch(data: { query?: string, category?: string, page?: number, limit?: number }) {
  try {
    const products = await cjAPI.getProducts({
      page: data.page || 1,
      limit: data.limit || 20,
      keyword: data.query,
      categoryId: data.category
    })
    
    return NextResponse.json({ 
      success: true, 
      products 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search products' }, 
      { status: 500 }
    )
  }
}

async function handleProductImport(data: { cjProductId: string }) {
  try {
    const product = await StoreServices.syncProductFromCJ(data.cjProductId)
    
    return NextResponse.json({ 
      success: true, 
      product 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to import product' }, 
      { status: 500 }
    )
  }
}

async function handleProductSync(data: { cjProductId?: string, bulkSync?: boolean, params?: any }) {
  try {
    if (data.bulkSync) {
      // Bulk sync multiple products
      const syncResults = await StoreServices.syncProductsFromCJ(data.params || {})
      
      return NextResponse.json({ 
        success: true, 
        results: syncResults,
        summary: {
          total: syncResults.length,
          successful: syncResults.filter(r => r.success).length,
          failed: syncResults.filter(r => !r.success).length
        }
      })
    } else if (data.cjProductId) {
      // Sync single product
      const product = await StoreServices.syncProductFromCJ(data.cjProductId)
      
      return NextResponse.json({ 
        success: true, 
        product 
      })
    } else {
      return NextResponse.json(
        { error: 'Either cjProductId or bulkSync must be provided' }, 
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sync product(s)' }, 
      { status: 500 }
    )
  }
}

async function handleGetCategories() {
  try {
    const categories = await StoreServices.getCJCategories()
    
    return NextResponse.json({ 
      success: true, 
      categories 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get categories' }, 
      { status: 500 }
    )
  }
}

// Test CJ connection endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'test-connection':
      try {
        const isConnected = await StoreServices.testCJConnection()
        return NextResponse.json({ 
          success: true, 
          connected: isConnected 
        })
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to test connection' }, 
          { status: 500 }
        )
      }
    
    case 'categories':
      return await handleGetCategories()
    
    default:
      return NextResponse.json({
        message: 'CJ Products Sync API',
        availableActions: ['test-connection', 'categories', 'search', 'import', 'sync']
      })
  }
}