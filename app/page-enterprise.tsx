'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  rating: number;
  review_count: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items?.slice(0, 8) || []);
      }
    } catch (error) {
      console.error('[v0] Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 text-white py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Bebidas Premium Entregadas a tu Puerta
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Descubre nuestros exquisitos shakes y bebidas artesanales. Hechos con ingredientes frescos y de calidad superior.
              </p>
              <div className="flex gap-4">
                <Link href="/productos">
                  <button className="px-8 py-3 bg-accent text-white font-bold rounded-lg hover:bg-amber-700 transition shadow-lg">
                    Ver Catálogo
                  </button>
                </Link>
                <Link href="/soporte">
                  <button className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition">
                    Contactar
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-full h-96 bg-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-5xl">🥤</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">¿Por Qué Elegir Rich Shakes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '✓', title: 'Ingredientes Frescos', desc: 'Solo usamos ingredientes naturales y frescos' },
              { icon: '⚡', title: 'Entrega Rápida', desc: 'Envío en 24-48 horas a tu domicilio' },
              { icon: '🛡️', title: 'Garantía de Calidad', desc: 'Garantía de satisfacción 100% asegurada' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-muted rounded-xl text-center hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Productos Destacados</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-card rounded-xl p-4 animate-pulse">
                  <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/productos/${product.id}`}>
                  <div className="bg-card rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer">
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-4xl">🥤</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">${product.price}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">★</span>
                          <span className="text-sm text-foreground">{product.rating}</span>
                          <span className="text-xs text-muted-foreground">({product.review_count})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/productos">
              <button className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition">
                Ver Todos los Productos
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Suscríbete a Nuestras Ofertas</h2>
          <p className="text-blue-100 mb-8">Recibe descuentos exclusivos y notificaciones de nuevos productos</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button type="submit" className="px-8 py-3 bg-accent text-white font-bold rounded-lg hover:bg-amber-700 transition">
              Suscribirse
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
