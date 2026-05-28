'use client';

import { useState, useRef } from 'react';
import { Bold, Italic, Underline, Type, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  imageUrl?: string;
  onImageChange?: (url: string) => void;
}

export function ContentEditorAdvanced({
  content,
  onChange,
  title,
  onTitleChange,
  imageUrl,
  onImageChange,
}: ContentEditorProps) {
  const [preview, setPreview] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);

    onChange(newContent);
  };

  const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'h3') => {
    switch (format) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('_', '_');
        break;
      case 'underline':
        insertText('<u>', '</u>');
        break;
      case 'h1':
        insertText('# ', '\n');
        break;
      case 'h2':
        insertText('## ', '\n');
        break;
      case 'h3':
        insertText('### ', '\n');
        break;
    }
  };

  const renderPreview = (text: string) => {
    return text
      .split('\n')
      .map((line, idx) => {
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-3xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-2xl font-bold mt-3 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-xl font-bold mt-2 mb-1">{line.slice(4)}</h3>;
        }
        if (line.includes('**')) {
          const parts = line.split(/\*\*([^*]+)\*\*/g);
          return (
            <p key={idx} className="mb-2">
              {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
            </p>
          );
        }
        if (line.includes('_')) {
          const parts = line.split(/_([^_]+)_/g);
          return (
            <p key={idx} className="mb-2">
              {parts.map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : part))}
            </p>
          );
        }
        return (
          <p key={idx} className="mb-2 text-gray-700">
            {line || <br />}
          </p>
        );
      });
  };

  return (
    <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
      {/* Title Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Título de la sección"
        />
      </div>

      {/* Image URL */}
      {onImageChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
          <input
            type="url"
            value={imageUrl || ''}
            onChange={(e) => onImageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-2 max-w-xs h-24 object-cover rounded"
            />
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-gray-300 rounded-lg p-2 flex flex-wrap gap-1">
        <Button
          onClick={() => applyFormat('h1')}
          title="Encabezado 1"
          size="sm"
          variant="outline"
          className="text-lg font-bold"
        >
          H1
        </Button>
        <Button
          onClick={() => applyFormat('h2')}
          title="Encabezado 2"
          size="sm"
          variant="outline"
          className="text-lg font-bold"
        >
          H2
        </Button>
        <Button
          onClick={() => applyFormat('h3')}
          title="Encabezado 3"
          size="sm"
          variant="outline"
          className="text-lg font-bold"
        >
          H3
        </Button>
        <div className="w-px bg-gray-300"></div>
        <Button
          onClick={() => applyFormat('bold')}
          title="Negrita"
          size="sm"
          variant="outline"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => applyFormat('italic')}
          title="Cursiva"
          size="sm"
          variant="outline"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => applyFormat('underline')}
          title="Subrayado"
          size="sm"
          variant="outline"
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px bg-gray-300"></div>
        <Button
          onClick={() => setPreview(!preview)}
          size="sm"
          variant="outline"
        >
          {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {preview ? 'Editar' : 'Vista previa'}
        </Button>
      </div>

      {/* Editor/Preview */}
      {preview ? (
        <div className="bg-white border border-gray-300 rounded-lg p-6 min-h-[300px]">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-full max-h-96 object-cover rounded-lg mb-4" />
          )}
          <div className="prose max-w-none">
            {renderPreview(content)}
          </div>
        </div>
      ) : (
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows={10}
          placeholder="Escribe tu contenido aquí. Usa:
# Encabezado 1
## Encabezado 2
**negrita** para negrita
_cursiva_ para cursiva
<u>subrayado</u> para subrayado"
        />
      )}

      <p className="text-xs text-gray-500">
        💡 Usa Markdown: # Título, **negrita**, _cursiva_, &lt;u&gt;subrayado&lt;/u&gt;
      </p>
    </div>
  );
}
