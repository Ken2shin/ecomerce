'use client';

import { ChevronRight, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Política de Devoluciones</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Política de Devoluciones</h1>
          <p className="text-gray-600 mt-2">30 días para devolver tus compras sin preocupaciones</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex gap-4">
            <Clock className="w-8 h-8 text-amber-700 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">30 Días de Devolución</h3>
              <p className="text-sm text-gray-600">Tienes 30 días desde la compra para devolver tu producto</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex gap-4">
            <Package className="w-8 h-8 text-amber-700 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Envío Gratis</h3>
              <p className="text-sm text-gray-600">Cobrimos los costos de envío para devoluciones válidas</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex gap-4">
            <CheckCircle className="w-8 h-8 text-amber-700 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Reembolso Rápido</h3>
              <p className="text-sm text-gray-600">Procesamos reembolsos en 5 a 10 días hábiles</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex gap-4">
            <AlertCircle className="w-8 h-8 text-amber-700 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Sin Preguntas</h3>
              <p className="text-sm text-gray-600">Devolucionamos tu dinero sin hacer preguntas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Condiciones de Devolución</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Para que una devolución sea válida, debe cumplir con lo siguiente:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>El producto debe estar sin abrir y en condiciones originales</li>
              <li>Debe incluir todos los componentes, empaque y documentación original</li>
              <li>La solicitud debe hacerse dentro de 30 días de la compra</li>
              <li>El recibo o comprobante de compra debe estar disponible</li>
              <li>El producto no debe tener signos de uso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cómo Solicitar una Devolución</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Sigue estos pasos para solicitar una devolución:</p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <strong>Contacta nuestro soporte:</strong> Envía un email a info@richshakes.ni con tu número de pedido
              </li>
              <li>
                <strong>Recibe instrucciones:</strong> Te enviaremos una etiqueta de envío prepagada
              </li>
              <li>
                <strong>Empaca tu devolución:</strong> Empaca el producto de forma segura
              </li>
              <li>
                <strong>Envía el paquete:</strong> Usa la etiqueta proporciona para enviar el paquete
              </li>
              <li>
                <strong>Recibe reembolso:</strong> Una vez recibido y inspeccionado, procesamos tu reembolso
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Productos no Reembolsables</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Los siguientes productos NO pueden ser devueltos:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Alimentos frescos o perecederos</li>
              <li>Bebidas abiertas o consumidas</li>
              <li>Productos personalizados</li>
              <li>Artículos comprados en liquidación o con descuento mayor al 50%</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reembolsos y Cambios</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Después de recibir y inspeccionar tu devolución, procesaremos tu reembolso. El dinero se 
              devolverá al mismo método de pago original en un plazo de 5 a 10 días hábiles.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Si prefieres un cambio por otro producto, te lo enviaremos sin costo adicional de envío.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contáctanos</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Si tienes preguntas sobre nuestras devoluciones, contáctanos:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-gray-900 font-medium mb-2">Email: info@richshakes.ni</p>
              <p className="text-gray-900 font-medium mb-2">Teléfono: +505 (2234) 5678</p>
              <p className="text-gray-900 font-medium">Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
            </div>
          </section>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link href="/productos">
              <Button className="bg-amber-700 hover:bg-amber-800 text-white w-full md:w-auto">
                Volver a Productos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
