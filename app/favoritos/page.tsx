'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const res = await fetch('/api/favoritos');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(productId: string) {
    try {
      const res = await fetch(`/api/favoritos/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.id !== productId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Heart className="w-8 h-8 text-amber-700" />
          Mis Favoritos
        </h1>
        <p className="text-gray-600">{favorites.length} productos guardados</p>
      </div>

      {favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes favoritos aún</h3>
          <p className="text-gray-600 mb-6">
            Guarda tus productos favoritos para acceder a ellos rápidamente.
          </p>
          <Link href="/productos">
            <Button className="gap-2 bg-amber-700 hover:bg-amber-800">
              Explorar Productos
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-red-50 transition"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.nombre}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.descripcion}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-2">
                    {product.review_count || 0} reseñas
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-2xl font-bold text-amber-700">
                    C${((product.precio || product.price) || 0)?.toFixed(2)}
                  </p>
                  {(product.precio_original || product.price_original) && (
                    <p className="text-sm text-gray-500 line-through">
                      C${((product.precio_original || product.price_original) || 0).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link href={`/productos/${product.slug}`} className="block">
                    <Button variant="outline" className="w-full">
                      Ver Producto
                    </Button>
                  </Link>
                  <Button className="w-full gap-2 bg-amber-700 hover:bg-amber-800">
                    <ShoppingCart className="w-4 h-4" />
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
