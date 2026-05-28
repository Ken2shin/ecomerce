import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/schemas';
import { signIn, getUserRole } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Login] Intento de acceso para:', body.email);

    // Validar input con Zod
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      console.log('[Login] Validación fallida:', validation.error.flatten());
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // signIn usa createSupabaseServerClient internamente,
    // por lo que las cookies de sesión se escriben en esta misma respuesta.
    const result = await signIn(email, password);

    console.log('[Login] Autenticación exitosa para:', result.user.id);

    // Obtener rol para decidir la redirección
    const rawRole = await getUserRole(result.user.id);
    const normalizedRole = rawRole?.toLowerCase().trim() ?? 'customer';
    const redirectTo = normalizedRole === 'admin' ? '/admin' : '/';

    console.log('[Login] Rol:', normalizedRole, '→ Redirigir a:', redirectTo);

    // ─────────────────────────────────────────────────────────────
    // IMPORTANTE: Para que las cookies de sesión de Supabase lleguen
    // al navegador, debemos dejar que el cliente SSR las escriba en
    // la respuesta de Next.js. Como `cookies()` de next/headers está
    // sincronizado con la respuesta actual, NextResponse las incluirá
    // automáticamente siempre que uses createSupabaseServerClient().
    // ─────────────────────────────────────────────────────────────

    return NextResponse.json(
      {
        message: 'Login exitoso',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: normalizedRole,
        },
        redirectTo,
        // No expongas el objeto session completo al cliente en producción.
        // Si el frontend necesita el access_token (e.g. para peticiones externas),
        // puedes incluirlo aquí. De lo contrario, omítelo.
        // session: result.session,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
    console.error('[Login] Error:', message);

    return NextResponse.json({ error: message }, { status: 401 });
  }
}