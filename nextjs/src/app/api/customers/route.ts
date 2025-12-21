import { NextRequest, NextResponse } from 'next/server';
import { StoreServices } from '@/lib/store-services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // This would need to be implemented in StoreServices
    const customers = []; // Placeholder - implement getCustomers in StoreServices
    
    return NextResponse.json({
      success: true,
      customers,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        count: customers.length
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    
    // Validate required fields
    if (!customerData.email || !customerData.first_name || !customerData.last_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, first_name, last_name' },
        { status: 400 }
      );
    }

    const customer = await StoreServices.createCustomer(customerData);
    
    return NextResponse.json({
      success: true,
      customer
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}