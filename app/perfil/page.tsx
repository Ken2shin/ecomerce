'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  Clock,
  Download,
} from 'lucide-react';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  created_at: string;
}

interface Order {
  id: string;
  numero_orden: string;
  total: number;
  estado: string;
  fecha: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'favoritos' | 'configuracion'>('perfil');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        loadOrders();
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('[v0] Auth error:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch('/api/user/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('[v0] Error loading orders:', error);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-24">
              {/* Profile Card */}
              <div className="p-6 bg-gradient-to-br from-amber-700 to-orange-600 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <User className="w-6 h-6" />
                </div>
                <p className="font-bold text-lg">{user?.nombre}</p>
                <p className="text-sm text-white/80">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="divide-y divide-gray-200">
                {[
                  { id: 'perfil', label: 'Mi Perfil', icon: User },
                  { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag },
                  { id: 'favoritos', label: 'Favoritos', icon: Heart },
                  { id: 'configuracion', label: 'Configuración', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition text-left ${
                        activeTab === item.id ? 'bg-amber-50 text-amber-700 border-r-4 border-amber-700' : 'text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 transition text-left border-t border-gray-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Perfil Tab */}
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="text-amber-700 hover:text-amber-800 font-medium text-sm transition"
                    >
                      {editMode ? 'Cancelar' : 'Editar'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                        <input
                          type="text"
                          value={user?.nombre || ''}
                          readOnly={!editMode}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                          type="tel"
                          value={user?.telefono || ''}
                          readOnly={!editMode}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                        <input
                          type="text"
                          value={user?.pais || ''}
                          readOnly={!editMode}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                      <input
                        type="text"
                        value={user?.direccion || ''}
                        readOnly={!editMode}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                        <input
                          type="text"
                          value={user?.ciudad || ''}
                          readOnly={!editMode}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${editMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Miembro Desde</label>
                        <input
                          type="text"
                          value={new Date(user?.created_at || '').toLocaleDateString('es-MX')}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>

                    {editMode && (
                      <Button className="bg-amber-700 hover:bg-amber-800 w-full">
                        Guardar Cambios
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pedidos Tab */}
            {activeTab === 'pedidos' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Mis Pedidos</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No tienes pedidos aún</p>
                    <Link href="/productos" className="mt-4 inline-block">
                      <Button className="bg-amber-700 hover:bg-amber-800">
                        Comenzar a Comprar
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-bold text-gray-900">Pedido #{order.numero_orden}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4" />
                              {new Date(order.fecha).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-700">${order.total.toFixed(2)}</p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              order.estado === 'entregado'
                                ? 'bg-green-100 text-green-700'
                                : order.estado === 'en-transito'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.estado === 'entregado' ? 'Entregado' : order.estado === 'en-transito' ? 'En Tránsito' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <Link href={`/pedidos/${order.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favoritos Tab */}
            {activeTab === 'favoritos' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Mis Favoritos</h2>
                </div>

                <div className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No tienes productos favoritos</p>
                  <Link href="/productos" className="mt-4 inline-block">
                    <Button className="bg-amber-700 hover:bg-amber-800">
                      Explorar Productos
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Configuración Tab */}
            {activeTab === 'configuracion' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>

                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-bold text-gray-900 mb-3">Privacidad y Seguridad</h3>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-amber-700 rounded" />
                      <span className="text-gray-700">Recibir ofertas y promociones por correo</span>
                    </label>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-bold text-gray-900 mb-3">Cambiar Contraseña</h3>
                    <Button variant="outline">
                      Actualizar Contraseña
                    </Button>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-red-600">Zona Peligrosa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Al eliminar tu cuenta, todos tus datos serán eliminados permanentemente.
                    </p>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      Eliminar Cuenta
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
