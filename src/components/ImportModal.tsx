// Modal de importación desde URLs externas
import React, { useState } from 'react';
import { Modelo, ModeloSD, ModeloLLM } from '../types';
import { importarDesdeCivitai } from '../lib/importers/civitai';
import { importarDesdeHuggingFace } from '../lib/importers/huggingface';

interface ImportModalProps {
  onImport: (datos: Partial<Modelo>) => void;
  onClose: () => void;
}

type FuenteImport = 'auto' | 'civitai' | 'huggingface';

export const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose }) => {
  const [url, setUrl] = useState('');
  const [fuente, setFuente] = useState<FuenteImport>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Partial<Modelo> | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

  const detectarFuente = (url: string): FuenteImport => {
    if (url.includes('civitai.com')) return 'civitai';
    if (url.includes('huggingface.co')) return 'huggingface';
    return 'auto';
  };

  const analizarURL = async () => {
    if (!url.trim()) {
      setError('Por favor, ingresa una URL válida');
      return;
    }

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const fuenteDetectada = fuente === 'auto' ? detectarFuente(url) : fuente;
      let result;

      switch (fuenteDetectada) {
        case 'civitai':
          result = await importarDesdeCivitai(url);
          break;
        case 'huggingface':
          result = await importarDesdeHuggingFace(url);
          break;
        default:
          setError('No se pudo detectar la fuente. Selecciona manualmente Civitai o HuggingFace.');
          setLoading(false);
          return;
      }

      if (result.success && result.data) {
        setPreview(result.data);
        setEditData({
          nombre: result.data.nombre || '',
          tags: (result.data.tags || []).join(', '),
          notas: result.data.notas || '',
          categoria: result.data.categoria || 'sd',
          tipo: result.data.tipo || '',
          modelo_base: (result.data as Partial<ModeloSD>).modelo_base || '',
          imagen_principal: result.data.imagen_principal || '',
        });
      } else {
        setError(result.error || 'Error desconocido al importar');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview) return;

    const datos: Partial<Modelo> = {
      ...preview,
      nombre: editData.nombre || preview.nombre,
      tags: editData.tags ? editData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : preview.tags,
      notas: editData.notas || preview.notas,
      categoria: (editData.categoria as any) || preview.categoria,
      tipo: (editData.tipo as any) || preview.tipo,
      imagen_principal: editData.imagen_principal || preview.imagen_principal,
    };

    onImport(datos);
  };

  const inputClass = "w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">📥 Importar Modelo desde URL</h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Fuente */}
          <div>
            <label className={labelClass}>Fuente</label>
            <div className="flex gap-2">
              {([
                { value: 'auto', label: '🔍 Auto-detectar' },
                { value: 'civitai', label: '🟠 Civitai' },
                { value: 'huggingface', label: '🤗 HuggingFace' },
              ] as { value: FuenteImport; label: string }[]).map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFuente(f.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    fuente === f.value ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className={labelClass}>URL del Modelo</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={inputClass + ' flex-1'}
                placeholder="https://civitai.com/models/1490179 o https://huggingface.co/author/model"
              />
              <button
                onClick={analizarURL}
                disabled={loading || !url.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analizando...
                  </span>
                ) : '🔍 Analizar'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-700 rounded-full animate-pulse" />
                <p className="text-slate-400 text-sm">Consultando API externa...</p>
              </div>
            </div>
          )}

          {/* Preview de datos importados */}
          {preview && !loading && (
            <div className="space-y-4 border-t border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-cyan-300">✅ Datos Extraídos (editables)</h3>
              
              {/* Preview imagen */}
              {preview.imagen_principal && (
                <div className="h-32 rounded-lg overflow-hidden border border-slate-700">
                  <img src={preview.imagen_principal} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input type="text" value={editData.nombre || ''} onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Categoría</label>
                  <select value={editData.categoria || 'sd'} onChange={(e) => setEditData(prev => ({ ...prev, categoria: e.target.value }))} className={inputClass}>
                    <option value="sd">SD</option>
                    <option value="llm">LLM</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tipo</label>
                  <input type="text" value={editData.tipo || ''} onChange={(e) => setEditData(prev => ({ ...prev, tipo: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Modelo Base</label>
                  <input type="text" value={editData.modelo_base || ''} onChange={(e) => setEditData(prev => ({ ...prev, modelo_base: e.target.value }))} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tags</label>
                <input type="text" value={editData.tags || ''} onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>URL Imagen</label>
                <input type="text" value={editData.imagen_principal || ''} onChange={(e) => setEditData(prev => ({ ...prev, imagen_principal: e.target.value }))} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Notas</label>
                <textarea value={editData.notas || ''} onChange={(e) => setEditData(prev => ({ ...prev, notas: e.target.value }))} className={inputClass + ' h-20 resize-none'} />
              </div>

              {/* Info adicional del modelo importado */}
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Información adicional detectada:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {(preview as any).url_civitai && <span>🔗 Civitai: {(preview as any).url_civitai}</span>}
                  {(preview as any).url_huggingface && <span>🤗 HuggingFace: {(preview as any).url_huggingface}</span>}
                  {(preview as any).creador && <span>👤 Creador: {(preview as any).creador}</span>}
                  {(preview as any).modelo_vae && <span>🎨 VAE: {(preview as any).modelo_vae}</span>}
                  {(preview as any).prompt_referencia && <span>✨ Prompt: {(preview as any).prompt_referencia.substring(0, 50)}...</span>}
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={handleImport}
              disabled={!preview || loading}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              📥 Importar Modelo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
