import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await signOut();

    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
