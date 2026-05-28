import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getFeaturedProducts, toggleFeatured } from '@/lib/featured-products';

// GET: Obtener productos destacados
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    const products = await getFeaturedProducts(limit);
    return NextResponse.json(products);
  } catch (error) {
    console.error('[API] Error en GET featured products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos destacados' },
      { status: 500 }
    );
  }
}

// PATCH: Cambiar estado destacado
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { productId, isFeatured } = await request.json();
    const product = await toggleFeatured(productId, isFeatured);

    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
