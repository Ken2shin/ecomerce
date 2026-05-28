'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check } from 'lucide-react';

export default function AdminConfigurationClient() {
  const [storeName, setStoreName] = useState('Rich Shakes');
  const [storePhone, setStorePhone] = useState('+505 1234 5678');
  const [storeEmail, setStoreEmail] = useState('info@richshakes.ni');
  const [storeAddress, setStoreAddress] = useState('Managua, Nicaragua');
  const [taxRate, setTaxRate] = useState('15');
  const [shippingCost, setShippingCost] = useState('50');
  const [currency, setCurrency] = useState('NIO');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          storePhone,
          storeEmail,
          storeAddress,
          taxRate: parseFloat(taxRate),
          shippingCost: parseFloat(shippingCost),
          currency,
        }),
      });

      if (response.ok) {
        setMessage('Configuración guardada correctamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error al guardar la configuración');
      }
    } catch (error) {
      setMessage('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configuración de Tienda</h1>
        <p className="text-muted-foreground mt-2">Administra los ajustes generales de tu tienda</p>
      </div>

      <div className="grid gap-6">
        {/* Información General */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Información General</h2>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre de la Tienda
              </label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Nombre de tu tienda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email de Contacto
              </label>
              <Input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                placeholder="email@tutienda.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Teléfono
              </label>
              <Input
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="+505 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dirección
              </label>
              <Input
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Dirección de tu tienda"
              />
            </div>
          </div>
        </Card>

        {/* Configuración Fiscal */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Configuración Fiscal y Envío</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tasa de Impuesto (%)
              </label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="15"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Costo de Envío (C$)
              </label>
              <Input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="50"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Moneda
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currency}
                  disabled
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                  (Córdobas Nicaragüenses)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Mensaje de Estado */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.includes('correctamente')
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.includes('correctamente') ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={message.includes('correctamente') ? 'text-green-800' : 'text-red-800'}>
              {message}
            </p>
          </div>
        )}

        {/* Botón Guardar */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
