'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Download, BarChart3 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

export default function AdvancedReportsPage() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/reports?startDate=${startDate}&endDate=${endDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('[v0] Error generating report:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generateReport();
  }, []);

  const exportToCSV = () => {
    if (!reportData) return;

    let csv = 'Reporte de Ventas\n';
    csv += `Período: ${startDate} a ${endDate}\n\n`;
    csv += 'Ingresos Totales,Pedidos,Ticket Promedio,Productos Vendidos\n';
    csv += `"${reportData.totalRevenue}","${reportData.totalOrders}","${reportData.averageTicket}","${reportData.totalProductsSold}"\n\n`;

    csv += 'Productos Más Vendidos\n';
    csv += 'Producto,Cantidad,Ingresos\n';
    reportData.topProducts?.forEach((p: any) => {
      csv += `"${p.name}","${p.quantity}","${p.revenue}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `reporte_${startDate}_a_${endDate}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes Avanzados</h1>
        <p className="text-gray-600 mt-2">Análisis detallado de ventas y tendencias</p>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              Fecha Inicio
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              Fecha Fin
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {loading ? 'Generando...' : 'Generar'}
            </Button>
            <Button
              onClick={exportToCSV}
              disabled={!reportData}
              variant="outline"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {reportData ? (
        <div className="space-y-6">
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatPrice(reportData.totalRevenue || 0)}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                +{reportData.revenueGrowth || 0}% vs período anterior
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium">Total Pedidos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {reportData.totalOrders || 0}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                +{reportData.orderGrowth || 0}% vs período anterior
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium">Ticket Promedio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatPrice(reportData.averageTicket || 0)}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Precio promedio por pedido
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium">Productos Vendidos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {reportData.totalProductsSold || 0}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Unidades totales vendidas
              </p>
            </Card>
          </div>

          {/* Productos Más Vendidos */}
          {reportData.topProducts && reportData.topProducts.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Productos Más Vendidos</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Producto</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Cantidad</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Ingresos</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topProducts.map((product: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{product.name}</td>
                        <td className="text-right py-3 px-4 text-gray-900">{product.quantity}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {formatPrice(product.revenue)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          {product.percentage?.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Análisis de Tendencias */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis de Tendencias</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Comparación Período Anterior</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Ingresos:</span>
                    <span className={`font-bold ${(reportData.revenueGrowth || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(reportData.revenueGrowth || 0) > 0 ? '+' : ''}{reportData.revenueGrowth?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Pedidos:</span>
                    <span className={`font-bold ${(reportData.orderGrowth || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(reportData.orderGrowth || 0) > 0 ? '+' : ''}{reportData.orderGrowth?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Ticket Promedio:</span>
                    <span className={`font-bold ${(reportData.ticketGrowth || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(reportData.ticketGrowth || 0) > 0 ? '+' : ''}{reportData.ticketGrowth?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tasa de Conversión</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tasa de Conversión:</span>
                    <span className="font-bold text-gray-900">{reportData.conversionRate?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Clientes Nuevos:</span>
                    <span className="font-bold text-gray-900">{reportData.newCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Clientes Recurrentes:</span>
                    <span className="font-bold text-gray-900">{reportData.recurringCustomers || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center text-gray-500">
          {loading ? <p>Generando reporte...</p> : <p>Selecciona un rango de fechas para generar el reporte</p>}
        </Card>
      )}
    </div>
  );
}
