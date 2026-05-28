'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Grid2x2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  productos_count?: number;
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await fetch('/api/categories').catch(() => ({ json: async () => [] }));
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error('[v0] Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  const categoryIcons: Record<string, string> = {
    bebidas: '🥤',
    pasteles: '🎂',
    postres: '🍰',
    smoothies: '🍓',
    bebidas_calientes: '☕',
    bebidas_frias: '🧊',
    default: '📦'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Categorías</span>
          </div>
          <div className="flex items-center gap-3">
            <Grid2x2 className="w-8 h-8 text-amber-700" />
            <h1 className="text-4xl font-bold text-gray-900">Nuestras Categorías</h1>
          </div>
          <p className="text-gray-600 mt-3">Explora nuestros productos organizados por categoría</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <Grid2x2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay categorías disponibles</h3>
            <p className="text-gray-600 mb-6">Vuelve pronto para ver nuestras categorías</p>
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
                <span className="font-bold text-gray-900">{categories.length}</span> categorías disponibles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/productos?categoria_id=${category.id}`}
                >
                  <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
                    {/* Image/Icon */}
                    <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                      <div className="text-6xl">
                        {categoryIcons[category.nombre?.toLowerCase().replace(/\s+/g, '_')] || categoryIcons.default}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition mb-2">
                        {category.nombre}
                      </h3>

                      {category.descripcion && (
                        <p className="text-sm text-gray-600 flex-grow">
                          {category.descripcion}
                        </p>
                      )}

                      {/* Count */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {category.productos_count || 0} productos
                        </p>
                        <Button
                          size="sm"
                          className="bg-amber-700 hover:bg-amber-800 text-white gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
