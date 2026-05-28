import { supabase, supabaseAdmin } from './supabase';
import { SupportTicket, SupportReply } from '@/types/database';

/**
 * Create support ticket
 */
export async function createSupportTicket(
  userId: string,
  {
    subject,
    description,
    orderId,
    priority,
  }: {
    subject: string;
    description: string;
    orderId?: string;
    priority?: 'low' | 'medium' | 'high';
  }
) {
  try {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        order_id: orderId || null,
        subject,
        description,
        status: 'open',
        priority: priority || 'medium',
      })
      .select()
      .single();

    if (error) throw error;
    return ticket as SupportTicket;
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
}

/**
 * Get user support tickets
 */
export async function getUserTickets(
  userId: string,
  limit = 20,
  offset = 0
) {
  try {
    const { data, error, count } = await supabase
      .from('support_tickets')
      .select(
        `
        *,
        support_replies (
          id,
          created_at
        )
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data as any[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
}

/**
 * Get all support tickets (Admin)
 */
export async function getAllTickets(
  status?: string,
  limit = 20,
  offset = 0
) {
  try {
    let query = supabase
      .from('support_tickets')
      .select(
        `
        *,
        user:user_id (id, email, full_name),
        assigned_to_user:assigned_to (id, full_name)
        `,
        { count: 'exact' }
      );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data as any[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: string, userId?: string) {
  try {
    let query = supabase
      .from('support_tickets')
      .select(
        `
        *,
        support_replies (
          *,
          user:user_id (id, full_name, avatar_url)
        )
        `
      )
      .eq('id', ticketId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw new Error('Ticket not found');
    }

    return data as any;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  {
    status,
    priority,
    assignedTo,
  }: {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: string | null;
  }
) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return ticket as SupportTicket;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
}

/**
 * Add reply to ticket
 */
export async function addTicketReply(
  ticketId: string,
  userId: string,
  {
    message,
    attachments,
  }: {
    message: string;
    attachments?: string[];
  }
) {
  try {
    const { data: reply, error } = await supabase
      .from('support_replies')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        message,
        attachments: attachments || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket timestamp
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return reply as SupportReply;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
}

/**
 * Get ticket conversation
 */
export async function getTicketReplies(
  ticketId: string,
  limit = 50,
  offset = 0
) {
  try {
    const { data, error, count } = await supabase
      .from('support_replies')
      .select(
        `
        *,
        user:user_id (id, full_name, avatar_url, role)
        `,
        { count: 'exact' }
      )
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data as any[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching replies:', error);
    throw error;
  }
}
