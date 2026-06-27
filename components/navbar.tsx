'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
// SOLUCIÓN: Cambiado BarChart3 a BarChart
import { MapPin, Bell, ShoppingCart, ChevronDown, Package, MessageSquare, Settings, LogOut, Menu, X, BarChart } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUser();
    loadCartCount();
  }, []);

  async function loadUser() {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('[v0] Error loading user:', error);
    }
  }

  async function loadCartCount() {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error('[v0] Error loading cart:', error);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setShowUserMenu(false);
      // Force hard reload to reset all components and clear hooks state
      window.location.href = '/';
    } catch (error) {
      console.error('[v0] Error logging out:', error);
      // Force reload on error too
      window.location.href = '/';
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?buscar=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  // Hide navbar on admin pages (after all hooks)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Info Bar */}
        <div className="hidden lg:flex h-10 items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 text-xs text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Envíos a todo el país</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Compra con confianza - 100% seguro</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">C$ NIO</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.jpg" 
                alt="Rich Shakes Logo" 
                width={40} 
                height={40} 
                className="rounded-lg object-cover"
              />
              <span className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition">Rich Shakes</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 mx-8 max-w-2xl">
            <div className="flex w-full rounded-lg border border-gray-300 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-100 transition">
              <input
                type="text"
                placeholder="Buscar bebidas, pasteles, productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white rounded-l-lg focus:outline-none text-sm text-gray-900"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-700 text-white rounded-r-lg hover:bg-amber-800 transition font-medium"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/productos" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition">
              Productos
            </Link>
            <Link href="/ofertas" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition flex items-center gap-1">
              Ofertas
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">-40%</span>
            </Link>
            <Link href="/soporte" className="text-gray-700 hover:text-amber-700 font-medium text-sm transition">
              Soporte
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-6">
            {/* Carrito */}
            <Link href="/carrito" className="relative group">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-amber-700 relative">
                <ShoppingCart className="w-6 h-6" />
              </Button>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Usuario Menu */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.nombre || 'Usuario'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                      <p className="text-xs text-gray-500 font-semibold uppercase">Conectado como</p>
                      <p className="text-sm font-bold text-gray-900">{user.email}</p>
                    </div>

                    <Link
                      href="/perfil"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium">Mi Perfil</span>
                        <p className="text-xs text-gray-500">Información personal</p>
                      </div>
                    </Link>

                    <Link
                      href="/pedidos"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <span className="font-medium">Mis Pedidos</span>
                        <p className="text-xs text-gray-500">Historial y seguimiento</p>
                      </div>
                    </Link>

                    <Link
                      href="/favoritos"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <span className="font-medium">Favoritos</span>
                        <p className="text-xs text-gray-500">Tus favoritos</p>
                      </div>
                    </Link>

                    <Link
                      href="/soporte"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium">Centro de Soporte</span>
                        <p className="text-xs text-gray-500">Ayuda y contacto</p>
                      </div>
                    </Link>

                    <Link
                      href="/configuracion"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <span className="font-medium">Configuración</span>
                        <p className="text-xs text-gray-500">Preferencias</p>
                      </div>
                    </Link>

                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="border-amber-700 text-amber-700 hover:bg-amber-50">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="lg:hidden pb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 bg-gray-50 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            <Link href="/productos">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-amber-700 hover:bg-white"
                onClick={() => setIsOpen(false)}
              >
                <Package className="w-4 h-4 mr-3" />
                Productos
              </Button>
            </Link>
            <Link href="/ofertas">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-amber-700 hover:bg-white"
                onClick={() => setIsOpen(false)}
              >
                Ofertas Especiales
              </Button>
            </Link>
            <Link href="/soporte">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-amber-700 hover:bg-white"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                Centro de Soporte
              </Button>
            </Link>

            <hr className="my-2 border-gray-200" />

            {user ? (
              <>
                <Link href="/perfil">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-amber-700 hover:bg-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="w-4 h-4 mr-3" />
                    Mi Perfil
                  </Button>
                </Link>
                <Link href="/pedidos">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-amber-700 hover:bg-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="w-4 h-4 mr-3" />
                    Mis Pedidos
                  </Button>
                </Link>
                <Link href="/favoritos">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-amber-700 hover:bg-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Favoritos
                  </Button>
                </Link>

                {user.rol === 'admin' && (
                  <Link href="/admin">
                    <Button
                      className="w-full justify-start bg-amber-700 hover:bg-amber-800 text-white mt-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {/* SOLUCIÓN: Cambiado BarChart3 a BarChart */}
                      <BarChart className="w-4 h-4 mr-3" />
                      Panel Administrativo
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 mt-2"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full border-amber-700 text-amber-700">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}