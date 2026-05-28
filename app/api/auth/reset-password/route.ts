import { NextRequest, NextResponse } from 'next/server';
import { ResetPasswordSchema, UpdatePasswordSchema } from '@/lib/schemas';
import { requestPasswordReset, updatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, newPassword, confirmPassword } = body;

    if (action === 'request') {
      // Request password reset
      const validation = ResetPasswordSchema.safeParse({ email });
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed' },
          { status: 400 }
        );
      }

      await requestPasswordReset(email);

      return NextResponse.json(
        { message: 'Password reset link sent to your email' },
        { status: 200 }
      );
    } else if (action === 'reset') {
      // Update password with token
      const validation = UpdatePasswordSchema.safeParse({
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        );
      }

      await updatePassword(newPassword);

      return NextResponse.json(
        { message: 'Password updated successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
