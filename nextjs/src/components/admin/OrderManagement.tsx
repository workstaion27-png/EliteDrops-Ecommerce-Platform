'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Truck, 
  Package, 
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  customer_id: string
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string
  tracking_number?: string
  cj_order_id?: string
  created_at: string
  customers?: {
    first_name: string
    last_name: string
    email: string
  }
  order_items?: Array<{
    id: string
    quantity: number
    price: number
    products: {
      name: string
    }
  }>
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      const data = await response.json()
      if (data.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ))
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const createCJOrder = async (orderId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders/cj-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', orderId })
      })
      const data = await response.json()
      if (data.success) {
        alert('Order sent to CJdropshipping successfully!')
        fetchOrders() // Refresh to get updated data
      }
    } catch (error) {
      console.error('Error creating CJ order:', error)
      alert('Failed to send order to CJdropshipping')
    } finally {
      setLoading(false)
    }
  }

  const syncOrderStatus = async (orderId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders/cj-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', orderId })
      })
      const data = await response.json()
      if (data.success) {
        alert('Order status synced successfully!')
        fetchOrders()
      }
    } catch (error) {
      console.error('Error syncing order status:', error)
      alert('Failed to sync order status')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.customers?.first_name} ${order.customers?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || order.status === statusFilter
    const matchesPayment = !paymentFilter || order.payment_status === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'shipped': return <Truck className="h-4 w-4 text-blue-600" />
      case 'processing': return <Package className="h-4 w-4 text-yellow-600" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order # or Customer name..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        {order.cj_order_id && (
                          <div className="text-xs text-blue-600">
                            CJ: {order.cj_order_id}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customers?.first_name} {order.customers?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customers?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowOrderModal(true)
                          }}
                          className="text-amber-600 hover:text-amber-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Mark Processing"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {order.status === 'processing' && !order.cj_order_id && (
                          <button
                            onClick={() => createCJOrder(order.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Send to CJdropshipping"
                          >
                            <Truck className="h-4 w-4" />
                          </button>
                        )}
                        {order.cj_order_id && (
                          <button
                            onClick={() => syncOrderStatus(order.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Sync Status"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Order Details - {selectedOrder.order_number}
              </h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Name:</strong> {selectedOrder.customers?.first_name} {selectedOrder.customers?.last_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customers?.email}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CJdropshipping Info */}
              {selectedOrder.cj_order_id && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">CJdropshipping</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p><strong>CJ Order ID:</strong> {selectedOrder.cj_order_id}</p>
                    {selectedOrder.tracking_number && (
                      <p><strong>Tracking Number:</strong> {selectedOrder.tracking_number}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => syncOrderStatus(selectedOrder.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Sync Status
                      </button>
                      <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50">
                        View on CJ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                <div className="flex gap-2">
                  {['pending', 'processing', 'shipped', 'delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, status as Order['status'])
                        setSelectedOrder({ ...selectedOrder, status: status as Order['status'] })
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedOrder.status === status
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}