'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/currency';
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  LogOut,
  Menu,
  X,
  Plus,
  Eye,
  Settings,
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.role === 'admin') {
          setUser(data);
          setAuthorized(true);
          loadStats();
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('[v0] Auth error:', error);
      router.push('/auth/login');
    }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('[v0] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <Link href="/" className="font-bold text-lg">
            {sidebarOpen ? 'Rich Shakes Admin' : 'RS'}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem
            icon={BarChart3}
            label="Dashboard"
            href="/admin"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={Package}
            label="Productos"
            href="/admin/productos"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={ShoppingCart}
            label="Pedidos"
            href="/admin/pedidos"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={Users}
            label="Usuarios"
            href="/admin/usuarios"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={TrendingUp}
            label="Reportes"
            href="/admin/reportes"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={TrendingUp}
            label="Reportes Avanzados"
            href="/admin/reportes-avanzados"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={Package}
            label="Contenido"
            href="/admin/contenido"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={Package}
            label="Publicidades"
            href="/admin/publicidades"
            open={sidebarOpen}
          />
          <SidebarItem
            icon={Settings}
            label="Configuración"
            href="/admin/configuracion"
            open={sidebarOpen}
          />
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 hover:bg-gray-800 rounded transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Bienvenido, {user?.email || 'Admin'}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Salir</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
            </div>
          ) : stats ? (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Ingresos Totales"
                  value={formatPrice(stats.totalRevenue)}
                  icon={DollarSign}
                  color="bg-green-100 text-green-700"
                />
                <StatCard
                  title="Pedidos Totales"
                  value={stats.totalOrders.toString()}
                  icon={ShoppingCart}
                  color="bg-blue-100 text-blue-700"
                />
                <StatCard
                  title="Productos"
                  value={stats.totalProducts.toString()}
                  icon={Package}
                  color="bg-amber-100 text-amber-700"
                />
                <StatCard
                  title="Usuarios"
                  value={stats.totalUsers.toString()}
                  icon={Users}
                  color="bg-purple-100 text-purple-700"
                />
              </div>

              {/* Recent Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Pedidos Recientes</h2>
                    <Link href="/admin/pedidos">
                      <Button variant="outline" size="sm">
                        Ver todos
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                        <div>
                          <p className="font-semibold text-gray-900">Pedido #00{i + 1}</p>
                          <p className="text-sm text-gray-600">Hace 2 horas</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-700">{formatPrice(3499.65)}</p>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Pendiente</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
                  <div className="space-y-3">
                    <Link href="/admin/productos">
                      <Button className="w-full bg-amber-700 hover:bg-amber-800 gap-2 justify-start">
                        <Plus className="w-4 h-4" />
                        Gestionar Productos
                      </Button>
                    </Link>
                    <Link href="/admin/pedidos">
                      <Button variant="outline" className="w-full gap-2 justify-start">
                        <Eye className="w-4 h-4" />
                        Ver Pedidos
                      </Button>
                    </Link>
                    <Link href="/admin/usuarios">
                      <Button variant="outline" className="w-full gap-2 justify-start">
                        <Users className="w-4 h-4" />
                        Gestionar Usuarios
                      </Button>
                    </Link>
                    <Link href="/admin/reportes">
                      <Button variant="outline" className="w-full gap-2 justify-start">
                        <BarChart3 className="w-4 h-4" />
                        Ver Reportes
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Este Mes</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ingresos</span>
                      <span className="font-bold text-amber-700">{formatPrice(stats.revenueThisMonth)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pedidos</span>
                      <span className="font-bold">{stats.ordersThisMonth}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Promedio por Pedido</span>
                        <span className="font-bold text-green-700">
                          {formatPrice(stats.ordersThisMonth > 0 ? stats.revenueThisMonth / stats.ordersThisMonth : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Estadísticas Generales</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ticket Promedio</span>
                      <span className="font-bold text-amber-700">
                        {formatPrice(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Productos</span>
                      <span className="font-bold">{stats.totalProducts}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Base de Usuarios</span>
                        <span className="font-bold text-blue-700">{stats.totalUsers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, href, open }: any) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white">
        <Icon className="w-5 h-5 flex-shrink-0" />
        {open && <span className="text-sm">{label}</span>}
      </div>
    </Link>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} p-4 rounded-lg`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
