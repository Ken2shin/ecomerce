'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star, Heart, Share2, ChevronLeft, MessageSquare } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  image_url?: string;
  rating_avg?: number;
  review_count?: number;
  stock?: number;
  cantidad?: number;       // Alias de soporte para stock
  stock_quantity?: number; // Alias de soporte para stock
  category?: { id: string; name: string; slug: string };
}

interface Review {
  id: string;
  usuario: string;
  rating: number;
  titulo: string;
  contenido: string;
  fecha: string;
  helpful_count?: number;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    titulo: '',
    contenido: '',
  });
  const [quantity, setQuantity] = useState(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Determinar el valor real del stock soportando múltiples variantes de nombres
  const currentStock = product?.stock ?? product?.cantidad ?? product?.stock_quantity;

  useEffect(() => {
    if (!productId) return;

    const loadAll = async () => {
      await Promise.all([loadProduct(productId), loadReviews(productId)]);
    };

    loadAll();
  }, [productId]);

  async function loadProduct(id: string) {
    try {
      setError('');
      const response = await fetch(`/api/products/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[v0] Product data fetched from API:', data);
        setProduct(data);
      } else if (response.status === 404) {
        setError('Producto no encontrado');
        setProduct(null);
      } else {
        console.warn(`[v0] Product fetch returned ${response.status}, may have missing data`);
        setError('No se pudo obtener la información completa del producto.');
        setProduct(null);
      }
    } catch (error) {
      console.error('[v0] Error loading product:', error);
      setError('Error al cargar el producto. Por favor, intenta de nuevo.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews(id: string) {
    try {
      setLoadingReviews(true);
      const response = await fetch(`/api/products/${id}/reviews`);
      
      if (response.ok) {
        const data = await response.json();
        const reviewsList = Array.isArray(data) ? data : data?.data || [];
        setReviews(reviewsList);
        console.log('[v0] Reviews loaded count:', reviewsList.length);
      } else if (response.status === 404) {
        console.log('[v0] No reviews available for product');
        setReviews([]);
      } else {
        console.warn('[v0] Reviews fetch failed, showing empty state');
        setReviews([]);
      }
    } catch (error) {
      console.error('[v0] Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        setNewReview({ rating: 5, titulo: '', contenido: '' });
        setShowReviewForm(false);
        await loadReviews(productId);
      }
    } catch (error) {
      console.error('[v0] Error submitting review:', error);
    }
  }

  function addToCart() {
    if (!product || typeof product?.price !== 'number') {
      alert('No se puede añadir el producto al carrito: precio no disponible');
      return;
    }

    if (currentStock !== undefined && currentStock <= 0) {
      alert('No hay stock disponible');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      quantity: quantity,
      cantidad: quantity, // Soportando ambas estructuras de propiedades de carritos
      image_url: product.image_url || product.images?.[0],
    };

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item: any) => item.id === product.id);

      if (existing) {
        const baseQty = existing.quantity ?? existing.cantidad ?? 0;
        existing.quantity = baseQty + quantity;
        existing.cantidad = existing.quantity;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Producto añadido al carrito');
    } catch (err) {
      console.error('[v0] Error adding to cart:', err);
      alert('Error al añadir al carrito. Por favor, intenta de nuevo.');
    }
  }

  // Calcular porcentajes reales para las barras de valoración para evitar Math.random()
  const getRatingPercentage = (stars: number) => {
    if (reviews.length === 0) return 0;
    const matchingReviews = reviews.filter(r => Math.round(r.rating) === stars);
    return (matchingReviews.length / reviews.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">
            {error.includes('no encontrado') 
              ? 'El producto que buscas no está disponible.' 
              : 'Hubo un problema al cargar el producto. Por favor, intenta de nuevo.'}
          </p>
          <Link href="/productos">
            <Button className="bg-amber-700 hover:bg-amber-800">Volver a Productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/productos" className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition">
            <ChevronLeft className="w-5 h-5" />
            <span>Volver a Productos</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-8 h-96 flex items-center justify-center relative sticky top-24">
              {product?.image_url || product?.images?.[0] ? (
                <img
                  src={product.image_url || product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="text-8xl">🥤</div>
              )}

              <button className="absolute top-4 right-4 bg-white p-3 rounded-full shadow hover:shadow-lg transition">
                <Heart className="w-6 h-6 text-red-500" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product?.name || 'Sin nombre'}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product?.rating_avg || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <span className="text-gray-600">
                  {product?.rating_avg?.toFixed(1) || '0.0'} ({product?.review_count || 0} reseñas)
                </span>
              </div>

              <div className="text-4xl font-bold text-amber-700 mb-6">
                {typeof product?.price === 'number' 
                  ? formatPrice(product.price)
                  : 'Precio no disponible'}
              </div>

              <p className="text-gray-700 text-lg mb-8">{product?.description || 'Sin descripción disponible'}</p>

              <div className="mb-8">
                {currentStock !== undefined && currentStock > 0 ? (
                  <span className="text-green-600 font-bold">
                    ✓ Disponible
                  </span>
                ) : currentStock === 0 ? (
                  <span className="text-red-600 font-bold">Agotado</span>
                ) : (
                  <span className="text-gray-600">Stock disponible</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium text-gray-700">Cantidad:</label>
                  <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-gray-600 hover:text-gray-900 font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(currentStock ? Math.min(currentStock, quantity + 1) : quantity + 1)}
                      className="text-gray-600 hover:text-gray-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={addToCart}
                    disabled={!product || typeof product?.price !== 'number' || currentStock === 0}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-700 font-bold py-4 rounded-lg transition"
                  >
                    {!product ? 'Cargando...' : 'Agregar al Carrito'}
                  </button>

                  <button
                    onClick={() => {
                      addToCart();
                      setIsCheckingOut(true);
                      // Redirect to checkout after adding to cart
                      setTimeout(() => {
                        window.location.href = '/checkout';
                      }, 300);
                    }}
                    disabled={!product || typeof product?.price !== 'number' || currentStock === 0}
                    className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition"
                  >
                    {currentStock === 0 ? 'Agotado' : 'Comprar Ahora'}
                  </button>
                </div>

                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 mt-4">
                  <Share2 className="w-5 h-5" />
                  Compartir Producto
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Valoración</h2>

            <div className="mb-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {product?.rating_avg?.toFixed(1) || '0.0'}
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product?.rating_avg || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">Basado en {product?.review_count || 0} reseñas</p>
            </div>

            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600 w-12">{rating} ⭐</span>
                <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500" 
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  ></div>
                </div>
              </div>
            ))}

            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full bg-amber-700 hover:bg-amber-800 mt-6"
            >
              Escribir Reseña
            </Button>
          </div>

          <div className="lg:col-span-2">
            {showReviewForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tu Reseña</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating })}
                          className="transition"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                    <input
                      type="text"
                      value={newReview.titulo}
                      onChange={(e) => setNewReview({ ...newReview, titulo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                      placeholder="Ejemplo: Excelente sabor"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reseña</label>
                    <textarea
                      value={newReview.contenido}
                      onChange={(e) => setNewReview({ ...newReview, contenido: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none"
                      rows={4}
                      placeholder="Cuéntanos tu experiencia..."
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 rounded-lg transition"
                    >
                      Publicar Reseña
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-6">
              {loadingReviews ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Cargando reseñas...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No hay reseñas aún. Sé el primero en comentar.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{review?.usuario || 'Usuario anónimo'}</p>
                        <p className="text-sm text-gray-600">
                          {review?.fecha ? new Date(review.fecha).toLocaleDateString('es-MX') : 'Fecha no disponible'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (review?.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-900 mb-2">{review?.titulo || 'Sin título'}</h4>
                    <p className="text-gray-700 mb-4">{review?.contenido || 'Sin contenido'}</p>
                    <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                      ¿Útil? ({review?.helpful_count || 0})
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
