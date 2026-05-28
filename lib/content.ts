import { supabaseAdmin } from './supabase';

export async function getContent(sectionKey: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('website_content')
      .select('*')
      .eq('section_key', sectionKey)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Content] Error fetching content:', error);
    return null;
  }
}

export async function getAllContent() {
  try {
    const { data, error } = await supabaseAdmin
      .from('website_content')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Content] Error fetching all content:', error);
    return [];
  }
}

export async function updateContent(
  sectionKey: string,
  {
    title,
    content,
    imageUrl,
  }: {
    title: string;
    content: string;
    imageUrl?: string;
  }
) {
  try {
    // Usar UPSERT (insert or update) para evitar conflictos
    const { data, error } = await supabaseAdmin
      .from('website_content')
      .upsert(
        {
          section_key: sectionKey,
          section_title: title,
          content,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'section_key',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Content] Error updating content:', error);
    throw error;
  }
}

export async function deleteContent(sectionKey: string) {
  try {
    const { error } = await supabaseAdmin
      .from('website_content')
      .delete()
      .eq('section_key', sectionKey);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Content] Error deleting content:', error);
    throw error;
  }
}
