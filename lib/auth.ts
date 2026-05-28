import { createSupabaseServerClient, supabaseAdmin } from './supabase';
import { User } from '@/types/database';

// ─────────────────────────────────────────────
// IMPORTANTE: Todas estas funciones se ejecutan en el servidor.
// Utilizan createSupabaseServerClient para manejar cookies correctamente.
// ─────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) return null;

    return userData as User;
  } catch (error) {
    console.error('[Auth] Error en getCurrentUser:', error);
    return null;
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string
) {
  const supabaseAdminClient = supabaseAdmin;
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Error al registrar usuario');

  // Use admin client to auto-confirm email and bypass RLS policies
  try {
    // Auto-confirm the user's email so they can login immediately
    const { error: confirmError } = await supabaseAdminClient.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    );
    if (confirmError) console.warn('[SignUp] Warning: Could not auto-confirm email:', confirmError);
  } catch (err) {
    console.warn('[SignUp] Warning: Admin email confirmation failed:', err);
  }

  // Use admin client to bypass RLS policies for new user creation
  const { error: profileError } = await supabaseAdminClient.from('users').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    phone: phone || null,
    role: 'customer',
    is_verified: false,
  });

  if (profileError) throw profileError;

  return { user: authData.user, session: authData.session };
}

export async function signIn(email: string, password: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });
  if (error) throw error;
  return { success: true };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return { success: true };
}

export async function updateUserProfile(
  userId: string,
  { fullName, phone, avatarUrl }: { fullName?: string; phone?: string; avatarUrl?: string }
) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('users')
    .update({
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return !error && data?.role === 'admin';
}

export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return error ? null : data?.role;
}
