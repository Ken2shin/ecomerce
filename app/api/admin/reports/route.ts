import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get orders in date range
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(quantity, price)')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (ordersError) throw ordersError;

    // Calculate metrics
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProductsSold = orders?.reduce(
      (sum, o) => sum + (o.order_items?.reduce((s: number, oi: any) => s + oi.quantity, 0) || 0),
      0
    ) || 0;

    // Get top products
    const productMap = new Map<string, any>();
    orders?.forEach((order) => {
      order.order_items?.forEach((item: any) => {
        const key = item.product_id || 'unknown';
        if (!productMap.has(key)) {
          productMap.set(key, { quantity: 0, revenue: 0, name: 'Producto' });
        }
        const prod = productMap.get(key)!;
        prod.quantity += item.quantity;
        prod.revenue += item.price * item.quantity;
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({
        ...p,
        percentage: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0,
      }));

    // Get comparison with previous period
    const periodDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - periodDays);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const { data: prevOrders } = await supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());

    const prevRevenue = prevOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const prevOrderCount = prevOrders?.length || 1;
    const prevTicket = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const orderGrowth = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0;
    const ticketGrowth = prevTicket > 0 ? ((averageTicket - prevTicket) / prevTicket) * 100 : 0;

    const report = {
      totalRevenue,
      totalOrders,
      averageTicket,
      totalProductsSold,
      topProducts,
      revenueGrowth,
      orderGrowth,
      ticketGrowth,
      conversionRate: totalOrders > 0 ? 2.5 : 0, // Placeholder
      newCustomers: Math.floor(totalOrders * 0.3), // Estimate
      recurringCustomers: Math.floor(totalOrders * 0.7), // Estimate
    };

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al generar reporte';
    console.error('[Reports Error]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
