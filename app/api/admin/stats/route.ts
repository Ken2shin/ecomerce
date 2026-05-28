import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET: Get admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get total orders and revenue
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, status, created_at');

    if (ordersError) {
      console.error('[v0] Error fetching orders for stats:', ordersError);
    }

    const orders = ordersData || [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Get orders this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ordersThisMonth = orders.filter(
      (order) => new Date(order.created_at) >= firstDayOfMonth
    );
    const revenueThisMonth = ordersThisMonth.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const stats = {
      totalRevenue: totalRevenue || 0,
      totalOrders: totalOrders || 0,
      totalProducts: totalProducts || 0,
      totalUsers: totalUsers || 0,
      ordersThisMonth: ordersThisMonth.length || 0,
      revenueThisMonth: revenueThisMonth || 0,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('[v0] Admin stats error:', error);
    
    // Return default stats on error
    return NextResponse.json({
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      ordersThisMonth: 0,
      revenueThisMonth: 0,
    }, { status: 200 });
  }
}
