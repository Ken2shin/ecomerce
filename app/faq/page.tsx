'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';

interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    categoria: 'Envíos',
    pregunta: '¿Cuánto tiempo toma la entrega?',
    respuesta: 'Ofrecemos envío estándar de 3-5 días hábiles y envío express de 1-2 días hábiles. Los tiempos pueden variar según tu ubicación y la disponibilidad de productos.',
  },
  {
    id: '2',
    categoria: 'Envíos',
    pregunta: '¿A qué ubicaciones hacen envíos?',
    respuesta: 'Actualmente enviamos a toda la República Mexicana. Estamos trabajando para expandir a más países. Verifica la disponibilidad de envío durante el proceso de compra.',
  },
  {
    id: '3',
    categoria: 'Envíos',
    pregunta: '¿Cuáles son los costos de envío?',
    respuesta: 'Los costos de envío dependen de tu ubicación y del método de envío seleccionado. Los cálculos se muestran en el carrito antes de completar la compra.',
  },
  {
    id: '4',
    categoria: 'Pagos',
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria y pagos en línea seguros.',
  },
  {
    id: '5',
    categoria: 'Pagos',
    pregunta: '¿Es seguro hacer pagos en línea?',
    respuesta: 'Sí, nuestro sitio utiliza encriptación SSL y protocolos de seguridad de nivel bancario. Todos tus datos de pago se transmiten de forma segura.',
  },
  {
    id: '6',
    categoria: 'Devoluciones',
    pregunta: '¿Cuál es la política de devoluciones?',
    respuesta: 'Aceptamos devoluciones dentro de 30 días de la compra si el producto está sin abrir y en perfecto estado. Contacta a nuestro equipo de soporte para iniciar una devolución.',
  },
  {
    id: '7',
    categoria: 'Devoluciones',
    pregunta: '¿Cuánto tiempo toma procesar una devolución?',
    respuesta: 'Las devoluciones se procesan dentro de 5-10 días hábiles después de recibir el producto. El reembolso se acreditará en tu cuenta original.',
  },
  {
    id: '8',
    categoria: 'Cuenta',
    pregunta: '¿Cómo creo una cuenta?',
    respuesta: 'Haz clic en "Crear Cuenta" en la página de inicio de sesión. Completa el formulario con tu nombre, correo y contraseña. ¡Así de simple!',
  },
  {
    id: '9',
    categoria: 'Cuenta',
    pregunta: '¿Olvidé mi contraseña, qué hago?',
    respuesta: 'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones para restablecerla.',
  },
  {
    id: '10',
    categoria: 'Productos',
    pregunta: '¿Cómo sé si un producto está disponible?',
    respuesta: 'Mostramos el estado de stock en cada página de producto. Si dice "Stock limitado", la disponibilidad es baja. Los productos agotados se mostrarán como no disponibles.',
  },
  {
    id: '11',
    categoria: 'Productos',
    pregunta: '¿Puedo hacer pedidos personalizados?',
    respuesta: 'Sí, ofrecemos opciones de personalización para algunos productos. Contacta a nuestro equipo de soporte para discutir tus necesidades especiales.',
  },
  {
    id: '12',
    categoria: 'Soporte',
    pregunta: '¿Cómo me comunico con el servicio al cliente?',
    respuesta: 'Puedes contactarnos a través de nuestra página de soporte, enviar un email a support@richshakes.com o llamar al +52 (555) 123-4567.',
  },
];

const categorias = ['Todos', ...new Set(faqs.map(faq => faq.categoria))];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = faqs.filter(faq => {
    const matchesSearch = faq.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.respuesta.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || faq.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Preguntas Frecuentes</h1>
          <p className="text-xl text-white/90">
            Encuentra respuestas a las preguntas más comunes
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Busca tu pregunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 text-lg"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-amber-700 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg">No se encontraron resultados</p>
              <p className="text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            filtered.map(faq => (
              <div
                key={faq.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full flex items-start justify-between p-6 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-700 uppercase mb-2">{faq.categoria}</p>
                    <p className="text-lg font-bold text-gray-900">{faq.pregunta}</p>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 flex-shrink-0 ml-4 transition ${
                      expandedId === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedId === faq.id && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-700 leading-relaxed">{faq.respuesta}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-amber-700 to-orange-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿No encontraste tu respuesta?</h2>
          <p className="text-lg text-white/90 mb-6">
            Nuestro equipo de soporte está disponible para ayudarte
          </p>
          <Link href="/soporte" className="inline-block bg-white text-amber-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition">
            Contactar Soporte
          </Link>
        </div>
      </div>
    </div>
  );
}
