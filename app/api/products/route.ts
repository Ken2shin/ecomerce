import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/products';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { CreateProductSchema } from '@/lib/schemas';

// GET: List all active products with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
    const sort = searchParams.get('sort') || 'relevancia';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getProducts({
      categoryId: categoryId || undefined,
      search: search || undefined,
      featured,
      minPrice,
      maxPrice,
      sort,
      limit,
      offset,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API] Products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: String(error) },
      { status: 500 }
    );
  }
}

// POST: Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const product = await createProduct({
      ...validation.data,
      discount_price: validation.data.discount_price ?? null,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[API] Products POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
