import { supabaseAdmin } from './supabase';

export async function getFeaturedProducts(limit = 8) {
  try {
    const { data, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('is_featured', true)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Destacados] Error al obtener productos destacados:', error);
    return [];
  }
}

export async function toggleFeatured(productId: string, isFeatured: boolean) {
  try {
    const { data, error } = await supabaseAdmin
      .from('productos')
      .update({ is_featured: isFeatured })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Destacados] Error al actualizar estado destacado:', error);
    throw error;
  }
}

export async function setFeaturedPosition(productId: string, position: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('productos')
      .update({ featured_position: position })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Destacados] Error al actualizar posición:', error);
    throw error;
  }
}
