export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">LuxuryHub Admin Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-600">1,247</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">$45,892</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Products</h3>
            <p className="text-2xl font-bold text-purple-600">156</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-900">Customers</h3>
            <p className="text-2xl font-bold text-orange-600">892</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>#1234 - Premium Watch - John Doe - $299.99</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">Shipped</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>#1235 - Luxury Bag - Jane Smith - $599.99</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">Processing</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>#1236 - Designer Sunglasses - Mike Johnson - $199.99</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}