'use client'

import { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingData, setTrackingData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Mock tracking data - in real app, this would come from API
  const mockTrackingData = {
    orderNumber: 'LH-2024-001234',
    status: 'shipped',
    estimatedDelivery: '2025-12-25',
    carrier: 'Express Shipping',
    trackingNumber: 'LH123456789US',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    timeline: [
      {
        status: 'Order Placed',
        description: 'Your order has been confirmed',
        timestamp: '2025-12-20 14:30',
        completed: true,
        icon: CheckCircle
      },
      {
        status: 'Processing',
        description: 'Your order is being prepared for shipment',
        timestamp: '2025-12-20 16:45',
        completed: true,
        icon: Package
      },
      {
        status: 'Shipped',
        description: 'Your package is on its way',
        timestamp: '2025-12-21 09:15',
        completed: true,
        icon: Truck
      },
      {
        status: 'In Transit',
        description: 'Package is moving through shipping facilities',
        timestamp: '2025-12-21 15:20',
        completed: true,
        icon: MapPin
      },
      {
        status: 'Out for Delivery',
        description: 'Package is out for delivery today',
        timestamp: '2025-12-24 08:00',
        completed: false,
        icon: Truck
      },
      {
        status: 'Delivered',
        description: 'Package has been delivered',
        timestamp: 'Expected: 2025-12-24 18:00',
        completed: false,
        icon: CheckCircle
      }
    ]
  }

  const handleTrackOrder = async () => {
    if (!trackingNumber.trim()) return
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setTrackingData(mockTrackingData)
      setLoading(false)
    }, 1500)
  }

  const getCurrentStep = () => {
    return trackingData?.timeline.findIndex(step => !step.completed)
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order number or tracking number to get real-time updates on your package delivery.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number or Tracking Number
              </label>
              <input
                id="tracking"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g., LH-2024-001234 or LH123456789US"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              />
            </div>
            <div className="md:pt-6">
              <button
                onClick={handleTrackOrder}
                disabled={loading || !trackingNumber.trim()}
                className="w-full md:w-auto px-8 py-3 bg-luxury-gold text-white font-semibold rounded-lg hover:bg-luxury-dark-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Order {trackingData.orderNumber}</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {trackingData.status}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
                  <div className="text-gray-700">
                    <p>{trackingData.shippingAddress.name}</p>
                    <p>{trackingData.shippingAddress.street}</p>
                    <p>{trackingData.shippingAddress.city}, {trackingData.shippingAddress.state} {trackingData.shippingAddress.zip}</p>
                    <p>{trackingData.shippingAddress.country}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Delivery Details</h3>
                  <div className="text-gray-700">
                    <p><span className="font-medium">Carrier:</span> {trackingData.carrier}</p>
                    <p><span className="font-medium">Tracking Number:</span> {trackingData.trackingNumber}</p>
                    <p><span className="font-medium">Estimated Delivery:</span> {trackingData.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Package Tracking</h2>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-8">
                  {trackingData.timeline.map((step, index) => (
                    <div key={index} className="relative flex items-start">
                      {/* Step Icon */}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : index === getCurrentStep() 
                            ? 'bg-luxury-gold text-white animate-pulse'
                            : 'bg-gray-200 text-gray-400'
                      }`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      
                      {/* Step Content */}
                      <div className="ml-6 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-semibold ${
                            step.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.status}
                          </h3>
                          <span className={`text-sm ${
                            step.completed ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.timestamp}
                          </span>
                        </div>
                        <p className={`mt-1 ${
                          step.completed ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                        
                        {/* Current Step Indicator */}
                        {index === getCurrentStep() && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-luxury-gold text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              Current Status
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Live Tracking Map</h3>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive map will be available once package is in transit</p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-luxury-light-gold rounded-lg p-6">
              <h3 className="text-lg font-bold text-luxury-black mb-2">Need Help?</h3>
              <p className="text-luxury-dark-gold mb-4">
                If you have questions about your order or delivery, our customer service team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:support@luxuryhub.com" 
                  className="px-4 py-2 bg-luxury-gold text-white font-medium rounded-lg hover:bg-luxury-dark-gold transition-colors text-center"
                >
                  Email Support
                </a>
                <a 
                  href="tel:1-800-LUXURY-HUB" 
                  className="px-4 py-2 border border-luxury-gold text-luxury-gold font-medium rounded-lg hover:bg-luxury-gold hover:text-white transition-colors text-center"
                >
                  Call 1-800-LUXURY-HUB
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}