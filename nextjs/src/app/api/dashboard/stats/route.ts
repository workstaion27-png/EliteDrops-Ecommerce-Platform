import { NextRequest, NextResponse } from 'next/server';
import { StoreServices } from '@/lib/store-services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';

    switch (type) {
      case 'stats':
        return await getDashboardStats();
      
      case 'orders':
        return await getOrderStats();
      
      case 'revenue':
        return await getRevenueStats();
      
      default:
        return NextResponse.json(
          { error: 'Invalid stats type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

async function getDashboardStats() {
  try {
    const stats = await StoreServices.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    throw error;
  }
}

async function getOrderStats() {
  try {
    // Get recent orders
    const orders = await StoreServices.getOrders({ limit: 100 });
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      thisMonth: orders.filter(o => {
        const orderDate = new Date(o.created_at);
        const thisMonth = new Date();
        return orderDate.getMonth() === thisMonth.getMonth() && 
               orderDate.getFullYear() === thisMonth.getFullYear();
      }).length
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    throw error;
  }
}

async function getRevenueStats() {
  try {
    const orders = await StoreServices.getOrders({
      payment_status: 'paid',
      limit: 100
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // Calculate monthly revenue
    const monthlyRevenue: { [key: string]: number } = {};
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.total_amount;
    });
    
    const stats = {
      total: totalRevenue,
      thisMonth: Object.values(monthlyRevenue).slice(-1)[0] || 0,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      monthlyRevenue
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    throw error;
  }
}