'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Award, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Brand {
  id: string;
  nombre: string;
  descripcion?: string;
  logo_url?: string;
  website?: string;
  productos_count?: number;
}

const FEATURED_BRANDS: Brand[] = [
  {
    id: '1',
    nombre: 'Rico Shakes',
    descripcion: 'Bebidas artesanales premium con ingredientes naturales',
    productos_count: 12,
  },
  {
    id: '2',
    nombre: 'Fresh Pastries',
    descripcion: 'Pasteles y postres elaborados diariamente',
    productos_count: 8,
  },
  {
    id: '3',
    nombre: 'Natural Juices',
    descripcion: 'Jugos frescos 100% naturales sin aditivos',
    productos_count: 6,
  },
  {
    id: '4',
    nombre: 'Sweet Cakes',
    descripcion: 'Tortas personalizadas para todas las ocasiones',
    productos_count: 15,
  },
  {
    id: '5',
    nombre: 'Organic Smoothies',
    descripcion: 'Smoothies orgánicos con frutas y vegetales frescos',
    productos_count: 10,
  },
  {
    id: '6',
    nombre: 'Artisan Desserts',
    descripcion: 'Postres gourmet elaborados con técnicas artesanales',
    productos_count: 9,
  },
];

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>(FEATURED_BRANDS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch brands from API, fallback to featured brands
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      setLoading(true);
      // This endpoint might not exist yet, so we'll use the featured brands
      const res = await fetch('/api/brands').catch(() => null);
      if (res) {
        const data = await res.json();
        if (data && data.length > 0) {
          setBrands(data);
        }
      }
    } catch (error) {
      console.error('[v0] Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Nuestras Marcas</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-700" />
            <h1 className="text-4xl font-bold text-gray-900">Nuestras Marcas</h1>
          </div>
          <p className="text-gray-600 mt-3">Conoce las mejores marcas que trabajamos con confianza y calidad</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{brands.length}</span> marcas de confianza
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all h-full flex flex-col"
                >
                  {/* Logo/Image */}
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt={brand.nombre} className="w-32 h-32 object-contain" />
                    ) : (
                      <div className="text-6xl font-bold text-amber-700 opacity-20">
                        {brand.nombre.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition mb-2">
                      {brand.nombre}
                    </h3>

                    {brand.descripcion && (
                      <p className="text-sm text-gray-600 flex-grow">
                        {brand.descripcion}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-4">
                        {brand.productos_count || 0} productos disponibles
                      </p>
                      <Link href={`/productos?marca=${brand.nombre}`}>
                        <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white gap-2">
                          Ver Productos
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Por qué nuestras marcas?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">✓</div>
              <h3 className="font-bold text-gray-900 mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600 text-sm">
                Seleccionamos solo las mejores marcas que cumplen con nuestros altos estándares de calidad
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="font-bold text-gray-900 mb-2">Productos Certificados</h3>
              <p className="text-gray-600 text-sm">
                Todas nuestras marcas cuentan con certificaciones y cumplimientos regulatorios
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2">Relaciones a Largo Plazo</h3>
              <p className="text-gray-600 text-sm">
                Trabajamos con marcas confiables que han demostrado su compromiso con la excelencia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
