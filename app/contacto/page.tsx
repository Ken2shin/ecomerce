'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('[v0] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 py-16 lg:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contáctanos</h1>
          <p className="text-xl text-white/90">
            Estamos aquí para responder tus preguntas y ayudarte en lo que necesites
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Teléfono</h3>
                <p className="text-sm text-gray-600">Lunes a Viernes, 9-18h</p>
              </div>
            </div>
            <a href="tel:+5255123456" className="text-amber-700 hover:text-amber-800 font-bold transition">
              +52 55 1234 5678
            </a>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Correo Electrónico</h3>
                <p className="text-sm text-gray-600">Respuesta en 24 horas</p>
              </div>
            </div>
            <a href="mailto:contacto@richshakes.com" className="text-amber-700 hover:text-amber-800 font-bold transition">
              contacto@richshakes.com
            </a>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Dirección</h3>
                <p className="text-sm text-gray-600">Ciudad de México</p>
              </div>
            </div>
            <p className="text-amber-700 font-bold">
              Av. Paseo de la Reforma 505<br />
              Cuauhtémoc, CDMX
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-bold text-green-900">¡Mensaje enviado exitosamente!</p>
                  <p className="text-sm text-green-700">Nos pondremos en contacto pronto</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="+52 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <select
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="pedidos">Preguntas sobre Pedidos</option>
                    <option value="productos">Información de Productos</option>
                    <option value="envios">Información de Envíos</option>
                    <option value="reclamo">Reclamo o Problema</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none"
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Enviando...' : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Horario */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-gray-900">Horario de Atención</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Lunes - Viernes</span>
                  <span className="font-medium">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado</span>
                  <span className="font-medium">10:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="font-medium">Cerrado</span>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Preguntas Frecuentes</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Tienes dudas? Consulta nuestra sección de preguntas frecuentes
              </p>
              <Button variant="outline" className="w-full">
                Ver FAQ
              </Button>
            </div>

            {/* Seguimiento */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Rastrear tu Pedido</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Quieres saber el estado de tu compra?
              </p>
              <Button variant="outline" className="w-full">
                Rastrear Ahora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
