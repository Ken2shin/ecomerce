'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChevronRight, Lock, Truck, AlertCircle } from 'lucide-react';

interface OrderData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  
  // Estados de UI y Formulario
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [formData, setFormData] = useState<OrderData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'NI',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados del Carrito
  const [cartSubtotal, setCartSubtotal] = useState<number>(0);
  const [isFetchingCart, setIsFetchingCart] = useState<boolean>(true);

  // Cargar datos del carrito desde el localStorage (Igual que en la página del carrito)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Si hay productos válidos en el localStorage
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Calculamos el subtotal de forma segura
          const subtotalCalculado = parsed.reduce((sum, item) => {
            if (!item) return sum;
            const precioSeguro = Number(item.precio || item.price || 0);
            const cantidadSegura = Number(item.cantidad || 1);
            return sum + (precioSeguro * cantidadSegura);
          }, 0);

          setCartSubtotal(subtotalCalculado);
          setIsFetchingCart(false);
          return; // Terminamos aquí exitosamente
        }
      }

      // Si llegamos a este punto, el carrito de verdad está vacío o corrupto
      router.push('/carrito');
      
    } catch (err) {
      console.error('Error cargando el carrito en el checkout:', err);
      router.push('/carrito');
    }
  }, [router]);

  // Cálculos dinámicos
  const taxes = cartSubtotal * 0.10; // 10% de impuestos
  const shippingCost = 0; // Envío estándar gratis
  const finalTotal = cartSubtotal + taxes + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Simular el procesamiento del pago (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. Limpiar el carrito del localStorage porque la orden ya se pagó
      localStorage.removeItem('cart');

      // 3. Mostrar confirmación
      setStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Refrescar para que el navbar actualice la cantidad de items
      router.refresh(); 
      
    } catch (err) {
      setError('Error procesando el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Prevenir que se renderice el formulario si estamos redirigiendo
  if (isFetchingCart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-amber-700 font-medium flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-700"></div>
          Preparando tu orden...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="font-bold text-xl text-amber-700">Rich Shakes</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${step === 'shipping' ? 'text-amber-700' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 bg-amber-700 text-white">
                1
              </div>
              <span className="text-sm font-medium">Envío</span>
            </div>

            <div className="flex-grow h-1 bg-gray-300 mx-4"></div>

            <div className={`flex flex-col items-center ${['payment', 'confirmation'].includes(step) ? 'text-amber-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                ['payment', 'confirmation'].includes(step) ? 'bg-amber-700 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Pago</span>
            </div>

            <div className="flex-grow h-1 bg-gray-300 mx-4"></div>

            <div className={`flex flex-col items-center ${step === 'confirmation' ? 'text-amber-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                step === 'confirmation' ? 'bg-amber-700 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Confirmación</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Shipping Step */}
        {step === 'shipping' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Envío</h2>

            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="Juan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="juan@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="+52 123 456 7890"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  placeholder="Calle Principal 123, Apto 4B"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="Ciudad de México"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    placeholder="06600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  >
                    <option value="NI">Nicaragua</option>
                    <option value="MX">México</option>
                    <option value="US">Estados Unidos</option>
                    <option value="CA">Canadá</option>
                  </select>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Método de Envío</h3>
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input type="radio" name="shipping" value="standard" defaultChecked className="w-4 h-4" />
                  <div className="ml-4 flex-grow">
                    <p className="font-medium text-gray-900">Envío Estándar</p>
                    <p className="text-sm text-gray-600">5-7 días hábiles • Gratis</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">C$0.00</span>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/carrito')}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition"
                >
                  Volver al Carrito
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  Continuar al Pago
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Pago</h2>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Tus datos de pago se procesan de forma segura con encriptación SSL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta</label>
                <input
                  type="text"
                  placeholder="4532 1234 5678 9010"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  defaultValue="4532 1234 5678 9010"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vencimiento</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    defaultValue="12/26"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                    defaultValue="123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre en la Tarjeta</label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  defaultValue={`${formData.firstName} ${formData.lastName}`.trim()}
                />
              </div>

              {/* Order Summary Dinámico */}
              <div className="border-t border-gray-200 pt-6 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                <h3 className="font-bold text-gray-900 mb-4">Resumen de Orden</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>C${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Impuestos (10%)</span>
                    <span>C${taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>{shippingCost === 0 ? 'Gratis' : `C$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-amber-300 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-amber-700">C${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Procesando...' : 'Completar Pago'}
                  {!loading && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Confirmado!</h2>
            <p className="text-gray-600 mb-8">Tu orden ha sido procesada exitosamente</p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Orden</span>
                  <span className="font-bold text-gray-900">#ORD-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Correo de Confirmación</span>
                  <span className="font-bold text-gray-900">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pagado</span>
                  <span className="font-bold text-amber-700">C${finalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-300">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Envío Estimado
                  </span>
                  <span className="font-bold text-gray-900">5-7 días hábiles</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => router.push('/productos')}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition"
              >
                Continuar Comprando
              </button>
              <button 
                onClick={() => router.push('/')}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}