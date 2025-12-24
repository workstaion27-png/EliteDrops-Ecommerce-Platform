import { NextRequest, NextResponse } from 'next/server'
import { cjAPI } from '@/lib/cjdropshipping'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (!query) {
    return NextResponse.json({
      success: false,
      error: 'Search query is required'
    }, { status: 400 })
  }

  try {
    const products = await cjAPI.getProducts({
      page,
      limit,
      keyword: query
    })

    return NextResponse.json({
      success: true,
      data: products,
      page,
      limit
    })
  } catch (error: any) {
    console.error('CJ Search Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to search CJ products'
    }, { status: 500 })
  }
}
