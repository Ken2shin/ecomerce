'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, TrendingDown, Tag } from 'lucide-react';
import Link from 'next/link';
import { ImageLoader } from '@/components/image-loader';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_original?: number;
  descuento?: number;
  imagen_url?: string;
  rating_avg?: number;
  review_count?: number;
}

export default function OfertasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      setLoading(true);
      const res = await fetch('/api/products?sort=descuento').catch(() => ({ json: async () => ({ data: [] }) }));
      const data = await res.json();
      // Filter only products with discount
      const offeredProducts = (data.data || []).filter((p: Product) => p.descuento && p.descuento > 0);
      setProducts(offeredProducts);
    } catch (error) {
      console.error('[v0] Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  }

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">OFERTAS ESPECIALES</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Ofertas Increíbles</h1>
          <p className="text-amber-100 mt-3 text-lg">Descubre nuestros productos con los mejores descuentos del mes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-200 h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay ofertas disponibles</h3>
            <p className="text-gray-600 mb-6">Vuelve pronto para ver nuestras próximas ofertas</p>
            <Link href="/productos">
              <Button className="bg-amber-700 hover:bg-amber-800 text-white">
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                Mostrando <span className="font-bold text-gray-900">{products.length}</span> productos en oferta
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const discount = product.precio_original 
                  ? calculateDiscount(product.precio_original, product.precio)
                  : (product.descuento || 0);

                return (
                  <Link key={product.id} href={`/productos/${product.id}`}>
                    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden group-hover:scale-105 transition-transform">
                        <ImageLoader
                          src={product.imagen_url}
                          alt={product.nombre}
                          fallback="🎁"
                          className="w-full h-full"
                        />
                        
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full px-3 py-1 font-bold text-sm flex items-center gap-1 z-10">
                            <TrendingDown className="w-4 h-4" />
                            {discount}%
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition line-clamp-2 text-sm">
                          {product.nombre}
                        </h3>

                        <p className="text-xs text-gray-600 mt-2 line-clamp-2 flex-grow">
                          {product.descripcion}
                        </p>

                        {/* Rating */}
                        {product.rating_avg && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.round(product.rating_avg || 0)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">({product.review_count || 0})</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              {product.precio_original && (
                                <p className="text-xs text-gray-500 line-through">
                                  C${Number(product.precio_original || 0).toFixed(2)}
                                </p>
                              )}
                              <p className="text-lg font-bold text-red-600">
                                C${Number(product.precio || 0).toFixed(2)}
                              </p>
                            </div>
                            {product.precio_original && (
                              <div className="text-right">
                                <p className="text-xs text-green-600 font-semibold">
                                  Ahorras: C${(Number(product.precio_original || 0) - Number(product.precio || 0)).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-amber-700 hover:bg-amber-800 text-white gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Agregar al Carrito
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}