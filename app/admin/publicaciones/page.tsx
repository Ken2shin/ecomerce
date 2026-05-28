'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Check, X, Upload } from 'lucide-react';

export default function PublicacionesPage() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    position: 0,
    isActive: true,
  });

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  async function cargarPublicaciones() {
    try {
      const response = await fetch('/api/publications?admin=true');
      if (response.ok) {
        const data = await response.json();
        setPublicaciones(data);
      }
    } catch (error) {
      console.error('[v0] Error cargando publicaciones:', error);
    } finally {
      setLoading(false);
    }
  }

  async function guardarPublicacion() {
    try {
      const method = editing ? 'PATCH' : 'POST';
      const url = editing ? `/api/publications/${editing}` : '/api/publications';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensaje('Publicación guardada correctamente');
        setShowForm(false);
        setEditing(null);
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          link: '',
          position: 0,
          isActive: true,
        });
        cargarPublicaciones();
      }
    } catch (error) {
      setMensaje('Error al guardar publicación');
    }
  }

  async function eliminarPublicacion(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return;

    try {
      const response = await fetch(`/api/publications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMensaje('Publicación eliminada');
        cargarPublicaciones();
      }
    } catch (error) {
      setMensaje('Error al eliminar publicación');
    }
  }

  function editarPublicacion(pub: any) {
    setFormData({
      title: pub.title,
      description: pub.description || '',
      imageUrl: pub.image_url || '',
      link: pub.link || '',
      position: pub.position || 0,
      isActive: pub.is_active,
    });
    setEditing(pub.id);
    setShowForm(true);
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Publicaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona banners y publicaciones del sitio</p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              imageUrl: '',
              link: '',
              position: 0,
              isActive: true,
            });
            setEditing(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Publicación
        </Button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg ${
          mensaje.includes('correctamente')
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {mensaje}
        </div>
      )}

      {showForm && (
        <Card className="p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4">
            {editing ? 'Editar Publicación' : 'Nueva Publicación'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título de la publicación"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción (opcional)"
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full"
              />
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="mt-2 max-w-xs h-24 object-cover rounded"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enlace (opcional)
              </label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/productos o https://..."
                className="w-full"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posición
                </label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  min="0"
                  className="w-full"
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Activa</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={guardarPublicacion}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                className="bg-gray-400 hover:bg-gray-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {publicaciones.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No hay publicaciones. Crea una nueva.
          </Card>
        ) : (
          publicaciones.map((pub) => (
            <Card key={pub.id} className="p-4 flex gap-4">
              {pub.image_url && (
                <img
                  src={pub.image_url}
                  alt={pub.title}
                  className="w-32 h-32 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{pub.title}</h3>
                {pub.description && <p className="text-gray-600 text-sm">{pub.description}</p>}
                <div className="flex gap-2 mt-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    pub.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pub.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                  {pub.link && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Link: {pub.link}
                  </span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => editarPublicacion(pub)}
                  size="sm"
                  className="bg-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => eliminarPublicacion(pub.id)}
                  size="sm"
                  className="bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
