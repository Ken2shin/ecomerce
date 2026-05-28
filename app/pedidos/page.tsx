'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Calendar, DollarSign, ChevronDown, Truck, CheckCircle } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) {
        if (res.status === 401) router.push('/auth/login');
        return;
      }
      const data = await res.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'entregado':
        return <CheckCircle className="w-5 h-5" />;
      case 'enviado':
        return <Truck className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Package className="w-8 h-8 text-amber-700" />
          Mis Pedidos
        </h1>
        <p className="text-gray-600">Historial y seguimiento de tus compras</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p>Cargando pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes pedidos aún</h3>
          <p className="text-gray-600 mb-6">Comienza a comprar y tus pedidos aparecerán aquí.</p>
          <Button className="gap-2 bg-amber-700 hover:bg-amber-800">
            Ir a la Tienda
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden hover:shadow-lg transition"
            >
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-start gap-6 flex-1">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Pedido #{order.id?.slice(0, 8)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.estado)}`}>
                        {getStatusIcon(order.estado)}
                        {order.estado?.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        ${order.total?.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {order.items_count || 0} artículos
                      </div>
                    </div>
                  </div>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition ${
                    expandedOrder === order.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="border-t p-6 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4">Información del Envío</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Dirección:</span> {order.shipping_address}
                        </p>
                        <p>
                          <span className="font-medium">Teléfono:</span> {order.shipping_phone}
                        </p>
                        <p>
                          <span className="font-medium">Estimado:</span>{' '}
                          {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString('es-ES') : 'Próximamente'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4">Resumen del Pedido</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${(order.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Envío:</span>
                          <span>${(order.shipping || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Impuesto:</span>
                          <span>${(order.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>${order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Artículos</h4>
                    <div className="space-y-3">
                      {order.items && order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white rounded border">
                          <div>
                            <p className="font-medium">{item.product_name || 'Producto'}</p>
                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1">
                      Ver Detalles
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Descargar Factura
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
