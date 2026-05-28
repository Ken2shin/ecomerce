'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Search, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Ticket {
  id: string;
  numero_ticket: string;
  asunto: string;
  descripcion: string;
  estado: 'abierto' | 'en-proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_creacion: string;
  fecha_ultima_actualizacion: string;
  respuestas_count: number;
}

export default function SoportePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [newTicket, setNewTicket] = useState({
    asunto: '',
    descripcion: '',
    prioridad: 'media',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter]);

  async function loadTickets() {
    try {
      const response = await fetch('/api/support/tickets');
      if (response.ok) {
        const data = await response.json();
        // Obtener los tickets del formato de respuesta
        const rawTickets = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        
        // Mapeo de estado inglés a español
        const statusMap: Record<string, 'abierto' | 'en-proceso' | 'resuelto' | 'cerrado'> = {
          'open': 'abierto',
          'in_progress': 'en-proceso',
          'resolved': 'resuelto',
          'closed': 'cerrado',
        };
        
        // Mapeo de prioridad inglés a español
        const priorityMap: Record<string, 'baja' | 'media' | 'alta' | 'urgente'> = {
          'low': 'baja',
          'medium': 'media',
          'high': 'alta',
        };
        
        // Transformar tickets de inglés a español para la UI
        const mappedTickets: Ticket[] = rawTickets.map((ticket: any) => ({
          id: ticket.id,
          numero_ticket: ticket.id?.substring(0, 8)?.toUpperCase() || 'N/A',
          asunto: ticket.subject || '',
          descripcion: ticket.description || '',
          estado: statusMap[ticket.status] || 'abierto',
          prioridad: priorityMap[ticket.priority] || 'media',
          fecha_creacion: ticket.created_at || new Date().toISOString(),
          fecha_ultima_actualizacion: ticket.updated_at || ticket.created_at || new Date().toISOString(),
          respuestas_count: ticket.support_replies?.length || 0,
        }));
        
        setTickets(mappedTickets);
      }
    } catch (error) {
      console.error('[v0] Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  function filterTickets() {
    let filtered = [...tickets];

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.numero_ticket.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((ticket) => ticket.estado === statusFilter);
    }

    setFilteredTickets(filtered);
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Mapeo de prioridad español a inglés
      const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
        'baja': 'low',
        'media': 'medium',
        'alta': 'high',
        'urgente': 'high',
      };
      
      // Enviar con los nombres de campo que espera el API (inglés)
      const ticketPayload = {
        subject: newTicket.asunto,
        description: newTicket.descripcion,
        priority: priorityMap[newTicket.prioridad] || 'medium',
      };
      
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketPayload),
      });
      if (response.ok) {
        setNewTicket({ asunto: '', descripcion: '', prioridad: 'media' });
        setShowNewTicketForm(false);
        loadTickets();
      } else {
        const errorData = await response.json();
        console.error('[v0] Error creating ticket:', errorData);
      }
    } catch (error) {
      console.error('[v0] Error creating ticket:', error);
    }
  }

  function getStatusIcon(estado: string) {
    switch (estado) {
      case 'abierto':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'en-proceso':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'resuelto':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cerrado':
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  }

  function getStatusLabel(estado: string) {
    switch (estado) {
      case 'abierto':
        return 'Abierto';
      case 'en-proceso':
        return 'En Proceso';
      case 'resuelto':
        return 'Resuelto';
      case 'cerrado':
        return 'Cerrado';
      default:
        return estado;
    }
  }

  function getPriorityBadge(prioridad: string) {
    const colors = {
      baja: 'bg-blue-100 text-blue-700',
      media: 'bg-amber-100 text-amber-700',
      alta: 'bg-orange-100 text-orange-700',
      urgente: 'bg-red-100 text-red-700',
    };
    return colors[prioridad as keyof typeof colors] || colors.media;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Centro de Soporte</h1>
          <p className="text-xl text-white/90">
            Gestiona tus tickets de soporte y obtén ayuda rápida
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* New Ticket Section */}
        {!showNewTicketForm && (
          <div className="mb-8">
            <Button
              onClick={() => setShowNewTicketForm(true)}
              className="bg-amber-700 hover:bg-amber-800 gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Nuevo Ticket
            </Button>
          </div>
        )}

        {/* New Ticket Form */}
        {showNewTicketForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Ticket de Soporte</h2>
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto del Problema *
                </label>
                <input
                  type="text"
                  value={newTicket.asunto}
                  onChange={(e) => setNewTicket({ ...newTicket, asunto: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  placeholder="Describe brevemente tu problema"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Detallada *
                </label>
                <textarea
                  value={newTicket.descripcion}
                  onChange={(e) => setNewTicket({ ...newTicket, descripcion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none"
                  rows={6}
                  placeholder="Proporciona todos los detalles para que podamos ayudarte mejor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={newTicket.prioridad}
                  onChange={(e) => setNewTicket({ ...newTicket, prioridad: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                >
                  <option value="baja">Baja - Problema menor</option>
                  <option value="media">Media - Problema moderado</option>
                  <option value="alta">Alta - Problema importante</option>
                  <option value="urgente">Urgente - Necesito ayuda inmediata</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition"
                >
                  Crear Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por asunto o número de ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-gray-400 self-center" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
              >
                <option value="todos">Todos los Estados</option>
                <option value="abierto">Abierto</option>
                <option value="en-proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay tickets</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'todos'
                ? 'No se encontraron tickets con esos criterios'
                : 'No tienes tickets abiertos. ¡Esperamos no tengas problemas!'}
            </p>
            {!showNewTicketForm && (
              <Button
                onClick={() => setShowNewTicketForm(true)}
                className="bg-amber-700 hover:bg-amber-800"
              >
                Crear Primer Ticket
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* SOLUCIÓN: Segunda validación para garantizar que map no falle */}
            {Array.isArray(filteredTickets) && filteredTickets.map((ticket) => (
              <Link key={ticket.id} href={`/soporte/${ticket.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.estado)}
                        <h3 className="text-lg font-bold text-gray-900">
                          {ticket.asunto}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Ticket #{ticket.numero_ticket}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${getPriorityBadge(
                          ticket.prioridad
                        )}`}
                      >
                        {ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1)}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                        {getStatusLabel(ticket.estado)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{ticket.descripcion}</p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex gap-4">
                      <span>{ticket.respuestas_count} respuesta(s)</span>
                      <span>
                        Actualizado: {new Date(ticket.fecha_ultima_actualizacion).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <span className="text-amber-700 hover:text-amber-800 font-medium">
                      Ver Detalles →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}