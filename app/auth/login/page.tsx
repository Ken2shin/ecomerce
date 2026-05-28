'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Coffee } from 'lucide-react'; // Importamos el icono limpio

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) {
      setMessage(msg);
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Small delay to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user is admin
      try {
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('[v0] Profile data:', profileData);
          if (profileData?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          console.log('[v0] Profile request failed:', profileResponse.status);
          router.push('/');
        }
      } catch (error) {
        console.log('[v0] Error checking profile:', error);
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4 p-4 bg-amber-700 rounded-full text-white shadow-lg">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Rich Shakes</h1>
          <p className="text-gray-600 mt-2">Bienvenido de nuevo</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 space-y-6">
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 text-gray-900"
              required
            />
          </div>

          <Link href="/auth/reset-password" className="text-sm text-amber-700 hover:text-amber-800 font-medium block">
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/signup" className="text-amber-700 hover:text-amber-800 font-bold">
                Crear Cuenta
              </Link>
            </p>
          </div>
        </form>

        {/* Help Links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/soporte" className="hover:text-amber-700 font-medium">
            ¿Necesitas ayuda?
          </Link>
          {' '} · {' '}
          <Link href="/" className="hover:text-amber-700 font-medium">
            Ir a Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}