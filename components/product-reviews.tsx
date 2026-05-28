'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Send } from 'lucide-react';

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ average: 0, count: 0 });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    try {
      const response = await fetch(`/api/products/${productId}/reviews?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setStats({
          average: data.average_rating || 0,
          count: data.count || 0,
        });
      }
    } catch (error) {
      console.error('[v0] Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (!title || !comment) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title,
          comment,
        }),
      });

      if (response.ok) {
        setTitle('');
        setComment('');
        setRating(5);
        setShowForm(false);
        loadReviews();
      }
    } catch (error) {
      console.error('[v0] Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-600">Cargando reseñas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Calificaciones */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas y Calificaciones</h2>

        <div className="flex items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{stats.average.toFixed(1)}</div>
            <div className="flex justify-center gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(stats.average)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 text-sm">{stats.count} reseñas</p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{stars} ⭐</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white"
        >
          Escribir una Reseña
        </Button>
      </Card>

      {/* Formulario de Reseña */}
      {showForm && (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tu Reseña</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Calificación
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-2 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Título
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ejemplo: Excelente producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Reseña
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comparte tu experiencia con este producto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={submitting || !title || !comment}
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Enviando...' : 'Publicar Reseña'}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Reseñas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-6 text-center text-gray-600">
            No hay reseñas aún. ¡Sé el primero en compartir tu experiencia!
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{review.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {review.users?.full_name || 'Usuario Anónimo'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString('es-NI')}
                  </p>
                </div>
              </div>

              <p className="text-gray-700">{review.comment}</p>

              {review.is_verified_purchase && (
                <div className="mt-3 inline-block px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                  Compra Verificada
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
