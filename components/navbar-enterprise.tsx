'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export function NavbarEnterprise() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition">
            <Image 
              src="/logo.jpg" 
              alt="Rich Shakes Logo" 
              width={32} 
              height={32} 
              className="rounded-lg object-cover"
            />
            <span className="hidden sm:inline text-foreground">Rich Shakes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/productos"
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                isActive('/productos')
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Productos
            </Link>
            <Link
              href="/categorias"
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                isActive('/categorias')
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Categorías
            </Link>
            <Link
              href="/soporte"
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                isActive('/soporte')
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Soporte
            </Link>
            <Link
              href="/faq"
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                isActive('/faq')
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              FAQ
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search (hidden on mobile) */}
            <div className="hidden lg:flex bg-input rounded-lg px-3 py-2 w-64">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="ml-2 bg-transparent outline-none text-sm flex-1 text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Cart */}
            <Link
              href="/carrito"
              className="relative p-2 text-foreground hover:bg-muted rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute top-0 right-0 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Auth Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition"
              >
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium text-foreground">Cuenta</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2">
                  <Link href="/perfil" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition">
                    Mi Perfil
                  </Link>
                  <Link href="/pedidos" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition">
                    Mis Pedidos
                  </Link>
                  <div className="border-t border-border my-1"></div>
                  <Link href="/auth/login" className="block px-4 py-2 text-sm text-primary font-medium hover:bg-muted transition">
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/productos"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-muted transition"
            >
              Productos
            </Link>
            <Link
              href="/categorias"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-muted transition"
            >
              Categorías
            </Link>
            <Link
              href="/soporte"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-muted transition"
            >
              Soporte
            </Link>
            <Link
              href="/faq"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-muted transition"
            >
              FAQ
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}