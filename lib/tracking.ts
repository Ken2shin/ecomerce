import { supabaseAdmin } from './supabase';

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Pedido recibido, pendiente de confirmación',
  confirmed: 'Pedido confirmado',
  processing: 'Estamos preparando tu pedido',
  shipped: 'Tu pedido ha sido enviado',
  out_for_delivery: 'Tu pedido está en camino',
  delivered: 'Tu pedido ha sido entregado',
  cancelled: 'Tu pedido ha sido cancelado',
};

export async function getOrderTracking(orderId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Tracking] Error fetching order tracking:', error);
    return [];
  }
}

export async function createTrackingUpdate(
  orderId: string,
  {
    status,
    statusMessage,
    location,
    estimatedDelivery,
  }: {
    status: string;
    statusMessage?: string;
    location?: string;
    estimatedDelivery?: Date;
  }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('order_tracking')
      .insert({
        order_id: orderId,
        status,
        status_message: statusMessage || STATUS_MESSAGES[status] || 'Actualización disponible',
        location,
        estimated_delivery: estimatedDelivery?.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Tracking] Error creating tracking update:', error);
    throw error;
  }
}

export async function getLatestTrackingUpdate(orderId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Tracking] Error fetching latest tracking:', error);
    return null;
  }
}

export function getTrackingProgress(status: string): number {
  const statusOrder = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.OUT_FOR_DELIVERY,
    ORDER_STATUSES.DELIVERED,
  ];

  const index = statusOrder.indexOf(status as any);
  return index === -1 ? 0 : ((index + 1) / statusOrder.length) * 100;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case ORDER_STATUSES.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case ORDER_STATUSES.CONFIRMED:
      return 'bg-blue-100 text-blue-800';
    case ORDER_STATUSES.PROCESSING:
      return 'bg-indigo-100 text-indigo-800';
    case ORDER_STATUSES.SHIPPED:
      return 'bg-purple-100 text-purple-800';
    case ORDER_STATUSES.OUT_FOR_DELIVERY:
      return 'bg-orange-100 text-orange-800';
    case ORDER_STATUSES.DELIVERED:
      return 'bg-green-100 text-green-800';
    case ORDER_STATUSES.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
