import { supabaseAdmin } from './supabase';

export async function getActivePublications(limit = 10) {
  try {
    const { data, error } = await supabaseAdmin
      .from('publications')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Publicaciones] Error al obtener publicaciones:', error);
    return [];
  }
}

export async function getAllPublications() {
  try {
    const { data, error } = await supabaseAdmin
      .from('publications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Publicaciones] Error al obtener todas las publicaciones:', error);
    return [];
  }
}

export async function createPublication({
  title,
  description,
  imageUrl,
  link,
  position,
  isActive = true,
}: {
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  position?: number;
  isActive?: boolean;
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('publications')
      .insert({
        title,
        description: description || '',
        image_url: imageUrl,
        link: link || '#',
        position: position || 0,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Publicaciones] Error al crear publicación:', error);
    throw error;
  }
}

export async function updatePublication(
  id: string,
  {
    title,
    description,
    imageUrl,
    link,
    position,
    isActive,
  }: {
    title?: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    position?: number;
    isActive?: boolean;
  }
) {
  try {
    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (link !== undefined) updates.link = link;
    if (position !== undefined) updates.position = position;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabaseAdmin
      .from('publications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Publicaciones] Error al actualizar publicación:', error);
    throw error;
  }
}

export async function deletePublication(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('publications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Publicaciones] Error al eliminar publicación:', error);
    throw error;
  }
}
