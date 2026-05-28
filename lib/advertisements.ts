import { supabaseAdmin } from './supabase';

export async function getActiveAdvertisements() {
  try {
    const { data, error } = await supabaseAdmin
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Ads] Error fetching advertisements:', error);
    return [];
  }
}

export async function getAllAdvertisements() {
  try {
    const { data, error } = await supabaseAdmin
      .from('advertisements')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Ads] Error fetching all advertisements:', error);
    return [];
  }
}

export async function createAdvertisement({
  title,
  imageUrl,
  linkUrl,
  description,
  position = 0,
}: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  description?: string;
  position?: number;
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('advertisements')
      .insert({
        title,
        image_url: imageUrl,
        link_url: linkUrl,
        description,
        position,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Ads] Error creating advertisement:', error);
    throw error;
  }
}

export async function updateAdvertisement(
  adId: string,
  {
    title,
    imageUrl,
    linkUrl,
    description,
    position,
    isActive,
  }: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    description?: string;
    position?: number;
    isActive?: boolean;
  }
) {
  try {
    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (linkUrl !== undefined) updates.link_url = linkUrl;
    if (description !== undefined) updates.description = description;
    if (position !== undefined) updates.position = position;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabaseAdmin
      .from('advertisements')
      .update(updates)
      .eq('id', adId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Ads] Error updating advertisement:', error);
    throw error;
  }
}

export async function deleteAdvertisement(adId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('advertisements')
      .delete()
      .eq('id', adId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Ads] Error deleting advertisement:', error);
    throw error;
  }
}
