'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface CartItem {
  id: string;
  nombre: string;
  precio?: number | string;
  price?: number | string;
  cantidad: number;
  imagen_url?: string;
  image_url?: string;
  imagen?: string;
  image?: string;
}

export default function CarritoPage() {
  const router = useRouter(); // Instanciamos el router para forzar la navegación correcta
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Verificamos que sea un array y eliminamos cualquier elemento nulo o sin ID
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(item => item && typeof item === 'object' && item.id);
          setCartItems(validItems);
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('[v0] Error loading cart:', error);
      setCartItems([]); // En caso de que el JSON esté totalmente roto
    } finally {
      setLoading(false);
    }
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    const updated = cartItems.map(item =>
      item.id === itemId ? { ...item, cantidad: quantity } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  function removeItem(itemId: string) {
    const updated = cartItems.filter(item => item.id !== itemId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  function clearCart() {
    setCartItems([]);
    localStorage.removeItem('cart');
  }

  // Cálculos súper seguros forzando tipo Number y evadiendo undefined/null
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item) return sum;
    const precioSeguro = Number(item.precio || item.price || 0);
    const cantidadSegura = Number(item.cantidad || 1);
    return sum + (precioSeguro * cantidadSegura);
  }, 0);
  
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {/* Aquí sí usamos Link porque es un texto con icono, no un botón HTML */}
            <Link href="/productos" className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Productos</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Carrito de Compras</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega productos para comenzar a comprar</p>
            {/* Navegación corregida con router.push */}
            <Button 
              onClick={() => router.push('/productos')} 
              className="bg-amber-700 hover:bg-amber-800 gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h2 className="font-bold text-gray-900">
                    {cartItems.length} {cartItems.length === 1 ? 'Producto' : 'Productos'}
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    const precioItem = Number(item?.precio || item?.price || 0);
                    const cantidadItem = Number(item?.cantidad || 1);
                    const fotoReal = item?.imagen_url || item?.image_url || item?.imagen || item?.image;

                    return (
                      <div key={item.id} className="px-6 py-6 flex gap-6 hover:bg-gray-50 transition">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {fotoReal ? (
                            <img 
                              src={fotoReal} 
                              alt={item.nombre} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          
                          <div className={`text-gray-400 ${fotoReal ? 'hidden' : 'block'}`}>
                            <ImageIcon className="w-8 h-8 opacity-50" />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-grow">
                          <Link href={`/productos/${item.id}`}>
                            <h3 className="font-bold text-gray-900 hover:text-amber-700 transition">
                              {item.nombre}
                            </h3>
                          </Link>
                          <p className="text-lg font-bold text-amber-700 mt-2">
                            C${precioItem.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2">
                          <button
                            onClick={() => updateQuantity(item.id, cantidadItem - 1)}
                            className="text-gray-600 hover:text-gray-900 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{cantidadItem}</span>
                          <button
                            onClick={() => updateQuantity(item.id, cantidadItem + 1)}
                            className="text-gray-600 hover:text-gray-900 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-fit">
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="text-lg font-bold text-gray-900">
                            C${(precioItem * cantidadItem).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Clear Cart Button */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-medium text-sm transition"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de Orden</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>C${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Impuestos (10%)</span>
                    <span>C${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-amber-700">
                      C${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Navegación al Checkout corregida con router.push */}
                <Button 
                  onClick={() => router.push('/checkout')} 
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition"
                >
                  Proceder al Pago
                </Button>

                {/* Botón continuar comprando corregido */}
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/productos')} 
                  className="w-full mt-3"
                >
                  Continuar Comprando
                </Button>

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600">
                    🔒 Compra segura con encriptación SSL
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}