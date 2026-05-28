import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/products';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { CreateCategorySchema } from '@/lib/schemas';

// GET: List all active categories
export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('[v0] Categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: String(error) },
      { status: 500 }
    );
  }
}

// POST: Create new category (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = CreateCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // SOLUCIÓN: Forzamos a que si icon_url es undefined, pase como null
    const category = await createCategory({
      ...validation.data,
      icon_url: validation.data.icon_url ?? null,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}