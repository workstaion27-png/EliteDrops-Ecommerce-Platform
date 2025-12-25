// Zendrop Sync API Route - Manual and scheduled sync operations
import { NextRequest, NextResponse } from 'next/server'
import { 
  syncAllProducts, 
  syncProduct, 
  syncAllInventory,
  syncInventory,
  getSyncStatus,
  scheduleSync 
} from '@/lib/zendrop-sync'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase for auth check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return false
  }

  // Verify admin session/token
  const { data: session } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('token', authHeader.replace('Bearer ', ''))
    .single()

  return session?.is_valid === true
}

// ============ GET /api/zendrop/sync ============
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    // const isAuthenticated = await isAdmin(request)
    // if (!isAuthenticated) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const apiKey = process.env.ZENDROP_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Zendrop API key not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status': {
        // Get sync status
        const status = await getSyncStatus(apiKey)
        return NextResponse.json({
          success: true,
          ...status,
        })
      }

      case 'inventory': {
        // Sync inventory for specific product
        const productId = searchParams.get('product_id')
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID required' },
            { status: 400 }
          )
        }

        const inventory = await syncInventory(apiKey, parseInt(productId))
        return NextResponse.json({
          success: inventory !== null,
          product_id: productId,
          inventory,
        })
      }

      default: {
        // Get sync status
        const status = await getSyncStatus(apiKey)
        return NextResponse.json({
          success: true,
          ...status,
        })
      }
    }
  } catch (error) {
    console.error('Zendrop sync GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync operation failed' },
      { status: 500 }
    )
  }
}

// ============ POST /api/zendrop/sync ============
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    // const isAuthenticated = await isAdmin(request)
    // if (!isAuthenticated) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const apiKey = process.env.ZENDROP_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Zendrop API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { action, productId, productIds } = body

    switch (action) {
      case 'full_sync': {
        // Full product sync
        const result = await syncAllProducts(apiKey)
        return NextResponse.json({
          success: result.success,
          synced: result.synced,
          errors: result.errors,
          timestamp: result.timestamp,
        })
      }

      case 'single_product': {
        // Sync single product
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID required' },
            { status: 400 }
          )
        }

        const success = await syncProduct(apiKey, parseInt(productId))
        return NextResponse.json({
          success,
          product_id: productId,
        })
      }

      case 'bulk_products': {
        // Sync multiple products
        if (!productIds || !Array.isArray(productIds)) {
          return NextResponse.json(
            { error: 'Product IDs array required' },
            { status: 400 }
          )
        }

        const results = {
          synced: 0,
          failed: 0,
          errors: [] as string[],
        }

        for (const id of productIds) {
          const success = await syncProduct(apiKey, parseInt(id))
          if (success) {
            results.synced++
          } else {
            results.failed++
            results.errors.push(`Failed to sync product ${id}`)
          }
        }

        return NextResponse.json({
          success: results.failed === 0,
          ...results,
        })
      }

      case 'inventory': {
        // Full inventory sync
        const result = await syncAllInventory(apiKey)
        return NextResponse.json({
          success: result.success,
          synced: result.synced,
          errors: result.errors,
          timestamp: result.timestamp,
        })
      }

      case 'scheduled': {
        // Run scheduled sync (for cron jobs)
        await scheduleSync(apiKey)
        return NextResponse.json({
          success: true,
          message: 'Scheduled sync completed',
          timestamp: new Date().toISOString(),
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Zendrop sync POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync operation failed' },
      { status: 500 }
    )
  }
}
