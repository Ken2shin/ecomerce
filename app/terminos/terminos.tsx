'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Términos y Condiciones</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Términos y Condiciones</h1>
          <p className="text-gray-600 mt-2">Última actualización: Mayo 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar este sitio web, aceptas estar vinculado por estos términos y condiciones. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Licencia de Uso</h2>
            <p className="text-gray-700 leading-relaxed">
              Se te concede una licencia limitada, no exclusiva e intransferible para acceder y usar 
              este sitio web únicamente para propósitos personales y no comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Descripción de Productos</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos esforzamos por proporcionar descripciones precisas de nuestros productos. Sin embargo, 
              no garantizamos que las descripciones sean 100% precisas. Las imágenes son representativas 
              y pueden variar ligeramente del producto real.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed">
              Rich Shakes no será responsable por daños indirectos, incidentales, especiales o consecuentes 
              que resulten del uso o la imposibilidad de usar nuestros productos o servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Devoluciones y Cambios</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ofrecemos devoluciones dentro de 30 días de la compra. Los productos deben estar sin abrir 
              y en condiciones originales. Para más información, consulta nuestra política de devoluciones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cambios en los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
              entrarán en vigor inmediatamente después de la publicación en el sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre estos términos, contáctanos en info@richshakes.ni
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
