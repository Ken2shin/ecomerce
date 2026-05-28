import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateReview, deleteReview } from '@/lib/reviews';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { rating, title, comment } = body;

    const review = await updateReview(id, user.id, { rating, title, comment });
    return NextResponse.json(review, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar reseña';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const result = await deleteReview(id, user.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar reseña';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
