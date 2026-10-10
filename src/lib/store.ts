// Store de datos - Gestión de modelos con localStorage
import { Modelo, ModeloSD, ModeloLLM, ModeloVideo, ModeloCategoria } from '../types';

const STORAGE_KEY = 'ai_model_hub_models';

// Generar ID único
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Datos de ejemplo iniciales
const modelosIniciales: Modelo[] = [
  {
    id: generateId(),
    categoria: 'sd',
    nombre: 'DreamShaper XL',
    tipo: 'checkpoint',
    modelo_base: 'SDXL 1.0',
    modelo_vae: 'sdxl_vae.safetensors',
    sampler: 'DPM++ 2M Karras',
    steps: 30,
    cfg_scale: 7,
    clip_skip: 2,
    tags: ['realistic', 'artistic', 'versatile', 'sdxl'],
    galeria_urls: [],
    url_civitai: 'https://civitai.com/models/112902',
    prompt_referencia: 'masterpiece, best quality, highly detailed, beautiful lighting',
    prompt_negativo_default: 'worst quality, low quality, blurry, deformed',
    vram_min: '6GB',
    vram_rec: '8GB+',
    notas: 'Excelente checkpoint para arte digital y fotografía realista. Funciona muy bien con SDXL.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: generateId(),
    categoria: 'sd',
    nombre: 'Detail Tweaker LoRA',
    tipo: 'lora',
    modelo_base: 'SD 1.5',
    sampler: 'Euler a',
    steps: 25,
    cfg_scale: 7,
    tags: ['detail', 'enhancement', 'lora', 'sd15'],
    galeria_urls: [],
    prompt_referencia: '<lora:detail_tweaker:0.7> masterpiece, ultra detailed',
    prompt_negativo_default: 'blurry, low quality',
    vram_min: '4GB',
    vram_rec: '6GB',
    notas: 'LoRA para mejorar detalles finos. Usar con peso 0.5-0.8 para mejores resultados.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: generateId(),
    categoria: 'sd',
    nombre: '4x-UltraSharp',
    tipo: 'upscaler',
    modelo_base: 'Universal',
    tags: ['upscaler', '4x', 'sharp', 'universal'],
    galeria_urls: [],
    notas: 'Upscaler de alta calidad para imágenes generadas. Compatible con todos los modelos base.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: generateId(),
    categoria: 'llm',
    nombre: 'Llama 3.1 70B',
    tipo: 'chat',
    framework: 'ollama',
    creador: 'Meta',
    version: '3.1',
    tamaño_parametros: '70B',
    cuantizacion: 'Q4_K_M',
    contexto_maximo: 128000,
    temperatura_default: 0.7,
    top_p: 0.9,
    top_k: 40,
    max_tokens: 4096,
    system_prompt_default: 'Eres un asistente útil y amigable.',
    tags: ['meta', 'llama', 'chat', 'large', 'multilingual'],
    url_huggingface: 'https://huggingface.co/meta-llama/Meta-Llama-3.1-70B',
    url_ollama: 'ollama run llama3.1:70b',
    vram_min: '40GB',
    vram_rec: '48GB+',
    notas: 'Modelo de lenguaje de última generación de Meta. Excelente para tareas complejas de razonamiento.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: generateId(),
    categoria: 'llm',
    nombre: 'Mistral 7B Instruct',
    tipo: 'chat',
    framework: 'llama_cpp',
    creador: 'Mistral AI',
    version: '0.3',
    tamaño_parametros: '7B',
    cuantizacion: 'Q5_K_M',
    contexto_maximo: 32768,
    temperatura_default: 0.7,
    top_p: 0.95,
    max_tokens: 2048,
    system_prompt_default: 'Eres un asistente técnico especializado.',
    tags: ['mistral', 'efficient', 'code', 'instruct'],
    url_huggingface: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3',
    vram_min: '6GB',
    vram_rec: '8GB',
    notas: 'Modelo eficiente para código y tareas técnicas. Excelente relación calidad/rendimiento.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: generateId(),
    categoria: 'llm',
    nombre: 'Nomic Embed Text',
    tipo: 'embedding',
    framework: 'ollama',
    creador: 'Nomic AI',
    tamaño_parametros: '137M',
    cuantizacion: 'F16',
    contexto_maximo: 8192,
    tags: ['embedding', 'nomic', 'rag', 'search'],
    url_ollama: 'ollama run nomic-embed-text',
    vram_min: '1GB',
    vram_rec: '2GB',
    notas: 'Modelo de embeddings de alta calidad para RAG y búsqueda semántica.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: generateId(),
    categoria: 'video',
    nombre: 'Stable Video Diffusion XT',
    tipo: 'image_to_video',
    framework: 'stable_video_diffusion',
    modelo_base: 'SD 2.1',
    fps_recomendado: 7,
    frames_totales: 25,
    resolucion: '1024x576',
    cfg_scale: 2.5,
    steps: 30,
    motion_bucket_id: 127,
    tags: ['svd', 'video', 'animation', 'image-to-video'],
    notas: 'Genera videos cortos a partir de imágenes estáticas. Mejor resultado con imágenes de alta calidad.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
  {
    id: generateId(),
    categoria: 'video',
    nombre: 'AnimateDiff v3',
    tipo: 'animation',
    framework: 'animatediff',
    modelo_base: 'SD 1.5',
    fps_recomendado: 8,
    frames_totales: 16,
    resolucion: '512x512',
    cfg_scale: 7.5,
    steps: 25,
    tags: ['animatediff', 'animation', 'motion', 'sd15'],
    notas: 'Módulo de animación para Stable Diffusion. Permite crear animaciones fluidas con cualquier checkpoint SD 1.5.',
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  },
];

// Cargar modelos desde localStorage o usar iniciales
export function cargarModelos(): Modelo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error cargando modelos:', e);
  }
  // Guardar iniciales
  guardarModelos(modelosIniciales);
  return modelosIniciales;
}

