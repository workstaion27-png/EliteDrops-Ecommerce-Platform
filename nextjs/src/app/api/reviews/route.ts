import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';
import { 
  createReview, 
  getReviews, 
  getProductRatingSummary, 
  approveReview, 
  rejectReview,
  markReviewHelpful,
  reportReview,
  getPendingReviews,
  getReviewsStats 
} from '@/lib/reviews-service';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as any;
    const minRating = parseInt(searchParams.get('min_rating') || '0');
    const sort = (searchParams.get('sort') as any) || 'newest';

    // If product_id provided, return reviews for that product
    if (productId) {
      const { reviews, total, page: currentPage, totalPages } = await getReviews(
        { product_id: productId, status: 'approved', min_rating: minRating },
        { page, limit, sort }
      );

      const ratingSummary = await getProductRatingSummary(productId);

      return NextResponse.json({
        success: true,
        reviews,
        summary: ratingSummary,
        pagination: { page: currentPage, limit, total, totalPages }
      });
    }

    // If no product_id, check if admin request
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (adminUser) {
        // Admin request - return pending reviews
        const { reviews, total } = await getPendingReviews({ page, limit });
        return NextResponse.json({ success: true, reviews, total, isAdmin: true });
      }

      // Regular user - get own reviews
      const { reviews, total, totalPages } = await getReviews(
        { customer_id: user.id },
        { page, limit }
      );
      return NextResponse.json({ success: true, reviews, pagination: { page, limit, total, totalPages } });
    }

    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST - Create review or admin action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    switch (action) {
      case 'create': {
        const result = await createReview({
          ...body,
          customer_id: user.id
        });
        return NextResponse.json(result);
      }

      case 'approve': {
        // Admin only
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (!adminUser) {
          return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const result = await approveReview(body.review_id, user.id);
        return NextResponse.json(result);
      }

      case 'reject': {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (!adminUser) {
          return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const result = await rejectReview(body.review_id, body.reason, user.id);
        return NextResponse.json(result);
      }

      case 'helpful': {
        const result = await markReviewHelpful(body.review_id);
        return NextResponse.json(result);
      }

      case 'report': {
        const result = await reportReview(body.review_id, body.reason);
        return NextResponse.json(result);
      }

      case 'stats': {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (!adminUser) {
          return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const stats = await getReviewsStats();
        return NextResponse.json({ success: true, stats });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
