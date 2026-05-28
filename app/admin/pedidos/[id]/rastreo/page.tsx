'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStatusColor, getTrackingProgress, ORDER_STATUSES, STATUS_MESSAGES } from '@/lib/tracking';
import { CheckCircle, Clock, Truck, MapPin } from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [tracking, setTracking] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracking();
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('[v0] Error loading order:', error);
    }
  }

  async function loadTracking() {
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`);
      if (response.ok) {
        const data = await response.json();
        setTracking(data);
      }
    } catch (error) {
      console.error('[v0] Error loading tracking:', error);
    } finally {
      setLoading(false);
    }
  }

  const latestTracking = tracking.length > 0 ? tracking[tracking.length - 1] : null;
  const progress = latestTracking ? getTrackingProgress(latestTracking.status) : 0;

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rastreo del Pedido</h1>
        <p className="text-gray-600 mt-2">Pedido #{orderId}</p>
      </div>

      {/* Estado Actual */}
      {latestTracking && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{STATUS_MESSAGES[latestTracking.status]}</h2>
              <p className="text-gray-600 mt-2">
                {latestTracking.location && (
                  <>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {latestTracking.location}
                  </>
                )}
              </p>
            </div>
            <div className={`px-6 py-3 rounded-lg font-semibold ${getStatusColor(latestTracking.status)}`}>
              {latestTracking.status === ORDER_STATUSES.DELIVERED ? (
                <CheckCircle className="w-8 h-8 inline" />
              ) : latestTracking.status === ORDER_STATUSES.SHIPPED ? (
                <Truck className="w-8 h-8 inline" />
              ) : (
                <Clock className="w-8 h-8 inline" />
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Progreso</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {latestTracking.estimated_delivery && (
            <p className="text-gray-700">
              <strong>Entrega estimada:</strong>{' '}
              {new Date(latestTracking.estimated_delivery).toLocaleDateString('es-NI')}
            </p>
          )}
        </Card>
      )}

      {/* Timeline de Eventos */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Historial de Rastreo</h2>

        {tracking.length === 0 ? (
          <p className="text-gray-500">
            Tu pedido está siendo procesado. Pronto verás actualizaciones aquí.
          </p>
        ) : (
          <div className="space-y-6">
            {[...tracking].reverse().map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    event.status === ORDER_STATUSES.DELIVERED
                      ? 'bg-green-600'
                      : event.status === ORDER_STATUSES.SHIPPED
                      ? 'bg-blue-600'
                      : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  {index < tracking.length - 1 && (
                    <div className="w-1 h-12 bg-gray-200 my-2" />
                  )}
                </div>

                <div className="flex-1 py-1">
                  <h3 className="font-bold text-gray-900">{STATUS_MESSAGES[event.status]}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(event.created_at).toLocaleDateString('es-NI', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.location && (
                    <p className="text-gray-600 text-sm flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </p>
                  )}
                  {event.status_message && event.status_message !== STATUS_MESSAGES[event.status] && (
                    <p className="text-gray-700 text-sm mt-2">{event.status_message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Información del Pedido */}
      {order && (
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detalles del Pedido</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="font-bold text-gray-900">C$ {order.total?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Método de Pago</p>
              <p className="font-bold text-gray-900">{order.payment_method || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Entrega</p>
              <p className="font-bold text-gray-900">Envío a Domicilio</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Dirección</p>
              <p className="font-bold text-gray-900 text-sm">{order.delivery_address || 'No especificada'}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-8">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Volver
        </Button>
      </div>
    </div>
  );
}
