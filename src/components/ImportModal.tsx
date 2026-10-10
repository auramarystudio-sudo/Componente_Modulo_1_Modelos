// Modal de importación desde URLs externas con soporte de galería
import React, { useState, useRef } from 'react';
import { Modelo, ModeloSD } from '../types';
import { importarDesdeCivitai } from '../lib/importers/civitai';
import { importarDesdeHuggingFace } from '../lib/importers/huggingface';

interface ImportModalProps {
  onImport: (datos: Partial<Modelo>) => void;
  onClose: () => void;
}

type FuenteImport = 'auto' | 'civitai' | 'huggingface';
type ImagenModo = 'url' | 'archivo' | 'galeria';

export const ImportModal: React.FC<ImportModalProps> = ({ onImport, onClose }) => {
  const [url, setUrl] = useState('');
  const [fuente, setFuente] = useState<FuenteImport>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Partial<Modelo> | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [galeriaUrls, setGaleriaUrls] = useState<string[]>([]);
  const [imagenModo, setImagenModo] = useState<ImagenModo>('url');
  const [imagenArchivo, setImagenArchivo] = useState<string | null>(null);
  const [nuevaUrlGaleria, setNuevaUrlGaleria] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectarFuente = (url: string): FuenteImport => {
    if (url.includes('civitai.com')) return 'civitai';
    if (url.includes('huggingface.co')) return 'huggingface';
    return 'auto';
  };

  // Convertir archivo a base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Manejar subida de archivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (PNG, JPG, WebP)');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImagenArchivo(base64);
      setEditData(prev => ({ ...prev, imagen_principal: base64 }));
      setError(null);
    } catch {
      setError('Error al procesar la imagen');
    }
  };

  // Seleccionar imagen de la galería como principal
  const seleccionarDeGaleria = (url: string) => {
    setEditData(prev => ({ ...prev, imagen_principal: url }));
    setImagenModo('galeria');
  };

  // Agregar URL a galería
  const agregarUrlGaleria = () => {
    if (nuevaUrlGaleria.trim() && !galeriaUrls.includes(nuevaUrlGaleria.trim())) {
      setGaleriaUrls(prev => [...prev, nuevaUrlGaleria.trim()]);
      setNuevaUrlGaleria('');
    }
  };

  // Eliminar URL de galería
  const eliminarUrlGaleria = (index: number) => {
    setGaleriaUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Mover imagen en galería
  const moverGaleria = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= galeriaUrls.length) return;
    const newGaleria = [...galeriaUrls];
    [newGaleria[index], newGaleria[newIndex]] = [newGaleria[newIndex], newGaleria[index]];
    setGaleriaUrls(newGaleria);
  };

  const analizarURL = async () => {
    if (!url.trim()) {
      setError('Por favor, ingresa una URL válida');
      return;
    }

    setLoading(true);
    setError(null);
    setPreview(null);
    setGaleriaUrls([]);
    setImagenArchivo(null);

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
        
        // Extraer galería
        const galeriaExtraida = (result.data as Partial<ModeloSD>).galeria_urls || [];
        setGaleriaUrls(galeriaExtraida);
        
        setEditData({
          nombre: result.data.nombre || '',
          tags: (result.data.tags || []).join(', '),
          notas: result.data.notas || '',
          categoria: result.data.categoria || 'sd',
          tipo: result.data.tipo || '',
          modelo_base: (result.data as Partial<ModeloSD>).modelo_base || '',
          imagen_principal: result.data.imagen_principal || '',
          galeria_urls: galeriaExtraida.join('\n'),
        });

        // Si hay galería, usar modo galería
        if (galeriaExtraida.length > 0) {
          setImagenModo('galeria');
        } else {
          setImagenModo('url');
        }
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

    // Determinar imagen principal final
    let imagenFinal = editData.imagen_principal || preview.imagen_principal || '';
    if (imagenModo === 'archivo' && imagenArchivo) {
      imagenFinal = imagenArchivo;
    }

    const datos: Partial<Modelo> = {
      ...preview,
      nombre: editData.nombre || preview.nombre,
      tags: editData.tags ? editData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : preview.tags,
      notas: editData.notas || preview.notas,
      categoria: (editData.categoria as any) || preview.categoria,
      tipo: (editData.tipo as any) || preview.tipo,
      imagen_principal: imagenFinal,
      galeria_urls: galeriaUrls,
    };

    onImport(datos);
  };

  const inputClass = "w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide";

  // Imagen actual seleccionada
  const imagenActual = imagenModo === 'archivo' && imagenArchivo 
    ? imagenArchivo 
    : editData.imagen_principal || preview?.imagen_principal || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">📥 Importar Modelo desde URL</h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
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
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-200 flex items-center gap-2">
              <span>⚠️</span> {error}
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">✕</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-700 rounded-full animate-pulse" />
                <p className="text-slate-400 text-sm">Consultando API externa...</p>
                <p className="text-slate-500 text-xs">Extrayendo datos e imágenes del modelo</p>
              </div>
            </div>
          )}

          {/* Preview de datos importados */}
          {preview && !loading && (
            <div className="space-y-5 border-t border-slate-700 pt-5">
              <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                ✅ Datos Extraídos
                <span className="text-xs text-slate-500 font-normal">(editables)</span>
              </h3>

              {/* ===== SECCIÓN DE IMAGEN PRINCIPAL ===== */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <label className={labelClass + ' mb-3'}>🖼️ Imagen Principal</label>
                
                {/* Selector de modo */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImagenModo('url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      imagenModo === 'url' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    🔗 URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImagenModo('archivo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      imagenModo === 'archivo' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    📁 Subir Archivo
                  </button>
                  {galeriaUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImagenModo('galeria')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        imagenModo === 'galeria' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      🎨 De Galería ({galeriaUrls.length})
                    </button>
                  )}
                </div>

                {/* Preview de la imagen actual */}
                {imagenActual && (
                  <div className="mb-3 relative group">
                    <div className="h-40 rounded-lg overflow-hidden border border-slate-600">
                      <img src={imagenActual} alt="Imagen principal" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white backdrop-blur-sm">
                      {imagenModo === 'url' ? '🔗 URL' : imagenModo === 'archivo' ? '📁 Archivo' : '🎨 Galería'}
                    </div>
                  </div>
                )}

                {/* Modo URL */}
                {imagenModo === 'url' && (
                  <input
                    type="url"
                    value={typeof editData.imagen_principal === 'string' && !editData.imagen_principal?.startsWith('data:') ? editData.imagen_principal || '' : ''}
                    onChange={(e) => { setEditData(prev => ({ ...prev, imagen_principal: e.target.value })); setImagenArchivo(null); }}
                    className={inputClass}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                )}

                {/* Modo Archivo */}
                {imagenModo === 'archivo' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-dashed border-slate-500 rounded-lg text-sm text-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">📁</span>
                      {imagenArchivo ? 'Cambiar imagen...' : 'Seleccionar imagen desde tu equipo'}
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG o WebP. Máximo 5MB.</p>
                  </div>
                )}

                {/* Modo Galería - Grid seleccionable */}
                {imagenModo === 'galeria' && galeriaUrls.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Haz clic en una imagen para seleccionarla como principal:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {galeriaUrls.map((gUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => seleccionarDeGaleria(gUrl)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-slate-800 ${
                            imagenActual === gUrl 
                              ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105' 
                              : 'border-slate-600 hover:border-cyan-500/50'
                          }`}
                        >
                          <img src={gUrl} alt={`Galería ${i + 1}`} className="w-full h-full object-contain p-1" />
                          {imagenActual === gUrl && (
                            <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                            #{i + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ===== SECCIÓN DE GALERÍA ===== */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className={labelClass + ' mb-0'}>🖼️ Galería de Imágenes</label>
                  <span className="text-xs text-slate-500">{galeriaUrls.length} imágenes</span>
                </div>

                {/* Grid de galería actual */}
                {galeriaUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {galeriaUrls.map((gUrl, i) => (
                      <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-600 bg-slate-800">
                        <img src={gUrl} alt={`Galería ${i + 1}`} className="w-full h-full object-contain p-1" />
                        {/* Overlay con acciones */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moverGaleria(i, -1)}
                              disabled={i === 0}
                              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-xs text-white flex items-center justify-center"
                              title="Mover izquierda"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() => moverGaleria(i, 1)}
                              disabled={i === galeriaUrls.length - 1}
                              className="w-6 h-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-xs text-white flex items-center justify-center"
                              title="Mover derecha"
                            >
                              →
                            </button>
                            <button
                              type="button"
                              onClick={() => seleccionarDeGaleria(gUrl)}
                              className="w-6 h-6 bg-cyan-700 hover:bg-cyan-600 rounded text-xs text-white flex items-center justify-center"
                              title="Usar como principal"
                            >
                              ★
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarUrlGaleria(i)}
                              className="w-6 h-6 bg-red-700 hover:bg-red-600 rounded text-xs text-white flex items-center justify-center"
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                          #{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar URL a galería */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={nuevaUrlGaleria}
                    onChange={(e) => setNuevaUrlGaleria(e.target.value)}
                    className={inputClass + ' flex-1'}
                    placeholder="Agregar URL de imagen a la galería..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarUrlGaleria())}
                  />
                  <button
                    type="button"
                    onClick={agregarUrlGaleria}
                    disabled={!nuevaUrlGaleria.trim()}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* ===== DATOS BÁSICOS ===== */}
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
                <label className={labelClass}>Notas</label>
                <textarea value={editData.notas || ''} onChange={(e) => setEditData(prev => ({ ...prev, notas: e.target.value }))} className={inputClass + ' h-20 resize-none'} />
              </div>

              {/* Info adicional */}
              {(preview as any).url_civitai || (preview as any).url_huggingface || (preview as any).creador ? (
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">Información adicional detectada:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    {(preview as any).url_civitai && <span>🔗 Civitai: {(preview as any).url_civitai}</span>}
                    {(preview as any).url_huggingface && <span>🤗 HuggingFace: {(preview as any).url_huggingface}</span>}
                    {(preview as any).creador && <span>👤 Creador: {(preview as any).creador}</span>}
                    {(preview as any).modelo_vae && <span>🎨 VAE: {(preview as any).modelo_vae}</span>}
                    {(preview as any).prompt_referencia && <span className="col-span-2">✨ Prompt: {(preview as any).prompt_referencia.substring(0, 80)}...</span>}
                  </div>
                </div>
              ) : null}
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
