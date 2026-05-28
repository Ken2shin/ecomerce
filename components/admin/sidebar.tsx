'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  Menu,
  Image,
  FileText,
  Settings,
  Newspaper,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/productos', icon: Package, label: 'Productos' },
    { href: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
    { href: '/admin/publicidades', icon: Image, label: 'Publicidades' },
    { href: '/admin/publicaciones', icon: Newspaper, label: 'Publicaciones' },
    { href: '/admin/contenido', icon: FileText, label: 'Contenido' },
    { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-800`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {isOpen && <h1 className="font-bold text-lg">Rich Shakes Admin</h1>}
        <button onClick={onToggle} className="p-1 hover:bg-gray-800 rounded">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-amber-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={link.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm">{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
