'use client';

import { Truck, Clock, DollarSign, MapPin, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Información de Envíos</h1>
          <p className="text-xl text-white/90">
            Conoce nuestras opciones de entrega rápida y segura
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Shipping Methods */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Métodos de Envío</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Standard Shipping */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                <Truck className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Envío Estándar</h3>
              <p className="text-gray-600 mb-6">Entrega dentro de 3-5 días hábiles a toda la República Mexicana.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span>Costo: $49-99 según destino</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>3-5 días hábiles</span>
                </div>
              </div>
              <button className="w-full mt-6 px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-50 font-medium transition">
                Seleccionar
              </button>
            </div>

            {/* Express Shipping */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-700 p-8 relative">
              <div className="absolute top-4 right-4 bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-6">
                <Truck className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Envío Express</h3>
              <p className="text-gray-600 mb-6">Entrega rápida en 1-2 días hábiles. Perfecto para emergencias.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span>Costo: $149-249 según destino</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>1-2 días hábiles</span>
                </div>
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium transition">
                Seleccionar
              </button>
            </div>

            {/* Same Day */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-6">
                <Truck className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Entrega el Mismo Día</h3>
              <p className="text-gray-600 mb-6">Disponible en CDMX y área metropolitana solamente.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span>Costo: $299-399</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>Antes de las 8 PM</span>
                </div>
              </div>
              <button className="w-full mt-6 px-4 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 font-medium transition">
                Seleccionar
              </button>
            </div>
          </div>
        </div>

        {/* Service Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Características de Nuestro Servicio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-green-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Empaque Seguro</h3>
                  <p className="text-gray-600">Tus productos llegará bien protegidos con empaques especiales.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-blue-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Rastreo en Tiempo Real</h3>
                  <p className="text-gray-600">Monitorea tu paquete desde el almacén hasta tu puerta.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex gap-4">
                <DollarSign className="w-6 h-6 text-amber-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Envío Gratis</h3>
                  <p className="text-gray-600">Envío gratuito en compras mayores a $500 (solamente estándar).</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Garantía de Entrega</h3>
                  <p className="text-gray-600">Si no entregamos a tiempo, recibes un reembolso del envío.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Áreas de Cobertura</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="font-bold text-gray-900 mb-4">Entrega Disponible</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Ciudad de México y área metropolitana
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Todas las capitales estatales
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Ciudades principales de cada estado
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Muchos municipios secundarios
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="font-bold text-gray-900 mb-4">En Desarrollo</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  Envío internacional
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  Retiro en sucursales
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  Locker collection points
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  Envío a PO Box
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Cómo Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Haz tu Compra', desc: 'Selecciona productos y método de envío' },
              { num: '2', title: 'Confirmación', desc: 'Recibe confirmación con código de rastreo' },
              { num: '3', title: 'Preparación', desc: 'Empacamos tu pedido con cuidado' },
              { num: '4', title: 'Entrega', desc: 'Recibe tu paquete en la puerta' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <div className="w-12 h-12 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-1 bg-amber-700"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-700 to-orange-600 rounded-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comprar?</h2>
          <p className="text-lg text-white/90 mb-8">
            Explora nuestro catálogo y disfruta de envíos rápidos y seguros
          </p>
          <Link href="/productos">
            <Button className="bg-white text-amber-700 hover:bg-gray-100 font-bold px-8 py-3">
              Ver Productos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
