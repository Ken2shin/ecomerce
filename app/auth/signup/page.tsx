'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Coffee } from 'lucide-react'; // Importamos el icono limpio

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
  });

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      // Redirect to login
      router.push('/auth/login?message=Account created. Please log in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center perspective-1000">
          <div className="inline-flex items-center justify-center mb-4 p-4 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full text-white shadow-[0_6px_0_rgb(180,83,9),0_15px_20px_rgba(0,0,0,0.2)] transform transition-transform hover:-translate-y-1">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 drop-shadow-sm">Rich Shakes</h1>
          <p className="text-gray-600 mt-2 font-medium">Crea tu cuenta para empezar</p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="bg-white rounded-2xl border-t border-l border-gray-100 shadow-[0_15px_35px_rgba(0,0,0,0.15)] p-8 space-y-6 relative overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 drop-shadow-sm">Nombre Completo</label>
            <input
              type="text"
              placeholder="Juan Pérez"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-t-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 drop-shadow-sm">Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-t-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 drop-shadow-sm">Teléfono</label>
            <input
              type="tel"
              placeholder="+52 (555) 123-4567"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-t-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 drop-shadow-sm">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-t-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-gray-900"
              required
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <input type="checkbox" required className="w-5 h-5 text-amber-600 rounded border-gray-300 shadow-inner focus:ring-amber-500 cursor-pointer" />
            <span className="font-medium">Acepto los Términos de Servicio y la Política de Privacidad</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold py-3.5 rounded-xl shadow-[0_5px_0_rgb(146,64,14),0_10px_15px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_rgb(146,64,14),0_0px_0px_rgba(0,0,0,0)] active:translate-y-[5px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_5px_0_rgb(146,64,14)]"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600 font-medium">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-amber-700 hover:text-amber-800 font-bold drop-shadow-sm transition-colors">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </form>

        {/* Help Links */}
        <div className="mt-8 text-center text-sm text-gray-500 font-medium drop-shadow-sm">
          <Link href="/soporte" className="hover:text-amber-700 transition-colors">
            ¿Necesitas ayuda?
          </Link>
          <span className="mx-2 opacity-50">·</span>
          <Link href="/" className="hover:text-amber-700 transition-colors">
            Ir a Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}