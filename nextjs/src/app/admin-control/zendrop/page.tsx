'use client'

import { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download, 
  Upload,
  Settings,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface ZendropProduct {
  id: string
  zendrop_id: number
  name: string
  price: number
  images: string[]
  category: string
  inventory_count: number
  is_active: boolean
}

interface SyncStatus {
  connected: boolean
  lastSync: string | null
  productCount: number
  account?: {
    name: string
    plan: string
  }
}

interface SyncResult {
  success: boolean
  synced: number
  errors: string[]
  timestamp: string
}

export default function ZendropIntegration() {
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [products, setProducts] = useState<ZendropProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'sync' | 'settings'>('products')
  const [apiKey, setApiKey] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Fetch sync status on mount
  useEffect(() => {
    fetchStatus()
    fetchProducts()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/zendrop/sync?action=status')
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error('Failed to fetch status:', err)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/zendrop/products')
      const data = await response.json()
      if (data.success) {
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleFullSync = async () => {
    setSyncing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/zendrop/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full_sync' }),
      })
      
      const result: SyncResult = await response.json()
      
      if (result.success) {
        setSuccess(`Successfully synced ${result.synced} products`)
        fetchProducts()
        fetchStatus()
      } else {
        setError(`Sync failed: ${result.errors.join(', ')}`)
      }
    } catch (err) {
      setError('Sync operation failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleInventorySync = async () => {
    setSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/zendrop/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'inventory' }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess(`Inventory synced for ${result.synced} products`)
        fetchProducts()
      } else {
        setError('Inventory sync failed')
      }
    } catch (err) {
      setError('Inventory sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleImportSelected = async () => {
    if (selectedProducts.length === 0) {
      setError('Please select products to import')
      return
    }

    setSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/zendrop/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_products',
          productIds: selectedProducts,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess(`Imported ${result.synced} products`)
        setSelectedProducts([])
        fetchProducts()
      } else {
        setError('Import failed')
      }
    } catch (err) {
      setError('Import operation failed')
    } finally {
      setSyncing(false)
    }
  }

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Zendrop Integration</h1>
                <p className="text-sm text-slate-500">Sync products from Zendrop</p>
              </div>
            </div>
            <a
              href="https://app.zendrop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              Open Zendrop
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            {[
              { id: 'products', label: 'Products', icon: Download },
              { id: 'sync', label: 'Sync', icon: RefreshCw },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${status?.connected ? 'bg-green-100' : 'bg-red-100'}`}>
                {status?.connected ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">
                  {status?.connected ? 'Connected to Zendrop' : 'Not Connected'}
                </h3>
                {status?.account && (
                  <p className="text-sm text-slate-500">
                    {status.account.name} - {status.account.plan} Plan
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Last Sync</p>
              <p className="font-medium text-slate-900">{formatDate(status?.lastSync ?? null)}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-700">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-700">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Synced Products</h2>
                <p className="text-sm text-slate-500">{products.length} products imported from Zendrop</p>
              </div>
              <button
                onClick={handleImportSelected}
                disabled={selectedProducts.length === 0 || syncing}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import Selected ({selectedProducts.length})
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                <p className="mt-4 text-slate-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Download className="h-12 w-12 mx-auto text-slate-300" />
                <p className="mt-4 text-slate-500">No products synced yet</p>
                <button
                  onClick={handleFullSync}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Sync Products Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(products.map(p => p.id))
                            } else {
                              setSelectedProducts([])
                            }
                          }}
                          checked={selectedProducts.length === products.length}
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Product</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0] || '/placeholder.jpg'}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <span className="font-medium text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            product.inventory_count > 10
                              ? 'bg-green-100 text-green-700'
                              : product.inventory_count > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inventory_count} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.is_active ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500">
                              <XCircle className="h-4 w-4" />
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sync Tab */}
        {activeTab === 'sync' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Full Product Sync</h3>
                  <p className="text-sm text-slate-500">Sync all products from Zendrop</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                This will import all products from your Zendrop account to your store.
                Existing products will be updated.
              </p>
              <button
                onClick={handleFullSync}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {syncing ? 'Syncing...' : 'Start Full Sync'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Inventory Sync</h3>
                  <p className="text-sm text-slate-500">Update inventory levels</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                This will update inventory counts for all synced products from Zendrop.
                Useful for keeping stock levels accurate.
              </p>
              <button
                onClick={handleInventorySync}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {syncing ? 'Syncing...' : 'Update Inventory'}
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Zendrop Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Zendrop API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Zendrop API key"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Get your API key from{' '}
                  <a
                    href="https://app.zendrop.com/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Zendrop Settings &gt; API
                  </a>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-medium text-slate-900 mb-4">Webhook Configuration</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Webhook URL:</p>
                  <code className="block bg-white px-3 py-2 rounded border border-slate-200 text-sm">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/zendrop/webhook
                  </code>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Configure this URL in your{' '}
                  <a
                    href="https://app.zendrop.com/settings/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Zendrop Webhooks Settings
                  </a>
                </p>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem('zendrop_api_key', apiKey)
                  setSuccess('API key saved')
                  fetchStatus()
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
 
