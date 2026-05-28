import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone } = body;

    // Basic validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { 
          error: 'Email, password, and full name are required',
          details: {
            email: !email ? 'Required' : undefined,
            password: !password ? 'Required' : undefined,
            full_name: !full_name ? 'Required' : undefined,
          }
        },
        { status: 400 }
      );
    }

    // Validate email format with stricter regex
    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }
    
    // Normalize email to lowercase (Supabase requirement)
    const normalizedEmail = email.toLowerCase().trim();

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const result = await signUp(normalizedEmail, password, full_name, phone);

    return NextResponse.json(
      {
        message: 'Cuenta creada correctamente. Por favor verifica tu email.',
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Signup Error]', error);
    
    let message = 'Error en el registro';
    let status = 400;
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('rate limit') || errorMsg.includes('over_email_send_rate_limit')) {
        message = 'Demasiados intentos de registro. Por favor intenta en algunos minutos.';
        status = 429;
      } else if (errorMsg.includes('already exists') || errorMsg.includes('unique violation')) {
        message = 'Este correo ya está registrado. Por favor inicia sesión.';
        status = 409;
      } else if (errorMsg.includes('invalid email')) {
        message = 'Correo electrónico no válido. Verifica e intenta nuevamente.';
        status = 400;
      } else {
        message = error.message;
      }
    }
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
