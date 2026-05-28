import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getOrderTracking, createTrackingUpdate } from '@/lib/tracking';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: orderId } = params;

    // Verify user owns the order
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const tracking = await getOrderTracking(orderId);
    return NextResponse.json(tracking, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener rastreo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id: orderId } = params;
    const body = await request.json();
    const { status, statusMessage, location, estimatedDelivery } = body;

    const tracking = await createTrackingUpdate(orderId, {
      status,
      statusMessage,
      location,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
    });

    return NextResponse.json(tracking, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear rastreo';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
