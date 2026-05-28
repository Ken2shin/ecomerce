'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

export default function ReportsAdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading statistics');
    } finally {
      setLoading(false);
    }
  }

  const cards = stats ? [
    { label: 'Ingresos Totales', value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`, icon: '💰' },
    { label: 'Total de Pedidos', value: stats.totalOrders?.toString() || '0', icon: '📦' },
    { label: 'Productos Activos', value: stats.totalProducts?.toString() || '0', icon: '🛍️' },
    { label: 'Usuarios Registrados', value: stats.totalUsers?.toString() || '0', icon: '👥' },
    { label: 'Pedidos Este Mes', value: stats.ordersThisMonth?.toString() || '0', icon: '📈' },
    { label: 'Ingresos Este Mes', value: `$${stats.revenueThisMonth?.toFixed(2) || '0.00'}`, icon: '💹' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
            <p className="text-gray-600">Visualiza las métricas clave de tu negocio</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
              <option value="all">Todo el Tiempo</option>
            </select>
            <Button variant="outline" onClick={loadStats} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {cards.map((card, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                    </div>
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendencia de Ingresos
                </h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
                  Gráfico de tendencia de ingresos
                </div>
              </div>

              {/* Orders Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendencia de Pedidos
                </h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
                  Gráfico de tendencia de pedidos
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Adicionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Valor Promedio de Pedido</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats && stats.totalRevenue && stats.totalOrders
                      ? (stats.totalRevenue / stats.totalOrders).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
                <div className="border border-gray-200 rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Tasa de Conversión</p>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
