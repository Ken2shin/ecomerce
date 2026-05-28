import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserRole } from '@/lib/auth';

/**
 * Validate user role after login
 * This endpoint ensures the session is fully established before checking role
 * Returns role and redirect information
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Validating user role');

    const user = await getCurrentUser();

    if (!user) {
      console.log('[v0] No user found in session');
      return NextResponse.json(
        { error: 'Unauthorized', redirectTo: '/' },
        { status: 401 }
      );
    }

    const rawRole = await getUserRole(user.id);
    const normalizedRole = rawRole?.toLowerCase().trim() || 'customer';
    console.log('[v0] User role validated:', normalizedRole);

    const redirectTo = normalizedRole === 'admin' ? '/admin' : '/';

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: normalizedRole,
        },
        redirectTo,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Role validation failed';
    console.error('[v0] Role validation error:', message);

    return NextResponse.json(
      { error: message, redirectTo: '/' },
      { status: 500 }
    );
  }
}
