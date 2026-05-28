'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Truck, ShieldCheck, Headphones, Star, TrendingUp, Package, CupSoda, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  rating_avg?: number;
  review_count?: number;
  stock?: number;
}

interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?featured=true&limit=8').catch(() => ({ json: async () => ({ data: [] }) })),
        fetch('/api/categories').catch(() => ({ json: async () => ({ data: [] }) })),
      ]);
      
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setProducts(Array.isArray(productsData) ? productsData : (productsData?.data || []));
      setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []));
    } catch (error) {
      console.error('[v0] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white">
      {/* Hero Banner - Estilo Premium 3D RGB (Samsung Vibe) */}
      <section className="relative overflow-hidden bg-gray-950 py-20 lg:py-32">
        {/* Fondo animado estilo RGB */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-gray-950/80 to-gray-950"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 z-10">
              <div className="inline-block transform transition-transform hover:-translate-y-1 cursor-default">
                <span className="bg-white/10 border border-white/20 backdrop-blur-md text-amber-300 px-4 py-2 rounded-full text-sm font-semibold shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  Bienvenido a Rich Shakes
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-orange-400 drop-shadow-lg">
                Sabor Premium <br />en Cada Sorbo
              </h1>
              <p className="text-lg text-gray-300 max-w-xl font-light hover:text-white transition-colors duration-300">
                Descubre nuestras bebidas artesanales y pasteles frescos. Hecho con ingredientes de calidad superior para los amantes del buen sabor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/productos">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold border-none shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] transition-all duration-300 hover:-translate-y-1">
                    Explorar Productos
                  </Button>
                </Link>
                <Link href="/ofertas">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white font-bold backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                    Ver Ofertas
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Logo 3D con Aura RGB */}
            <div className="hidden lg:flex justify-center perspective-1000 relative">
              <div className="relative group w-80 h-80 flex items-center justify-center">
                {/* Aura RGB Animada */}
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-500 rounded-full blur-2xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 animate-pulse"></div>
                
                {/* Logo Flotante 3D */}
                <div className="relative w-full h-full transform-gpu transition-all duration-500 group-hover:rotate-y-12 group-hover:rotate-x-12 group-hover:-translate-y-4 group-hover:scale-105 z-10 rounded-full border-4 border-white/10 shadow-[0_30px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-white">
                  <img 
                    src="/logo.jpg" 
                    alt="Rich Shakes Logo" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100 relative z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-amber-50/50 transition-colors duration-300 cursor-default">
              <div className="flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-10 h-10 text-amber-700 group-hover:text-amber-500 drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Envío Rápido</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Entrega en 24-48 horas a toda la región</p>
              </div>
            </div>
            
            <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-amber-50/50 transition-colors duration-300 cursor-default">
              <div className="flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10 text-amber-700 group-hover:text-amber-500 drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Compra Segura</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Transacciones encriptadas y protegidas</p>
              </div>
            </div>
            
            <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-amber-50/50 transition-colors duration-300 cursor-default">
              <div className="flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <Headphones className="w-10 h-10 text-amber-700 group-hover:text-amber-500 drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Soporte 24/7</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Equipo dedicado para ayudarte siempre</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 group cursor-default">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 group-hover:text-amber-700 transition-colors">Categorías</h2>
            <p className="text-gray-600 text-lg group-hover:text-gray-800 transition-colors">Explora nuestros productos organizados por tipo</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/productos?categoria=${category.id}`}>
                  <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-200 cursor-pointer h-48 flex flex-col justify-center overflow-hidden hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    <div className="mb-4 transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 text-amber-700 group-hover:text-amber-600">
                      <Package className="w-10 h-10 drop-shadow-sm" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-amber-800 transition-colors">{category.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-2 group-hover:text-amber-700/80 transition-colors line-clamp-2">{category.descripcion || 'Ver productos'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-white to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 group cursor-default">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-amber-700 group-hover:text-amber-500 transition-colors group-hover:-translate-y-1 group-hover:scale-110 duration-300" />
              <h2 className="text-4xl font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors">Productos Destacados</h2>
            </div>
            <p className="text-gray-600 text-lg group-hover:text-gray-800 transition-colors">Los favoritos de nuestros clientes</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link key={product.id} href={`/productos/${product.id}`}>
                  <div className="group bg-white rounded-2xl shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col hover:-translate-y-2">
                    <div className="relative h-56 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                      {product.imagen_url ? (
                        <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                          <div className="text-center group-hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-white shadow-md flex items-center justify-center text-amber-500 group-hover:text-orange-500 transition-colors">
                              <CupSoda className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-medium text-amber-800/60 group-hover:text-amber-800 transition-colors">Sin imagen</p>
                          </div>
                        </div>
                      )}
                      {product.stock && product.stock < 5 && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full z-20 shadow-md">
                          Stock Limitado
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-grow flex flex-col bg-white group-hover:bg-amber-50/30 transition-colors duration-300">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {product.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-grow group-hover:text-gray-700 transition-colors">
                        {product.descripcion}
                      </p>

                      {product.rating_avg && (
                        <div className="flex items-center gap-2 mt-4">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(product.rating_avg || 0)
                                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            ({product.review_count || 0})
                          </span>
                        </div>
                      )}

                      <div className="mt-5 pt-5 border-t border-gray-100 group-hover:border-amber-200 transition-colors flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black text-amber-700 group-hover:text-orange-600 transition-colors">
                            C${product.precio.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gray-900 hover:bg-amber-700 text-white rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Comprar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <div className="group cursor-default">
            <h2 className="text-4xl font-extrabold mb-4 group-hover:text-amber-400 transition-colors duration-300">Suscríbete a Nuestro Newsletter</h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto group-hover:text-white transition-colors duration-300">
              Recibe ofertas exclusivas, nuevos productos y recetas directamente en tu correo
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto group">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all shadow-inner bg-white/90 hover:bg-white"
              required
            />
            <Button size="lg" className="px-8 py-4 h-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)] transition-all duration-300 hover:-translate-y-1">
              Suscribirse
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="group">
              <h3 className="font-bold text-white mb-6 text-lg group-hover:text-amber-500 transition-colors">Explorar</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/productos" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Todos los Productos</Link></li>
                <li><Link href="/ofertas" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Ofertas Especiales</Link></li>
                <li><Link href="/nuevos" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Nuevos Llegados</Link></li>
              </ul>
            </div>
            <div className="group">
              <h3 className="font-bold text-white mb-6 text-lg group-hover:text-amber-500 transition-colors">Soporte</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/soporte" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Centro de Ayuda</Link></li>
                <li><Link href="/contacto" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Contactanos</Link></li>
                <li><Link href="/faq" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Preguntas Frecuentes</Link></li>
              </ul>
            </div>
            <div className="group">
              <h3 className="font-bold text-white mb-6 text-lg group-hover:text-amber-500 transition-colors">Compañía</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Sobre Nosotros</Link></li>
                <li><Link href="/privacidad" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Términos y Condiciones</Link></li>
              </ul>
            </div>
            <div className="group">
              <h3 className="font-bold text-white mb-6 text-lg group-hover:text-amber-500 transition-colors">Síguenos</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Facebook</a></li>
                <li><a href="#" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Instagram</a></li>
                <li><a href="#" className="hover:text-amber-400 hover:translate-x-2 inline-block transition-all duration-300">Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800/60 pt-8 text-center text-gray-500 flex flex-col md:flex-row justify-between items-center group">
            <p className="group-hover:text-gray-400 transition-colors">© 2026 Rich Shakes. Todos los derechos reservados.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-sm">Sistema en línea</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}