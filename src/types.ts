// Tipos para el sistema de gestión de modelos de IA

export type ModeloCategoria = 'sd' | 'llm' | 'video';

export type TipoSD = 'checkpoint' | 'lora' | 'vae' | 'upscaler' | 'controlnet' | 'embedding';
export type TipoLLM = 'chat' | 'completion' | 'embedding' | 'vision' | 'code';
export type TipoVideo = 'text_to_video' | 'image_to_video' | 'video_to_video' | 'animation';
export type Estado = 'activo' | 'archivado' | 'pendiente';

export interface ModeloSD {
  id: string;
  categoria: ModeloCategoria;
  nombre: string;
  tipo: TipoSD;
  modelo_base: string;
  modelo_vae?: string;
  upscaler?: string;
  sampler?: string;
  steps?: number;
  cfg_scale?: number;
  clip_skip?: number;
  tags: string[];
  galeria_urls: string[];
  url_civitai?: string;
  url_huggingface?: string;
  prompt_referencia?: string;
  prompt_negativo_default?: string;
  imagen_principal?: string;
  vram_min?: string;
  vram_rec?: string;
  notas?: string;
  estado: Estado;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ModeloLLM {
  id: string;
  categoria: ModeloCategoria;
  nombre: string;
  tipo: TipoLLM;
  framework: string;
  creador?: string;
  version?: string;
  tamaño_parametros?: string;
  cuantizacion?: string;
  contexto_maximo?: number;
  temperatura_default?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  system_prompt_default?: string;
  tags: string[];
  url_descarga?: string;
  url_huggingface?: string;
  url_ollama?: string;
  vram_min?: string;
  vram_rec?: string;
  imagen_principal?: string;
  notas?: string;
  estado: Estado;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ModeloVideo {
  id: string;
  categoria: ModeloCategoria;
  nombre: string;
  tipo: TipoVideo;
  framework: string;
  modelo_base?: string;
  fps_recomendado?: number;
  frames_totales?: number;
  resolucion?: string;
  cfg_scale?: number;
  steps?: number;
  motion_bucket_id?: number;
  tags: string[];
  url_descarga?: string;
  imagen_principal?: string;
  notas?: string;
  estado: Estado;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export type Modelo = ModeloSD | ModeloLLM | ModeloVideo;

export interface ImportResult {
  success: boolean;
  data?: Partial<Modelo>;
  error?: string;
}
