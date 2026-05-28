import { supabaseAdmin } from './supabase';

/**
 * Get all reviews for a product with average rating
 */
export async function getProductReviews(
  productId: string,
  { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  try {
    const { data, error, count } = await supabaseAdmin
      .from('reviews')
      .select('*, users(full_name)', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const avgRating =
      data && data.length > 0
        ? data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length
        : 0;

    return {
      reviews: data || [],
      count: count || 0,
      average_rating: parseFloat(avgRating.toFixed(1)),
      rating_distribution: getRatingDistribution(data || []),
    };
  } catch (error) {
    console.error('[Reviews] Error fetching reviews:', error);
    throw error;
  }
}

/**
 * Submit a new product review
 */
export async function submitReview(
  productId: string,
  userId: string,
  {
    rating,
    title,
    comment,
    isVerifiedPurchase = false,
  }: {
    rating: number;
    title: string;
    comment?: string;
    isVerifiedPurchase?: boolean;
  }
) {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Calificación debe estar entre 1 y 5');
    }

    // Check if user already has a review for this product
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new Error('Ya tienes una reseña para este producto');
    }

    // Create review
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating: Math.max(1, Math.min(5, rating)),
        title,
        comment: comment || '',
        is_verified_purchase: isVerifiedPurchase,
      })
      .select('*, users(full_name)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Reviews] Error submitting review:', error);
    throw error;
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  {
    rating,
    title,
    comment,
  }: {
    rating?: number;
    title?: string;
    comment?: string;
  }
) {
  try {
    // Verify ownership
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review || review.user_id !== userId) {
      throw new Error('No autorizado para actualizar esta reseña');
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (rating !== undefined) updates.rating = Math.max(1, Math.min(5, rating));
    if (title !== undefined) updates.title = title;
    if (comment !== undefined) updates.comment = comment;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Reviews] Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string, userId: string) {
  try {
    // Verify ownership
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review || review.user_id !== userId) {
      throw new Error('No autorizado para eliminar esta reseña');
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Reviews] Error deleting review:', error);
    throw error;
  }
}

/**
 * Get rating distribution for a product
 */
function getRatingDistribution(reviews: any[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    distribution[r.rating as keyof typeof distribution]++;
  });
  return distribution;
}
