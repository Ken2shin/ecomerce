'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X, Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ImageLoader } from '@/components/image-loader';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio?: number;
  imagen_url?: string;
  rating_avg?: number;
  review_count?: number;
  stock?: number;
  categoria_id?: string;

  // Compatibilidad con APIs que usan "price"
  price?: number;
}

interface Category {
  id: string;
  nombre: string;
}

function ProductosContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('relevancia');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    loadData();
  }, [selectedCategory, sortBy]);

  async function loadData() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }

      params.append('sort', sortBy);

      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`).catch(() => ({
          json: async () => ({ data: [] }),
        })),
        fetch('/api/categories').catch(() => ({
          json: async () => ({ data: [] }),
        })),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      const normalizedProducts: Product[] = (
        Array.isArray(productsData)
          ? productsData
          : productsData?.data || []
      ).map((product: any) => ({
        ...product,
        precio:
          typeof product.precio === 'number'
            ? product.precio
            : typeof product.price === 'number'
            ? product.price
            : 0,
      }));

      setProducts(normalizedProducts);

      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.data || []
      );
    } catch (error) {
      console.error('[v0] Error loading products:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products
    .filter((p) => {
      const nombre = p.nombre?.toLowerCase() || '';
      const descripcion = p.descripcion?.toLowerCase() || '';
      const searchTerm = search.toLowerCase();

      if (
        search &&
        !nombre.includes(searchTerm) &&
        !descripcion.includes(searchTerm)
      ) {
        return false;
      }

      const precio = p.precio ?? p.price ?? 0;

      if (precio < priceRange[0] || precio > priceRange[1]) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const precioA = a.precio ?? a.price ?? 0;
      const precioB = b.precio ?? b.price ?? 0;

      switch (sortBy) {
        case 'precio-asc':
          return precioA - precioB;

        case 'precio-desc':
          return precioB - precioA;

        case 'rating':
          return (b.rating_avg || 0) - (a.rating_avg || 0);

        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Productos
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Descubre nuestros deliciosos productos
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50 lg:hidden"
            >
              <Filter className="h-5 w-5" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div
            className={`lg:col-span-1 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="sticky top-32 rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between lg:hidden">
                <h2 className="text-lg font-bold text-gray-900">
                  Filtros
                </h2>

                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-bold text-gray-900">
                  Buscar
                </label>

                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="mb-4 font-bold text-gray-900">
                  Categorías
                </h3>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center rounded p-2 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) =>
                        setSelectedCategory(e.target.value)
                      }
                      className="h-4 w-4 cursor-pointer text-amber-700"
                    />

                    <span className="ml-3 font-medium text-gray-700">
                      Todas las categorías
                    </span>
                  </label>

                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex cursor-pointer items-center rounded p-2 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={(e) =>
                          setSelectedCategory(e.target.value)
                        }
                        className="h-4 w-4 cursor-pointer text-amber-700"
                      />

                      <span className="ml-3 text-gray-700">
                        {cat.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <h3 className="mb-4 font-bold text-gray-900">
                  Rango de Precio
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Máximo: C${priceRange[1]}
                    </label>

                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          Number(e.target.value),
                        ])
                      }
                      className="mt-2 w-full accent-amber-700"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          Number(e.target.value),
                          priceRange[1],
                        ])
                      }
                      placeholder="Min"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />

                    <input
                      type="number"
                      min={priceRange[0]}
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          Number(e.target.value),
                        ])
                      }
                      placeholder="Max"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="mb-3 block text-sm font-bold text-gray-900">
                  Ordenar por
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                >
                  <option value="relevancia">
                    Relevancia
                  </option>

                  <option value="precio-asc">
                    Precio: Menor a Mayor
                  </option>

                  <option value="precio-desc">
                    Precio: Mayor a Menor
                  </option>

                  <option value="rating">
                    Mejor Calificados
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-lg bg-gray-200"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-16 text-center">
                <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />

                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  No se encontraron productos
                </h3>

                <p className="text-gray-600">
                  Intenta cambiar tus filtros de búsqueda
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {filteredProducts.length}
                  </span>

                  <span>productos encontrados</span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const precio =
                      product.precio ?? product.price ?? 0;

                    return (
                      <Link
                        key={product.id}
                        href={`/productos/${product.id}`}
                      >
                        <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg">
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden">
                            <div className="h-full w-full transition-transform group-hover:scale-105">
                              <ImageLoader
                                src={product.imagen_url}
                                alt={product.nombre}
                                fallback="📦"
                                className="h-full w-full"
                              />
                            </div>

                            {product.stock !== undefined &&
                              product.stock < 5 && (
                                <div className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                                  Stock Limitado
                                </div>
                              )}
                          </div>

                          {/* Content */}
                          <div className="flex flex-grow flex-col p-4">
                            <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition group-hover:text-amber-700">
                              {product.nombre}
                            </h3>

                            <p className="mt-2 line-clamp-2 flex-grow text-xs text-gray-600">
                              {product.descripcion}
                            </p>

                            {/* Rating */}
                            {product.rating_avg !== undefined && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 ${
                                        i <
                                        Math.round(
                                          product.rating_avg || 0
                                        )
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>

                                <span className="text-xs text-gray-600">
                                  ({product.review_count || 0})
                                </span>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                              <p className="text-lg font-bold text-amber-700">
                                C${precio.toFixed(2)}
                              </p>

                              <Button
                                size="sm"
                                className="gap-1 bg-amber-700 text-white hover:bg-amber-800"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
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
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Cargando productos...
        </div>
      }
    >
      <ProductosContent />
    </Suspense>
  );
}