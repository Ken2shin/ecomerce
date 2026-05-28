import { NextRequest, NextResponse } from 'next/server';
import { getProductReviews } from '@/lib/reviews';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const reviews = await getProductReviews(id, { limit, offset });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Get user from session
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // This will be handled by the main reviews endpoint
    return NextResponse.json(
      { error: 'Please use POST /api/reviews' },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
