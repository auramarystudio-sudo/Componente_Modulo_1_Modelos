// Formulario para crear/editar modelos
import React, { useState, useEffect } from 'react';
import { Modelo, ModeloCategoria, TipoSD, TipoLLM, TipoVideo, ModeloSD, ModeloLLM, ModeloVideo } from '../types';

interface ModelFormProps {
  modelo?: Modelo | null;
  onSave: (modelo: Partial<Modelo>) => void;
  onClose: () => void;
}

const tiposSD: TipoSD[] = ['checkpoint', 'lora', 'vae', 'upscaler', 'controlnet', 'embedding'];
const tiposLLM: TipoLLM[] = ['chat', 'completion', 'embedding', 'vision', 'code'];
const tiposVideo: TipoVideo[] = ['text_to_video', 'image_to_video', 'video_to_video', 'animation'];
const frameworksLLM = ['ollama', 'lm_studio', 'llama_cpp', 'vllm', 'text_gen_webui'];
const frameworksVideo = ['stable_video_diffusion', 'animatediff', 'deforum', 'other'];

export const ModelForm: React.FC<ModelFormProps> = ({ modelo, onSave, onClose }) => {
  const [categoria, setCategoria] = useState<ModeloCategoria>(modelo?.categoria || 'sd');
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (modelo) {
      // Cargar datos existentes
      const data: Record<string, any> = { ...modelo };
      data.tags = (modelo.tags || []).join(', ');
      if ((modelo as ModeloSD).galeria_urls) {
        data.galeria_urls = (modelo as ModeloSD).galeria_urls.join(', ');
      }
      setFormData(data);
      setCategoria(modelo.categoria);
    } else {
      setFormData({
        nombre: '',
        tags: '',
        notas: '',
        estado: 'activo',
      });
    }
  }, [modelo]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos para guardar
    const datos: Partial<Modelo> = {
      ...formData,
      categoria,
      tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };

    if (categoria === 'sd') {
      (datos as Partial<ModeloSD>).galeria_urls = formData.galeria_urls 
        ? formData.galeria_urls.split(',').map((u: string) => u.trim()).filter(Boolean) 
        : [];
    }

    onSave(datos);
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
          <h2 className="text-lg font-bold text-white">
            {modelo ? '✏️ Editar Modelo' : '➕ Nuevo Modelo'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de categoría */}
          <div>
            <label className={labelClass}>Categoría</label>
            <div className="flex gap-2">
              {(['sd', 'llm', 'video'] as ModeloCategoria[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoria(cat);
                    handleChange('tipo', cat === 'sd' ? tiposSD[0] : cat === 'llm' ? tiposLLM[0] : tiposVideo[0]);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoria === cat
                      ? cat === 'sd' ? 'bg-blue-600 text-white' :
                        cat === 'llm' ? 'bg-green-600 text-white' :
                        'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat === 'sd' ? '🎨 SD' : cat === 'llm' ? '🧠 LLM' : '🎬 Video'}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className={labelClass}>Nombre *</label>
            <input
              type="text"
              value={formData.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={inputClass}
              placeholder="Nombre del modelo"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo *</label>
            <select
              value={formData.tipo || ''}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Seleccionar tipo...</option>
              {categoria === 'sd' && tiposSD.map(t => <option key={t} value={t}>{t}</option>)}
              {categoria === 'llm' && tiposLLM.map(t => <option key={t} value={t}>{t}</option>)}
              {categoria === 'video' && tiposVideo.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Campos específicos según categoría */}
          {categoria === 'sd' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Modelo Base *</label>
                  <input type="text" value={formData.modelo_base || ''} onChange={(e) => handleChange('modelo_base', e.target.value)} className={inputClass} placeholder="SD 1.5, SDXL 1.0..." required />
                </div>
                <div>
                  <label className={labelClass}>VAE</label>
                  <input type="text" value={formData.modelo_vae || ''} onChange={(e) => handleChange('modelo_vae', e.target.value)} className={inputClass} placeholder="vae.safetensors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sampler</label>
                  <input type="text" value={formData.sampler || ''} onChange={(e) => handleChange('sampler', e.target.value)} className={inputClass} placeholder="DPM++ 2M Karras" />
                </div>
                <div>
                  <label className={labelClass}>Upscaler</label>
                  <input type="text" value={formData.upscaler || ''} onChange={(e) => handleChange('upscaler', e.target.value)} className={inputClass} placeholder="4x-UltraSharp" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Steps</label>
                  <input type="number" value={formData.steps || ''} onChange={(e) => handleChange('steps', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="30" />
                </div>
                <div>
                  <label className={labelClass}>CFG Scale</label>
                  <input type="number" step="0.5" value={formData.cfg_scale || ''} onChange={(e) => handleChange('cfg_scale', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="7" />
                </div>
                <div>
                  <label className={labelClass}>Clip Skip</label>
                  <input type="number" value={formData.clip_skip || ''} onChange={(e) => handleChange('clip_skip', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>VRAM Mínimo</label>
                  <input type="text" value={formData.vram_min || ''} onChange={(e) => handleChange('vram_min', e.target.value)} className={inputClass} placeholder="6GB" />
                </div>
                <div>
                  <label className={labelClass}>VRAM Recomendado</label>
                  <input type="text" value={formData.vram_rec || ''} onChange={(e) => handleChange('vram_rec', e.target.value)} className={inputClass} placeholder="8GB+" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Prompt de Referencia</label>
                <textarea value={formData.prompt_referencia || ''} onChange={(e) => handleChange('prompt_referencia', e.target.value)} className={inputClass + ' h-20 resize-none'} placeholder="masterpiece, best quality..." />
              </div>
              <div>
                <label className={labelClass}>Prompt Negativo Default</label>
                <textarea value={formData.prompt_negativo_default || ''} onChange={(e) => handleChange('prompt_negativo_default', e.target.value)} className={inputClass + ' h-20 resize-none'} placeholder="worst quality, low quality..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>URL Civitai</label>
                  <input type="url" value={formData.url_civitai || ''} onChange={(e) => handleChange('url_civitai', e.target.value)} className={inputClass} placeholder="https://civitai.com/models/..." />
                </div>
                <div>
                  <label className={labelClass}>URL HuggingFace</label>
                  <input type="url" value={formData.url_huggingface || ''} onChange={(e) => handleChange('url_huggingface', e.target.value)} className={inputClass} placeholder="https://huggingface.co/..." />
                </div>
              </div>
              <div>
                <label className={labelClass}>URLs de Galería (separadas por coma)</label>
                <input type="text" value={formData.galeria_urls || ''} onChange={(e) => handleChange('galeria_urls', e.target.value)} className={inputClass} placeholder="https://..., https://..." />
              </div>
            </>
          )}

          {categoria === 'llm' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Framework *</label>
                  <select value={formData.framework || ''} onChange={(e) => handleChange('framework', e.target.value)} className={inputClass} required>
                    <option value="">Seleccionar...</option>
                    {frameworksLLM.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Creador</label>
                  <input type="text" value={formData.creador || ''} onChange={(e) => handleChange('creador', e.target.value)} className={inputClass} placeholder="Meta, Mistral AI..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Versión</label>
                  <input type="text" value={formData.version || ''} onChange={(e) => handleChange('version', e.target.value)} className={inputClass} placeholder="3.1" />
                </div>
                <div>
                  <label className={labelClass}>Parámetros</label>
                  <input type="text" value={formData.tamaño_parametros || ''} onChange={(e) => handleChange('tamaño_parametros', e.target.value)} className={inputClass} placeholder="7B, 70B..." />
                </div>
                <div>
                  <label className={labelClass}>Cuantización</label>
                  <input type="text" value={formData.cuantizacion || ''} onChange={(e) => handleChange('cuantizacion', e.target.value)} className={inputClass} placeholder="Q4_K_M" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contexto Máximo</label>
                  <input type="number" value={formData.contexto_maximo || ''} onChange={(e) => handleChange('contexto_maximo', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="32768" />
                </div>
                <div>
                  <label className={labelClass}>Max Tokens</label>
                  <input type="number" value={formData.max_tokens || ''} onChange={(e) => handleChange('max_tokens', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="4096" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Temperatura</label>
                  <input type="number" step="0.1" value={formData.temperatura_default || ''} onChange={(e) => handleChange('temperatura_default', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="0.7" />
                </div>
                <div>
                  <label className={labelClass}>Top P</label>
                  <input type="number" step="0.05" value={formData.top_p || ''} onChange={(e) => handleChange('top_p', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="0.9" />
                </div>
                <div>
                  <label className={labelClass}>Top K</label>
                  <input type="number" value={formData.top_k || ''} onChange={(e) => handleChange('top_k', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>VRAM Mínimo</label>
                  <input type="text" value={formData.vram_min || ''} onChange={(e) => handleChange('vram_min', e.target.value)} className={inputClass} placeholder="6GB" />
                </div>
                <div>
                  <label className={labelClass}>VRAM Recomendado</label>
                  <input type="text" value={formData.vram_rec || ''} onChange={(e) => handleChange('vram_rec', e.target.value)} className={inputClass} placeholder="8GB+" />
                </div>
              </div>
              <div>
                <label className={labelClass}>System Prompt Default</label>
                <textarea value={formData.system_prompt_default || ''} onChange={(e) => handleChange('system_prompt_default', e.target.value)} className={inputClass + ' h-20 resize-none'} placeholder="Eres un asistente útil..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>URL HuggingFace</label>
                  <input type="url" value={formData.url_huggingface || ''} onChange={(e) => handleChange('url_huggingface', e.target.value)} className={inputClass} placeholder="https://huggingface.co/..." />
                </div>
                <div>
                  <label className={labelClass}>URL Ollama</label>
                  <input type="text" value={formData.url_ollama || ''} onChange={(e) => handleChange('url_ollama', e.target.value)} className={inputClass} placeholder="ollama run model-name" />
                </div>
              </div>
              <div>
                <label className={labelClass}>URL Descarga</label>
                <input type="url" value={formData.url_descarga || ''} onChange={(e) => handleChange('url_descarga', e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </>
          )}

          {categoria === 'video' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Framework *</label>
                  <select value={formData.framework || ''} onChange={(e) => handleChange('framework', e.target.value)} className={inputClass} required>
                    <option value="">Seleccionar...</option>
                    {frameworksVideo.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Modelo Base</label>
                  <input type="text" value={formData.modelo_base || ''} onChange={(e) => handleChange('modelo_base', e.target.value)} className={inputClass} placeholder="SD 2.1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>FPS Recomendado</label>
                  <input type="number" value={formData.fps_recomendado || ''} onChange={(e) => handleChange('fps_recomendado', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="7" />
                </div>
                <div>
                  <label className={labelClass}>Frames Totales</label>
                  <input type="number" value={formData.frames_totales || ''} onChange={(e) => handleChange('frames_totales', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="25" />
                </div>
                <div>
                  <label className={labelClass}>Resolución</label>
                  <input type="text" value={formData.resolucion || ''} onChange={(e) => handleChange('resolucion', e.target.value)} className={inputClass} placeholder="1024x576" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>CFG Scale</label>
                  <input type="number" step="0.5" value={formData.cfg_scale || ''} onChange={(e) => handleChange('cfg_scale', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="2.5" />
                </div>
                <div>
                  <label className={labelClass}>Steps</label>
                  <input type="number" value={formData.steps || ''} onChange={(e) => handleChange('steps', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="30" />
                </div>
                <div>
                  <label className={labelClass}>Motion Bucket ID</label>
                  <input type="number" value={formData.motion_bucket_id || ''} onChange={(e) => handleChange('motion_bucket_id', e.target.value ? Number(e.target.value) : '')} className={inputClass} placeholder="127" />
                </div>
              </div>
              <div>
                <label className={labelClass}>URL Descarga</label>
                <input type="url" value={formData.url_descarga || ''} onChange={(e) => handleChange('url_descarga', e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </>
          )}

          {/* Campos comunes */}
          <div>
            <label className={labelClass}>Tags (separados por coma)</label>
            <input type="text" value={formData.tags || ''} onChange={(e) => handleChange('tags', e.target.value)} className={inputClass} placeholder="tag1, tag2, tag3" />
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={formData.notas || ''} onChange={(e) => handleChange('notas', e.target.value)} className={inputClass + ' h-24 resize-none'} placeholder="Notas adicionales sobre el modelo..." />
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <select value={formData.estado || 'activo'} onChange={(e) => handleChange('estado', e.target.value)} className={inputClass}>
              <option value="activo">Activo</option>
              <option value="archivado">Archivado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>URL Imagen Principal</label>
            <input type="url" value={formData.imagen_principal || ''} onChange={(e) => handleChange('imagen_principal', e.target.value)} className={inputClass} placeholder="https://...imagen.jpg" />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button type="submit" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
              💾 {modelo ? 'Guardar Cambios' : 'Crear Modelo'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
