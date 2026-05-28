import { createClient } from '@supabase/supabase-js';

// Usamos fallbacks para que no rompa el build de Next.js si la variable tarda un milisegundo en cargar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// Cliente público
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin (solo backend)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);