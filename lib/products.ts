import { supabase, supabaseAdmin } from './supabase';
import { Product, Category, ProductReview } from '@/types/database';

/**
 * Get all active categories
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    
    // Mapeo adaptado a tu esquema SQL
    const mappedCategories = data?.map((cat: any) => ({
      ...cat,
      nombre: cat.name || '',
      descripcion: cat.description || ''
    }));

    return mappedCategories as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    
    const mappedCategory = {
      ...data,
      nombre: data.name || '',
      descripcion: data.description || ''
    };

    return mappedCategory as Category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

/**
 * Get all active products with optional filtering
 */
export async function getProducts({
  categoryId,
  search,
  featured,
  minPrice,
  maxPrice,
  sort = 'relevancia',
  limit = 20,
  offset = 0,
}: {
  categoryId?: string;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (search) {
      // Búsqueda en las columnas reales de tu SQL
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Fetch all matching products first, then filter by price in JavaScript
    // This is because Supabase doesn't easily support filtering on computed columns
    const { data: allData, error, count: totalCount } = await query
      .order(
        sort === 'precio_asc' ? 'price' : 
        sort === 'precio_desc' ? 'price' :
        'created_at',
        { 
          ascending: sort === 'precio_asc' ? true : sort === 'precio_desc' ? false : false 
        }
      );

    if (error) throw error;

    // Map and filter by price in memory
    const safeData = (allData || [])
      .map((item: any) => {
        // Si hay descuento, el precio actual es discount_price y el original es price
        const currentPrice = item.discount_price ? Number(item.discount_price) : Number(item.price);
        const originalPrice = item.discount_price ? Number(item.price) : null;
        
        const discountPercent = item.discount_price 
          ? Math.round(((Number(item.price) - Number(item.discount_price)) / Number(item.price)) * 100)
          : 0;

        return {
          ...item,
          nombre: item.name || '',
          descripcion: item.description || '',
          precio: currentPrice,
          precio_original: originalPrice,
          descuento: discountPercent,
          // Tu SQL usa un array TEXT[] para imágenes
          imagen_url: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '',
          stock: item.stock_quantity || 0,
        };
      })
      .filter((product: any) => {
        // Filter by price range
        if (minPrice !== undefined && product.precio < minPrice) return false;
        if (maxPrice !== undefined && product.precio > maxPrice) return false;
        return true;
      })
      .slice(offset, offset + limit);

    return {
      data: safeData as Product[],
      count: (allData || []).length,
    };
  } catch (error) {
    console.error('[v0] Error fetching products:', error);
    throw error;
  }
}

/**
 * Get product by ID or slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:category_id (id, name, slug),
        product_reviews (id, rating)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    const reviews = data.product_reviews || [];
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

    const { product_reviews, ...item } = data;
    
    // Mapeo idéntico para producto individual
    const currentPrice = item.discount_price ? Number(item.discount_price) : Number(item.price);
    const originalPrice = item.discount_price ? Number(item.price) : null;
    const discountPercent = item.discount_price 
      ? Math.round(((Number(item.price) - Number(item.discount_price)) / Number(item.price)) * 100)
      : 0;
    
    return {
      ...item,
      nombre: item.name || '',
      descripcion: item.description || '',
      precio: currentPrice,
      precio_original: originalPrice,
      descuento: discountPercent,
      imagen_url: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '',
      stock: item.stock_quantity || 0,
      rating_avg: avgRating,
      review_count: reviews.length,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Get product reviews
 */
export async function getProductReviews(productId: string, limit = 10, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('product_reviews')
      .select(`*, user:user_id (id, full_name, avatar_url)`, { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data as (ProductReview & { user: { id: string; full_name: string; avatar_url: string | null } })[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

/**
 * Create product (Admin only)
 */
export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabaseAdmin.from('products').insert([productData]).select().single();
    if (error) throw error;
    return data as Product;
  } catch (error) {
    throw error;
  }
}

export async function updateProduct(productId: string, productData: Partial<Product>) {
  try {
    const { data, error } = await supabaseAdmin.from('products').update(productData).eq('id', productId).select().single();
    if (error) throw error;
    return data as Product;
  } catch (error) {
    throw error;
  }
}

export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
}

export async function createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabaseAdmin.from('categories').insert([categoryData]).select().single();
    if (error) throw error;
    return data as Category;
  } catch (error) {
    throw error;
  }
}

export async function updateCategory(categoryId: string, categoryData: Partial<Category>) {
  try {
    const { data, error } = await supabaseAdmin.from('categories').update(categoryData).eq('id', categoryId).select().single();
    if (error) throw error;
    return data as Category;
  } catch (error) {
    throw error;
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', categoryId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
}
