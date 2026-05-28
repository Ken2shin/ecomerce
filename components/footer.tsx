'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  
  // Hide footer on admin pages (check after any hooks)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Compañía */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Rich Shakes</h3>
            <p className="text-sm text-gray-400 mb-4">
              Las mejores bebidas y pasteles artesanales, entregados a tu puerta con amor.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos" className="hover:text-white transition">
                  Todos los Productos
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="hover:text-white transition">
                  Ofertas Especiales
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="hover:text-white transition">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/marcas" className="hover:text-white transition">
                  Nuestras Marcas
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/soporte" className="hover:text-white transition">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition">
                  Contáctanos
                </Link>
              </li>
              <li>
                <Link href="/envios" className="hover:text-white transition">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-white transition">
                  Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0 text-amber-700" />
                <span>+505 (2234) 5678</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0 text-amber-700" />
                <a href="mailto:info@richshakes.ni" className="hover:text-white transition">
                  info@richshakes.ni
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-amber-700" />
                <span>Barrio Martha Quezada, Managua, Nicaragua</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2026 Rich Shakes. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacidad" className="hover:text-white transition">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white transition">
              Términos
            </Link>
            <Link href="/cookies" className="hover:text-white transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
