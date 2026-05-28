import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// GET: Get user's favorite products
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ data: [], count: 0 }, { status: 200 });
    }

    const { data, error, count } = await supabase
      .from('user_favorites')
      .select(`
        *,
        product:product_id (
          id,
          name,
          slug,
          description,
          price,
          discount_price,
          images,
          is_active
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching favorites:', error);
      // Return empty array on error instead of failing
      return NextResponse.json({ data: [], count: 0 }, { status: 200 });
    }

    // Filter out favorites where the product no longer exists or is inactive
    const validFavorites = (data || [])
      .filter((fav: any) => fav.product && fav.product.is_active)
      .map((fav: any) => ({
        id: fav.id,
        product_id: fav.product_id,
        created_at: fav.created_at,
        product: {
          ...fav.product,
          nombre: fav.product.name,
          descripcion: fav.product.description,
          precio: fav.product.discount_price || fav.product.price,
          precio_original: fav.product.discount_price ? fav.product.price : null,
          imagen_url: fav.product.images?.[0] || '',
        },
      }));

    return NextResponse.json({
      data: validFavorites,
      count: validFavorites.length,
    }, { status: 200 });
  } catch (error) {
    console.error('[v0] Favorites GET error:', error);
    return NextResponse.json({ data: [], count: 0 }, { status: 200 });
  }
}

// POST: Add product to favorites
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already in favorites' }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        product_id,
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] Error adding favorite:', error);
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[v0] Favorites POST error:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 400 });
  }
}

// DELETE: Remove product from favorites
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('[v0] Error removing favorite:', error);
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Removed from favorites' }, { status: 200 });
  } catch (error) {
    console.error('[v0] Favorites DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 400 });
  }
}
