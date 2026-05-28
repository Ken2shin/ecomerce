import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getOrderById, updateOrderStatus, cancelOrder } from '@/lib/orders';

// GET: Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const isUserAdmin = await isAdmin(user.id);

    // Users can only view their own orders
    const order = await getOrderById(id, isUserAdmin ? undefined : user.id);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order not found';
    
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }
}

// PUT: Update order (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, tracking_number } = body;

    const order = await updateOrderStatus(id, status, tracking_number);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// PATCH: Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, tracking_number } = body;

    const order = await updateOrderStatus(id, status, tracking_number);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// DELETE: Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const order = await cancelOrder(id, user.id);

    return NextResponse.json(
      { message: 'Order cancelled successfully', order },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel order';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
