import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award, Users, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 py-20 lg:py-32 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Acerca de Rich Shakes
            </h1>
            <p className="text-xl text-white/90">
              Somos una empresa dedicada a ofrecerte las mejores bebidas artesanales y pasteles frescos, hecho con ingredientes de calidad premium
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Nuestra Historia</h2>
              <p className="text-lg text-gray-700 mb-4">
                Rich Shakes nació en 2015 como un pequeño proyecto de pasión por las bebidas artesanales de calidad. Lo que comenzó en una pequeña cocina se ha convertido hoy en una empresa comprometida con la excelencia.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Durante más de 8 años, hemos trabajado incansablemente para perfeccionar nuestras recetas, seleccionar los mejores ingredientes y garantizar que cada producto que sale de nuestras instalaciones cumple con los más altos estándares de calidad.
              </p>
              <p className="text-lg text-gray-700">
                Hoy, servimos a miles de clientes satisfechos en toda la región, y nuestro compromiso sigue siendo el mismo: ofrecerte bebidas deliciosas y pasteles frescos que hagan tu día más especial.
              </p>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">🏪</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los principios que guían cada decisión que tomamos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: 'Excelencia',
                description: 'Nos esforzamos por la excelencia en cada detalle, desde la selección de ingredientes hasta la entrega final.'
              },
              {
                icon: Users,
                title: 'Comunidad',
                description: 'Creemos en construir relaciones duraderas con nuestros clientes y ser parte de la comunidad.'
              },
              {
                icon: Target,
                title: 'Sostenibilidad',
                description: 'Nos comprometemos con prácticas sostenibles que cuidan el medio ambiente.'
              },
              {
                icon: CheckCircle,
                title: 'Integridad',
                description: 'Transparencia y honestidad en todos nuestros procesos y relaciones comerciales.'
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-8 text-center border border-gray-200 hover:shadow-lg transition">
                  <Icon className="w-12 h-12 text-amber-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gente apasionada dedicada a hacer tu experiencia increíble
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Carlos Martínez', role: 'Fundador y CEO' },
              { name: 'Elena García', role: 'Directora de Operaciones' },
              { name: 'Juan López', role: 'Chef de Recetas' },
              { name: 'María Rodríguez', role: 'Directora de Calidad' },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-5xl">👤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-amber-700 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '8+', label: 'Años en el Negocio' },
              { number: '10K+', label: 'Clientes Satisfechos' },
              { number: '50+', label: 'Productos Diferentes' },
              { number: '24/7', label: 'Disponibilidad' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-5xl font-bold mb-2">{stat.number}</p>
                <p className="text-lg text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para Experimentar la Diferencia?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Descubre por qué miles de clientes confían en Rich Shakes para sus bebidas y pasteles favoritos
          </p>
          <Link href="/productos">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-8">
              Explorar Productos
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
