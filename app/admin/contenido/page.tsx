'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check, Save, X, Palette, Plus, Edit2, Trash2 } from 'lucide-react';
import { SEASONAL_THEMES, getThemeByDate } from '@/lib/seasonal-themes';
import { applySeasonalTheme } from '@/components/theme-provider';

// Secciones predefinidas para el sitio
const SECCIONES_PREDEFINIDAS = [
  { key: 'hero_title', label: 'Título Principal (Hero)', placeholder: 'Ej: Bienvenido a Rich Shakes' },
  { key: 'hero_subtitle', label: 'Subtítulo (Hero)', placeholder: 'Ej: Las mejores bebidas artesanales' },
  { key: 'about_us_title', label: 'Título Sobre Nosotros', placeholder: 'Ej: ¿Quiénes Somos?' },
  { key: 'about_us_content', label: 'Contenido Sobre Nosotros', placeholder: 'Describe tu negocio aquí...' },
  { key: 'footer_company', label: 'Nombre Empresa (Pie)', placeholder: 'Rich Shakes' },
  { key: 'footer_description', label: 'Descripción Empresa (Pie)', placeholder: 'Las mejores bebidas...' },
  { key: 'contact_email', label: 'Email de Contacto', placeholder: 'contacto@richshakes.com' },
  { key: 'contact_phone', label: 'Teléfono de Contacto', placeholder: '+505 XXXX XXXX' },
  { key: 'contact_address', label: 'Dirección', placeholder: 'Barrio Martha Quezada, Managua, Nicaragua' },
];

export default function ContentManagementPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof SEASONAL_THEMES>(getThemeByDate());

  useEffect(() => {
    cargarContenido();
  }, []);

  async function cargarContenido() {
    try {
      const response = await fetch('/api/content');
      if (response.ok) {
        const data = await response.json();
        // Complementar con secciones predefinidas
        const datosMapeados = data.reduce((acc: any, item: any) => {
          acc[item.section_key] = item;
          return acc;
        }, {});

        const seccionesCompletas = SECCIONES_PREDEFINIDAS.map(secc => 
          datosMapeados[secc.key] || {
            id: null,
            section_key: secc.key,
            section_title: secc.label,
            content: '',
            image_url: null,
            is_active: true,
            position: 0,
          }
        );
        setSections(seccionesCompletas);
      }
    } catch (error) {
      console.error('[v0] Error cargando contenido:', error);
      setMessage('Error al cargar contenido');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  async function guardarContenido(sectionKey: string, content: string, title: string) {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey,
          title,
          content,
        }),
      });

      if (response.ok) {
        setMessage('✓ Contenido guardado correctamente');
        setMessageType('success');
        setEditing(null);
        setTimeout(() => cargarContenido(), 500);
      } else {
        setMessage('Error al guardar contenido');
        setMessageType('error');
      }
    } catch (error) {
      console.error('[v0] Error:', error);
      setMessage('Error al guardar contenido');
      setMessageType('error');
    }
  }

  function iniciarEdicion(sectionKey: string, content: string) {
    setEditing(sectionKey);
    setEditingData({ [sectionKey]: content });
  }

  function cambiarTema(newTheme: keyof typeof SEASONAL_THEMES) {
    setSelectedTheme(newTheme);
    applySeasonalTheme(newTheme);
    localStorage.setItem('seasonalTheme', newTheme);
    
    // Emitir evento para actualizar en toda la app
    window.dispatchEvent(new CustomEvent('seasonalThemeChanged', { detail: newTheme }));
    
    setMessage(`✓ Tema ${SEASONAL_THEMES[newTheme].name} aplicado`);
    setMessageType('success');
    setTimeout(() => setMessage(''), 2000);
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administrador de Contenido</h1>
        <p className="text-gray-600 mt-2">Gestiona el contenido y temas de tu sitio web</p>
      </div>

      {/* Selector de Temas Estacionales */}
      <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Temas Estacionales</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Selecciona un tema para cambiar los colores y animaciones del sitio
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(SEASONAL_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => cambiarTema(key as keyof typeof SEASONAL_THEMES)}
              className={`p-4 rounded-lg border-2 transition transform hover:scale-105 ${
                selectedTheme === key
                  ? 'border-blue-600 ring-2 ring-blue-400'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientEnd} 100%)`,
              }}
            >
              <div className="text-sm font-semibold text-gray-800">{theme.name}</div>
              <div className="flex gap-1 mt-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.primaryColor }}
                  title="Color primario"
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.secondaryColor }}
                  title="Color secundario"
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.accentColor }}
                  title="Color acentó"
                />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in fade-in ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {messageType === 'success' ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message}
          </p>
        </div>
      )}

      {/* Secciones de Contenido */}
      <div className="grid gap-4">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Contenido del Sitio</h2>
          <span className="text-sm text-gray-500">({sections.length} secciones)</span>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-gray-500">
            <p>Cargando contenido...</p>
          </Card>
        ) : (
          sections.map((section) => (
            <Card key={section.section_key} className="p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{section.section_title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{section.section_key}</p>
                </div>
                {editing !== section.section_key && (
                  <Button
                    onClick={() => iniciarEdicion(section.section_key, section.content || '')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>

              {editing === section.section_key ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={editingData[section.section_key] || ''}
                      onChange={(e) =>
                        setEditingData({...editingData, [section.section_key]: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 font-sans"
                      rows={6}
                      placeholder="Escribe el contenido aquí..."
                    />
                    <p className="text-xs text-gray-500 mt-2">Puedes usar saltos de línea para dar formato</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => guardarContenido(
                        section.section_key,
                        editingData[section.section_key] || '',
                        section.section_title
                      )}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                    <Button
                      onClick={() => setEditing(null)}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {section.content ? (
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{section.content}</p>
                  ) : (
                    <p className="text-gray-400 italic">Sin contenido - Haz clic en Editar para agregar</p>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
