// Modal de detalle de modelo
import React, { useState } from 'react';
import { Modelo, ModeloSD, ModeloLLM, ModeloVideo } from '../types';
import { GalleryModal } from './GalleryModal';

interface ModelDetailProps {
  modelo: Modelo;
  onClose: () => void;
  onEditar: (modelo: Modelo) => void;
  onEliminar: (id: string) => void;
}

export const ModelDetail: React.FC<ModelDetailProps> = ({ modelo, onClose, onEditar, onEliminar }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const copiarTexto = (texto: string, campo: string) => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiedField(campo);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
            {modelo.imagen_principal ? (
              <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl">
                {modelo.categoria === 'sd' ? '🎨' : modelo.categoria === 'llm' ? '🧠' : '🎬'}
              </span>
            )}
          </div>
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>

          {/* Badges sobre imagen */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
              modelo.categoria === 'sd' ? 'bg-blue-900/70 text-blue-200 border-blue-600' :
              modelo.categoria === 'llm' ? 'bg-green-900/70 text-green-200 border-green-600' :
              'bg-purple-900/70 text-purple-200 border-purple-600'
            }`}>
              {modelo.categoria.toUpperCase()} - {modelo.tipo}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              modelo.estado === 'activo' ? 'bg-green-800/70 text-green-200 border border-green-600' :
              modelo.estado === 'archivado' ? 'bg-gray-700/70 text-gray-300 border border-gray-500' :
              'bg-yellow-800/70 text-yellow-200 border border-yellow-600'
            }`}>
              {modelo.estado}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Nombre y fechas */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{modelo.nombre}</h2>
            <div className="flex gap-4 text-xs text-slate-400">
              <span>Creado: {new Date(modelo.fecha_creacion).toLocaleDateString()}</span>
              <span>Actualizado: {new Date(modelo.fecha_actualizacion).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Tags */}
          {modelo.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {modelo.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-xs border border-cyan-800/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enlaces externos */}
          {((modelo as ModeloSD).url_civitai || (modelo as ModeloSD).url_huggingface || (modelo as ModeloLLM).url_descarga) && (
            <div className="mb-6 flex flex-wrap gap-2">
              {(modelo as ModeloSD).url_civitai && (
                <a href={(modelo as ModeloSD).url_civitai} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-900/50 hover:bg-orange-800 text-orange-200 rounded-lg text-sm border border-orange-700 transition-colors">
                  🔗 Civitai
                </a>
              )}
              {(modelo as any).url_huggingface && (
                <a href={(modelo as any).url_huggingface} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-yellow-900/50 hover:bg-yellow-800 text-yellow-200 rounded-lg text-sm border border-yellow-700 transition-colors">
                  🤗 HuggingFace
                </a>
              )}
              {(modelo as ModeloLLM).url_descarga && (
                <a href={(modelo as ModeloLLM).url_descarga} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-900/50 hover:bg-blue-800 text-blue-200 rounded-lg text-sm border border-blue-700 transition-colors">
                  📥 Descargar
                </a>
              )}
            </div>
          )}

          {/* Configuración para SD */}
          {modelo.categoria === 'sd' && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">⚙️ Configuración Recomendada</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(modelo as ModeloSD).modelo_base && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Modelo Base</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloSD).modelo_base}</div>
                  </div>
                )}
                {(modelo as ModeloSD).modelo_vae && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">VAE</div>
                    <div className="text-sm text-white font-medium truncate">{(modelo as ModeloSD).modelo_vae}</div>
                  </div>
                )}
                {(modelo as ModeloSD).sampler && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Sampler</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloSD).sampler}</div>
                  </div>
                )}
                {(modelo as ModeloSD).steps && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Steps</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloSD).steps}</div>
                  </div>
                )}
                {(modelo as ModeloSD).cfg_scale && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">CFG Scale</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloSD).cfg_scale}</div>
                  </div>
                )}
                {(modelo as ModeloSD).clip_skip && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Clip Skip</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloSD).clip_skip}</div>
                  </div>
                )}
                {(modelo as ModeloSD).vram_min && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">VRAM Mín</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloSD).vram_min}</div>
                  </div>
                )}
                {(modelo as ModeloSD).vram_rec && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">VRAM Rec</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloSD).vram_rec}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requisitos para LLM */}
          {modelo.categoria === 'llm' && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">🖥️ Requisitos y Configuración</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(modelo as ModeloLLM).tamaño_parametros && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Parámetros</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).tamaño_parametros}</div>
                  </div>
                )}
                {(modelo as ModeloLLM).cuantizacion && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Cuantización</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).cuantizacion}</div>
                  </div>
                )}
                {(modelo as ModeloLLM).contexto_maximo && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Contexto Máx</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).contexto_maximo?.toLocaleString()}</div>
                  </div>
                )}
                {(modelo as ModeloLLM).framework && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Framework</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).framework}</div>
                  </div>
                )}
                {(modelo as ModeloLLM).temperatura_default && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Temperatura</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).temperatura_default}</div>
                  </div>
                )}
                {(modelo as ModeloLLM).top_p && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Top P</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).top_p}</div>
                  </div>
                )}
                {(modelo as ModeloLLM).vram_min && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">VRAM Mín</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).vram_min}</div>
                  </div>
                )}
                {(modelo as ModeloLLM).vram_rec && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">VRAM Rec</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloLLM).vram_rec}</div>
                  </div>
                )}
              </div>
              {(modelo as ModeloLLM).creador && (
                <div className="mt-3 text-sm text-slate-400">
                  Creador: <span className="text-white">{(modelo as ModeloLLM).creador}</span>
                  {(modelo as ModeloLLM).version && <span className="text-slate-500"> v{(modelo as ModeloLLM).version}</span>}
                </div>
              )}
            </div>
          )}

          {/* Configuración para Video */}
          {modelo.categoria === 'video' && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">🎬 Configuración de Video</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(modelo as ModeloVideo).framework && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Framework</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).framework}</div>
                  </div>
                )}
                {(modelo as ModeloVideo).fps_recomendado && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">FPS</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).fps_recomendado}</div>
                  </div>
                )}
                {(modelo as ModeloVideo).frames_totales && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Frames</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).frames_totales}</div>
                  </div>
                )}
                {(modelo as ModeloVideo).resolucion && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Resolución</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).resolucion}</div>
                  </div>
                )}
                {(modelo as ModeloVideo).steps && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Steps</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).steps}</div>
                  </div>
                )}
                {(modelo as ModeloVideo).cfg_scale && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">CFG Scale</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).cfg_scale}</div>
                  </div>
                )}
                {(modelo as ModeloVideo).modelo_base && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Modelo Base</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).modelo_base}</div>
                  </div>
                )}
                {(modelo as ModeloVideo).motion_bucket_id && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase">Motion Bucket</div>
                    <div className="text-sm text-white font-medium">{(modelo as ModeloVideo).motion_bucket_id}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompts (solo SD) */}
          {modelo.categoria === 'sd' && (modelo as ModeloSD).prompt_referencia && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-300">✨ Prompt de Referencia</h3>
                <button
                  onClick={() => copiarTexto((modelo as ModeloSD).prompt_referencia || '', 'prompt')}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 rounded transition-colors"
                >
                  {copiedField === 'prompt' ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-sm text-slate-200 font-mono whitespace-pre-wrap">
                {(modelo as ModeloSD).prompt_referencia}
              </div>
            </div>
          )}

          {modelo.categoria === 'sd' && (modelo as ModeloSD).prompt_negativo_default && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-300">🚫 Prompt Negativo</h3>
                <button
                  onClick={() => copiarTexto((modelo as ModeloSD).prompt_negativo_default || '', 'negative')}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 rounded transition-colors"
                >
                  {copiedField === 'negative' ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-sm text-red-300 font-mono whitespace-pre-wrap">
                {(modelo as ModeloSD).prompt_negativo_default}
              </div>
            </div>
          )}

          {/* System Prompt (solo LLM) */}
          {modelo.categoria === 'llm' && (modelo as ModeloLLM).system_prompt_default && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-300">💬 System Prompt</h3>
                <button
                  onClick={() => copiarTexto((modelo as ModeloLLM).system_prompt_default || '', 'system')}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 rounded transition-colors"
                >
                  {copiedField === 'system' ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-sm text-emerald-200 font-mono whitespace-pre-wrap">
                {(modelo as ModeloLLM).system_prompt_default}
              </div>
            </div>
          )}

          {/* Galería */}
          {modelo.galeria_urls && modelo.galeria_urls.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                🖼️ Galería 
                <span className="text-xs text-slate-500 font-normal">({modelo.galeria_urls.length} imágenes - clic para ampliar)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {modelo.galeria_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className="relative group aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <img 
                      src={url} 
                      alt={`Galería ${i + 1}`} 
                      className="w-full h-full object-contain p-1"
                    />
                    {/* Overlay al hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                    </div>
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white backdrop-blur-sm">
                      #{i + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {modelo.notas && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">📝 Notas</h3>
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-sm text-slate-300 whitespace-pre-wrap">
                {modelo.notas}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => onEditar(modelo)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas eliminar este modelo?')) {
                  onEliminar(modelo.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-red-100 rounded-lg text-sm font-medium transition-colors"
            >
              🗑️ Eliminar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors ml-auto"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de galería con carrusel */}
      {galleryIndex !== null && modelo.galeria_urls && (
        <GalleryModal
          images={modelo.galeria_urls}
          initialIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
      )}
    </div>
  );
};
