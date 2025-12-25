// Zendrop Sync Utilities - Sync products and inventory from Zendrop
import { ZendropClient, ZendropProduct } from '@/lib/zendrop'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface SyncResult {
  success: boolean
  synced: number
  errors: string[]
  timestamp: string
}

// Sync all products from Zendrop to database
export async function syncAllProducts(apiKey: string): Promise<SyncResult> {
  const client = new ZendropClient(apiKey)
  const result: SyncResult = {
    success: true,
    synced: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  }

  try {
    let page = 1
    const perPage = 100
    let hasMore = true

    while (hasMore) {
      const response = await client.getProducts({ page, per_page: perPage })
      
      for (const product of response.data) {
        try {
          await upsertProduct(product)
          result.synced++
        } catch (error) {
          result.errors.push(`Failed to sync product ${product.id}: ${error}`)
        }
      }

      hasMore = response.pagination.page < response.pagination.total_pages
      page++
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Sync failed: ${error}`)
    return result
  }
}

// Sync single product from Zendrop
export async function syncProduct(apiKey: string, zendropProductId: number): Promise<boolean> {
  const client = new ZendropClient(apiKey)
  
  try {
    const product = await client.getProduct(zendropProductId)
    await upsertProduct(product)
    return true
  } catch (error) {
    console.error(`Failed to sync product ${zendropProductId}:`, error)
    return false
  }
}

// Upsert product to Supabase
async function upsertProduct(product: ZendropProduct) {
  const productData = {
    name: product.name,
    description: product.description,
    price: product.price,
    compare_price: product.compare_at_price,
    images: product.images,
    category: product.category,
    sku: product.sku,
    inventory_count: product.inventory,
    weight: product.weight,
    dimensions: product.dimensions,
    is_active: product.inventory > 0,
    zendrop_id: product.id,
    zendrop_sku: product.sku,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('products')
    .upsert(
      { id: `zendrop_${product.id}`, ...productData },
      { onConflict: 'id' }
    )

  if (error) {
    throw new Error(`Supabase error: ${error.message}`)
  }
}

// Sync inventory for a single product
export async function syncInventory(apiKey: string, zendropProductId: number): Promise<number | null> {
  const client = new ZendropClient(apiKey)
  
  try {
    const inventory = await client.getInventory(zendropProductId)
    
    // Update in Supabase
    const { error } = await supabase
      .from('products')
      .update({
        inventory_count: inventory,
        is_active: inventory > 0,
        updated_at: new Date().toISOString(),
      })
      .eq('zendrop_id', zendropProductId)

    if (error) {
      throw new Error(`Failed to update inventory: ${error.message}`)
    }

    return inventory
  } catch (error) {
    console.error(`Failed to sync inventory for product ${zendropProductId}:`, error)
    return null
  }
}

// Sync all inventory (bulk update)
export async function syncAllInventory(apiKey: string): Promise<SyncResult> {
  const client = new ZendropClient(apiKey)
  const result: SyncResult = {
    success: true,
    synced: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  }

  try {
    // Get all products with zendrop_id
    const { data: products, error } = await supabase
      .from('products')
      .select('id, zendrop_id')
      .not('zendrop_id', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    for (const product of products || []) {
      if (product.zendrop_id) {
        try {
          const inventory = await client.getInventory(parseInt(product.zendrop_id))
          
          await supabase
            .from('products')
            .update({
              inventory_count: inventory,
              is_active: inventory > 0,
              updated_at: new Date().toISOString(),
            })
            .eq('id', product.id)

          result.synced++
        } catch (error) {
          result.errors.push(`Failed to sync inventory for product ${product.id}`)
        }
      }
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Bulk inventory sync failed: ${error}`)
    return result
  }
}

// Get sync status
export async function getSyncStatus(apiKey: string): Promise<{
  connected: boolean
  lastSync: string | null
  productCount: number
  account?: { name: string; plan: string }
}> {
  const client = new ZendropClient(apiKey)
  
  try {
    const verification = await client.verifyConnection()
    
    // Get last sync time from database
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'zendrop_last_sync')
      .single()

    const lastSync = settings?.value || null

    // Get product count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .not('zendrop_id', 'is', null)

    return {
      connected: verification.connected,
      lastSync,
      productCount: count || 0,
      account: verification.account,
    }
  } catch (error) {
    console.error('Failed to get sync status:', error)
    return {
      connected: false,
      lastSync: null,
      productCount: 0,
    }
  }
}

// Schedule periodic sync (for cron jobs)
export async function scheduleSync(apiKey: string): Promise<void> {
  const result = await syncAllProducts(apiKey)
  
  // Update last sync time
  await supabase
    .from('settings')
    .upsert({
      key: 'zendrop_last_sync',
      value: result.timestamp,
    }, { onConflict: 'key' })

  // Log sync result
  await supabase
    .from('sync_logs')
    .insert({
      provider: 'zendrop',
      type: 'full',
      status: result.success ? 'success' : 'failed',
      synced_count: result.synced,
      error_count: result.errors.length,
      errors: result.errors.length > 0 ? result.errors : null,
    })

  console.log(`Zendrop sync completed: ${result.synced} products synced, ${result.errors.length} errors`)
}
