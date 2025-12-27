// ============================================================================
// Reviews Service
// Handles product reviews and ratings
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Review interfaces
export interface ReviewInput {
  product_id: string;
  customer_id?: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  customer_name?: string;
}

export interface ReviewFilters {
  product_id?: string;
  customer_id?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  min_rating?: number;
  max_rating?: number;
  verified_purchase?: boolean;
}

export interface ReviewWithProduct {
  id: string;
  product_id: string;
  customer_id: string;
  order_id: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  status: string;
  customer_name: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    thumbnail_url: string;
  };
}

export interface ProductRatingSummary {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Create a new review
 */
export async function createReview(input: ReviewInput): Promise<{ success: boolean; review_id?: string; error?: string }> {
  try {
    // Validate rating
    if (input.rating < 1 || input.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    // Check if customer already reviewed this product
    if (input.customer_id) {
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', input.product_id)
        .eq('customer_id', input.customer_id)
        .single();

      if (existingReview) {
        return { success: false, error: 'You have already reviewed this product' };
      }

      // Check for verified purchase
      const { data: purchase } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', input.customer_id)
        .eq('product_id', input.product_id)
        .in('status', ['delivered', 'shipped'])
        .single();

      input.order_id = purchase?.id;
    }

    const reviewData = {
      product_id: input.product_id,
      customer_id: input.customer_id,
      order_id: input.order_id,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      pros: input.pros || [],
      cons: input.cons || [],
      images: input.images || [],
      customer_name: input.customer_name,
      verified_purchase: !!input.order_id,
      status: 'pending' // Require approval
    };

    const { data, error } = await supabase
      .from('product_reviews')
      .insert(reviewData)
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, review_id: data.id };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error: 'Failed to create review' };
  }
}

/**
 * Get reviews with filters and pagination
 */
export async function getReviews(
  filters: ReviewFilters,
  options: { page?: number; limit?: number; sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' } = {}
): Promise<{ reviews: ReviewWithProduct[]; total: number; page: number; totalPages: number }> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('product_reviews')
    .select(`
      *,
      products!inner(
        id,
        name,
        slug,
        thumbnail_url
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.product_id) {
    query = query.eq('product_id', filters.product_id);
  }
  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'approved'); // Default to approved for public view
  }
  if (filters.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }
  if (filters.max_rating) {
    query = query.lte('rating', filters.max_rating);
  }
  if (filters.verified_purchase !== undefined) {
    query = query.eq('verified_purchase', filters.verified_purchase);
  }

  // Apply sorting
  switch (options.sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest':
      query = query.order('rating', { ascending: true });
      break;
    case 'helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], total: 0, page: 1, totalPages: 0 };
  }

  const reviews = (data || []).map(review => ({
    ...review,
    products: Array.isArray(review.products) ? review.products[0] : review.products
  }));

  return {
    reviews,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

/**
 * Get product rating summary
 */
export async function getProductRatingSummary(productId: string): Promise<ProductRatingSummary> {
  // Get rating distribution
  const { data: distribution } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  const ratings = distribution?.map(r => r.rating) || [];
  const totalReviews = ratings.length;
  
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;

  for (const rating of ratings) {
    ratingCounts[rating as keyof typeof ratingCounts]++;
    ratingSum += rating;
  }

  const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

  return {
    product_id: productId,
    average_rating: Math.round(averageRating * 10) / 10,
    total_reviews: totalReviews,
    rating_distribution: ratingCounts
  };
}

/**
 * Approve a review (admin only)
 */
export async function approveReview(
  reviewId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error approving review:', error);
    return { success: false, error: 'Failed to approve review' };
  }
}

/**
 * Reject a review (admin only)
 */
export async function rejectReview(
  reviewId: string,
  reason: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting review:', error);
    return { success: false, error: 'Failed to reject review' };
  }
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .increment('helpful_count', 1)
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return { success: false, error: 'Failed to mark review as helpful' };
  }
}

/**
 * Report a review
 */
export async function reportReview(
  reviewId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .update({
        status: 'flagged',
        rejection_reason: reason
      })
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error reporting review:', error);
    return { success: false, error: 'Failed to report review' };
  }
}

/**
 * Get pending reviews for admin
 */
export async function getPendingReviews(
  options: { page?: number; limit?: number } = {}
): Promise<{ reviews: ReviewWithProduct[]; total: number }> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('product_reviews')
    .select(`
      *,
      products!inner(
        id,
        name,
        slug,
        thumbnail_url
      )
    `, { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching pending reviews:', error);
    return { reviews: [], total: 0 };
  }

  const reviews = (data || []).map(review => ({
    ...review,
    products: Array.isArray(review.products) ? review.products[0] : review.products
  }));

  return { reviews, total: count || 0 };
}

/**
 * Update review
 */
export async function updateReview(
  reviewId: string,
  updates: Partial<ReviewInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Only allow updating pending reviews
    const { data: existing } = await supabase
      .from('product_reviews')
      .select('status')
      .eq('id', reviewId)
      .single();

    if (!existing) {
      return { success: false, error: 'Review not found' };
    }

    if (existing.status !== 'pending') {
      return { success: false, error: 'Cannot update review after approval' };
    }

    const updateData: Record<string, any> = {};
    
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.comment !== undefined) updateData.comment = updates.comment;
    if (updates.pros !== undefined) updateData.pros = updates.pros;
    if (updates.cons !== undefined) updateData.cons = updates.cons;
    if (updates.images !== undefined) updateData.images = updates.images;

    const { error } = await supabase
      .from('product_reviews')
      .update(updateData)
      .eq('id', reviewId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error: 'Failed to update review' };
  }
}

/**
 * Delete review
 */
export async function deleteReview(
  reviewId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check ownership or admin
    let query = supabase.from('product_reviews').delete().eq('id', reviewId);
    
    if (!isAdmin) {
      query = query.eq('customer_id', userId);
    }

    const { error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: 'Failed to delete review' };
  }
}

/**
 * Get reviews statistics for admin dashboard
 */
export async function getReviewsStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  average_rating: number;
  this_month: number;
}> {
  const [total, pending, approved, rejected, thisMonth] = await Promise.all([
    supabase.from('product_reviews').select('id', { count: 'exact' }),
    supabase.from('product_reviews').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('product_reviews').select('id', { count: 'exact' }).eq('status', 'approved'),
    supabase.from('product_reviews').select('id', { count: 'exact' }).eq('status', 'rejected'),
    supabase.from('product_reviews')
      .select('rating', { count: 'exact' })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ]);

  // Get average rating
  const { data: ratings } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('status', 'approved');

  const avgRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    total: total.count || 0,
    pending: pending.count || 0,
    approved: approved.count || 0,
    rejected: rejected.count || 0,
    average_rating: Math.round(avgRating * 10) / 10,
    this_month: thisMonth.count || 0
  };
}

export default {
  createReview,
  getReviews,
  getProductRatingSummary,
  approveReview,
  rejectReview,
  markReviewHelpful,
  reportReview,
  getPendingReviews,
  updateReview,
  deleteReview,
  getReviewsStats
};
