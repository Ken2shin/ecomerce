'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Política de Privacidad</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Política de Privacidad</h1>
          <p className="text-gray-600 mt-2">Última actualización: Mayo 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              Rich Shakes respeta tu privacidad y se compromete a proteger tus datos personales. 
              Esta política de privacidad explica cómo recopilamos, utilizamos y protegemos tu información.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Recopilamos información que nos proporcionas directamente, incluyendo:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Nombre, correo electrónico y número de teléfono</li>
              <li>Dirección de envío y facturación</li>
              <li>Información de pago y transacciones</li>
              <li>Preferencias de productos y historial de compras</li>
              <li>Comentarios, reseñas y retroalimentación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Utilizamos tu Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Procesar y completar tus pedidos</li>
              <li>Enviar confirmaciones y actualizaciones de envío</li>
              <li>Responder a tus consultas y proporcionar soporte</li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>Enviar promociones y ofertas especiales</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Protección de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información 
              contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún 
              sistema de seguridad es completamente impenetrable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Derechos de los Usuarios</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Acceder a tus datos personales</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Optar por no recibir comunicaciones de marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre esta política de privacidad o tus datos personales, 
              contáctanos en info@richshakes.ni o llama al +505 (2234) 5678.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
