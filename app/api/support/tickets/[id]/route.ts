import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import {
  getTicketById,
  updateTicketStatus,
  addTicketReply,
  getTicketReplies,
} from '@/lib/support';
import {
  UpdateSupportTicketSchema,
  AddSupportReplySchema,
} from '@/lib/schemas';

// GET: Get ticket details with replies
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
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'replies') {
      // Get ticket replies
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);

      const result = await getTicketReplies(id, limit, offset);
      return NextResponse.json(result, { status: 200 });
    }

    // Get ticket details
    const isUserAdmin = await isAdmin(user.id);
    const ticket = await getTicketById(id, isUserAdmin ? undefined : user.id);

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ticket not found';
    
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }
}

// PUT: Update ticket (admin only)
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

    // Validate input
    const validation = UpdateSupportTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const ticket = await updateTicketStatus(id, validation.data);

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update ticket';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// POST: Add reply to ticket
export async function POST(
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
    const body = await request.json();

    // Validate input
    const validation = AddSupportReplySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { message, attachments } = validation.data;

    const reply = await addTicketReply(id, user.id, {
      message,
      attachments,
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add reply';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
