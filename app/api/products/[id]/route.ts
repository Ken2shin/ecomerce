import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { UpdateProductSchema } from '@/lib/schemas';
import { Product } from '@/types/database';

// Tipos locales para ayudar a TypeScript con la respuesta de Supabase
interface ProductReviewShort {
  id: string;
  rating: number;
}

// GET: Fetch product by ID with reviews
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // En Next.js 15+, params es una promesa que debe resolverse
    const { id } = await params;

    const { data: product, error } = await supabase
      .from('products')
      .select(
        `
        *,
        category:category_id (id, name, slug),
        product_reviews (
          id,
          rating
        )
        `
      )
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Aseguramos el tipado correcto para evitar el uso de 'any'
    const reviews: ProductReviewShort[] = product.product_reviews || [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: ProductReviewShort) => sum + r.rating, 0) / reviews.length
        : 0;

    // Removemos la propiedad raw de reviews y anexamos los calculados que espera el frontend
    const { product_reviews, ...rest } = product;
    const productWithRatings = {
      ...rest,
      rating_avg: avgRating,
      review_count: reviews.length,
    };

    return NextResponse.json(productWithRatings, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// PUT: Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input using the provided Zod schema (or similar)
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 400 }
      );
    }

    return NextResponse.json(product as Product, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// DELETE: Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}