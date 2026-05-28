'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check, Plus, Edit, Trash2, Loader } from 'lucide-react';

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadAds();
  }, []);

  async function loadAds() {
    try {
      setLoading(true);
      const response = await fetch('/api/advertisements', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setAds(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error('[v0] Error loading ads:', response.status);
        setAds([]);
      }
    } catch (error) {
      console.error('[v0] Error loading ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAd() {
    if (!formData.title || !formData.imageUrl) {
      setMessage('Título e imagen son requeridos');
      setMessageType('error');
      return;
    }

    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const payload = editing
        ? { id: editing, ...formData }
        : formData;

      const response = await fetch('/api/advertisements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const message = editing ? 'Publicidad actualizada correctamente' : 'Publicidad guardada correctamente';
        setMessage(message);
        setMessageType('success');
        setShowForm(false);
        setEditing(null);
        setFormData({ title: '', imageUrl: '', linkUrl: '', description: '' });
        // Force reload from server
        await loadAds();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error al guardar publicidad');
        setMessageType('error');
      }
    } catch (error) {
      console.error('[v0] Save error:', error);
      setMessage('Error al guardar publicidad');
      setMessageType('error');
    } finally {
      setSaving(false);
      // Auto-hide message after 4 seconds
      setTimeout(() => setMessage(''), 4000);
    }
  }

  async function handleDeleteAd(adId: string) {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicidad?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/advertisements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId }),
      });

      if (response.ok) {
        setMessage('Publicidad eliminada correctamente');
        setMessageType('success');
        await loadAds();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error al eliminar publicidad');
        setMessageType('error');
      }
    } catch (error) {
      console.error('[v0] Delete error:', error);
      setMessage('Error al eliminar publicidad');
      setMessageType('error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 4000);
    }
  }

  function handleEditAd(ad: any) {
    setEditing(ad.id);
    setFormData({
      title: ad.title,
      imageUrl: ad.image_url || '',
      linkUrl: ad.link_url || '',
      description: ad.description || '',
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
    setFormData({ title: '', imageUrl: '', linkUrl: '', description: '' });
  }

  if (loading && ads.length === 0) {
    return <div className="p-8 text-center text-gray-500">Cargando publicidades...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrador de Publicidades</h1>
          <p className="text-gray-600 mt-2">Gestiona los anuncios de tu sitio web</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={saving}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Publicidad
          </Button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {messageType === 'success' ? (
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message}
          </p>
        </div>
      )}

      {showForm && (
        <Card className="p-6 mb-6 border-l-4 border-l-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editing ? 'Editar Publicidad' : 'Nueva Publicidad'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Título *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del anuncio"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                URL de Imagen *
              </label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                URL de Enlace
              </label>
              <Input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://ejemplo.com"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                rows={3}
                placeholder="Descripción del anuncio"
                disabled={saving}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveAd}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6">
        {ads.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p>No hay publicidades disponibles. Crea la primera haciendo clic en "Nueva Publicidad"</p>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="p-6 flex gap-6 hover:shadow-lg transition-shadow">
              <div className="flex-shrink-0 w-48 h-32">
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{ad.title}</h3>
                    <p className="text-gray-600 mt-2 text-sm">{ad.description}</p>
                    {ad.link_url && (
                      <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 mt-2 inline-block text-sm"
                      >
                        Ver más →
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                  onClick={() => handleEditAd(ad)}
                  disabled={saving}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600"
                  onClick={() => handleDeleteAd(ad.id)}
                  disabled={saving}
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