// Guardar modelos en localStorage
export function guardarModelos(modelos: Modelo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modelos));
  } catch (e) {
    console.error('Error guardando modelos:', e);
  }
}

// Crear modelo
export function crearModelo(modelo: Partial<Modelo>): Modelo {
  const modelos = cargarModelos();
  const nuevo: Modelo = {
    ...modelo,
    id: generateId(),
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    estado: modelo.estado || 'activo',
    tags: modelo.tags || [],
    galeria_urls: modelo.galeria_urls || [],
  } as Modelo;
  modelos.push(nuevo);
  guardarModelos(modelos);
  return nuevo;
}

// Actualizar modelo
export function actualizarModelo(id: string, datos: Partial<Modelo>): Modelo | null {
  const modelos = cargarModelos();
  const index = modelos.findIndex(m => m.id === id);
  if (index === -1) return null;
  const actualizado = { ...modelos[index], ...datos, fecha_actualizacion: new Date().toISOString() } as Modelo;
  modelos[index] = actualizado;
  guardarModelos(modelos);
  return actualizado;
}

// Eliminar modelo
export function eliminarModelo(id: string): boolean {
  const modelos = cargarModelos();
  const filtrados = modelos.filter(m => m.id !== id);
  if (filtrados.length === modelos.length) return false;
  guardarModelos(filtrados);
  return true;
}

// Obtener modelo por ID
export function obtenerModelo(id: string): Modelo | null {
  const modelos = cargarModelos();
  return modelos.find(m => m.id === id) || null;
}

// Filtrar modelos
export function filtrarModelos(
  categoria?: ModeloCategoria | 'todos',
  busqueda?: string,
  subtipo?: string
): Modelo[] {
  let modelos = cargarModelos();
  
  // Filtrar por categoría
  if (categoria && categoria !== 'todos') {
    modelos = modelos.filter(m => m.categoria === categoria);
  }
  
  // Filtrar por búsqueda
  if (busqueda && busqueda.trim()) {
    const term = busqueda.toLowerCase().trim();
    modelos = modelos.filter(m => {
      const nombre = m.nombre.toLowerCase();
      const notas = (m.notas || '').toLowerCase();
      const tags = m.tags.join(' ').toLowerCase();
      return nombre.includes(term) || notas.includes(term) || tags.includes(term);
    });
  }
  
  // Filtrar por subtipo
  if (subtipo && subtipo !== 'todos') {
    modelos = modelos.filter(m => m.tipo === subtipo);
  }
  
  return modelos;
}

// Contar modelos por categoría
export function contarPorCategoria(): { todos: number; sd: number; llm: number; video: number } {
  const modelos = cargarModelos();
  return {
    todos: modelos.length,
    sd: modelos.filter(m => m.categoria === 'sd').length,
    llm: modelos.filter(m => m.categoria === 'llm').length,
    video: modelos.filter(m => m.categoria === 'video').length,
  };
}
