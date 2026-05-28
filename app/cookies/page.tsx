'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Política de Cookies</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Política de Cookies</h1>
          <p className="text-gray-600 mt-2">Última actualización: Mayo 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Las cookies son pequeños archivos de texto que se guardan en tu dispositivo cuando visitas 
              nuestro sitio web. Se utilizan para mejorar tu experiencia de navegación y recordar tus preferencias.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tipos de Cookies que Usamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Utilizamos los siguientes tipos de cookies:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Cookies Esenciales:</strong> Necesarias para la funcionalidad del sitio</li>
              <li><strong>Cookies de Rendimiento:</strong> Ayudan a optimizar el sitio</li>
              <li><strong>Cookies de Funcionalidad:</strong> Recuerdan tus preferencias</li>
              <li><strong>Cookies de Marketing:</strong> Utilizadas para publicidad dirigida</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Control de Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Puedes controlar o eliminar las cookies a través de la configuración de tu navegador. 
              Sin embargo, esto puede afectar tu experiencia en el sitio. La mayoría de los navegadores 
              te permiten rechazar cookies o alertarte cuando se envía una cookie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies de Terceros</h2>
            <p className="text-gray-700 leading-relaxed">
              Algunos terceros, como proveedores de análisis y publicitarios, pueden colocar cookies 
              en tu dispositivo. No controlamos estas cookies de terceros y te recomendamos que revises 
              las políticas de privacidad de estos proveedores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cambios en esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta política de cookies de vez en cuando. Te recomendamos que revises 
              esta página regularmente para mantenerte informado sobre cómo utilizamos las cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre nuestra política de cookies, contáctanos en info@richshakes.ni
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
