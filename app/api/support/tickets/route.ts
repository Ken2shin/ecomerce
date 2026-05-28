import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import {
  createSupportTicket,
  getUserTickets,
  getAllTickets,
} from '@/lib/support';
import { CreateSupportTicketSchema } from '@/lib/schemas';

// GET: Get support tickets
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let result;
    
    if (user && await isAdmin(user.id)) {
      // Admin can view all tickets
      const status = searchParams.get('status');
      result = await getAllTickets(status || undefined, limit, offset);
    } else if (user) {
      // Users can only view their own
      result = await getUserTickets(user.id, limit, offset);
    } else {
      // Return empty list for non-authenticated users
      return NextResponse.json({ data: [], count: 0 }, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tickets';
    
    return NextResponse.json(
      { error: message, data: [], count: 0 },
      { status: 200 }
    );
  }
}

// POST: Create support ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = CreateSupportTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { subject, description, order_id, priority } = validation.data;
    const user = await getCurrentUser();
    
    // Use user ID if available, otherwise use guest user ID
    const userId = user?.id || 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const ticket = await createSupportTicket(userId, {
      subject,
      description,
      orderId: order_id ?? undefined, // Solución al error TypeScript: transforma null en undefined
      priority,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}