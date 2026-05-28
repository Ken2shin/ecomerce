import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitReview } from '@/lib/reviews';
import { CreateReviewSchema } from '@/lib/schemas';

// POST: Submit a review
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = CreateReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { product_id, rating, title, comment } = validation.data;

    const review = await submitReview(product_id, user.id, {
      rating,
      title,
      comment,
      isVerifiedPurchase: false, // TODO: Check if user purchased product
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
