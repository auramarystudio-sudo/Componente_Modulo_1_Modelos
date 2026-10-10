// Importador desde HuggingFace API con extracción de galería
import { ImportResult, ModeloLLM, ModeloSD } from '../../types';

/**
 * Importa datos desde HuggingFace API
 * @param url - URL de HuggingFace (ej: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
 * @returns Datos del modelo extraídos
 */
export async function importarDesdeHuggingFace(url: string): Promise<ImportResult> {
  try {
    // Extraer repo_id de la URL
    const match = url.match(/huggingface\.co\/(.+?)(?:\/|$)/);
    if (!match) {
      return { success: false, error: 'URL de HuggingFace inválida. Formato esperado: https://huggingface.co/author/model-name' };
    }

    const repoId = match[1];
    
    // Obtener datos del modelo desde la API de HuggingFace
    const response = await fetch(`https://huggingface.co/api/models/${repoId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Modelo no encontrado en HuggingFace' };
      }
      return { success: false, error: `Error HTTP ${response.status} al consultar HuggingFace` };
    }

    const data = await response.json();

    // Intentar obtener imágenes del repositorio (archivos de imagen)
    let galeriaUrls: string[] = [];
    try {
      const treeResponse = await fetch(`https://huggingface.co/api/models/${repoId}/tree/main`);
      if (treeResponse.ok) {
        const tree = await treeResponse.json();
        // Filtrar archivos de imagen
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
        const imageFiles = tree
          .filter((file: any) => {
            const name = (file.path || file.rfilename || '').toLowerCase();
            return imageExtensions.some(ext => name.endsWith(ext));
          })
          .slice(0, 12); // Máximo 12 imágenes
        
        galeriaUrls = imageFiles.map((file: any) => {
          const path = file.path || file.rfilename;
          return `https://huggingface.co/${repoId}/resolve/main/${path}`;
        });
      }
    } catch {
      // Si falla la obtención de galería, continuamos sin ella
      console.warn('No se pudo obtener la galería de imágenes del repositorio');
    }

    // Determinar si es un modelo SD o LLM basado en tags
    const tags: string[] = data.tags || [];
    const isSD = tags.some(t => ['stable-diffusion', 'diffusers', 'text-to-image'].includes(t));
    const isLLM = tags.some(t => ['text-generation', 'llm', 'transformers', 'language-model'].includes(t));

    if (isSD) {
      // Modelo de Stable Diffusion
      const imagenPrincipal = galeriaUrls[0] || undefined;
      const modeloData: Partial<ModeloSD> = {
        categoria: 'sd',
        nombre: data.modelId || data.id || 'Modelo sin nombre',
        tipo: 'checkpoint',
        modelo_base: detectBaseModel(tags),
        tags: tags.slice(0, 20),
        galeria_urls: galeriaUrls,
        url_huggingface: url,
        imagen_principal: imagenPrincipal,
        notas: data.cardData?.model_description || data.description || '',
      };
      return { success: true, data: modeloData };
    } else if (isLLM) {
      // Modelo LLM
      const modeloData: Partial<ModeloLLM> = {
        categoria: 'llm',
        nombre: data.modelId || data.id || 'Modelo sin nombre',
        tipo: detectLLMTipo(tags),
        framework: 'ollama',
        creador: data.author || extractAuthor(repoId),
        tamaño_parametros: data.cardData?.model_params_count || '',
        tags: tags.slice(0, 20),
        url_huggingface: url,
        imagen_principal: galeriaUrls[0] || undefined,
        galeria_urls: galeriaUrls,
        notas: data.cardData?.model_description || '',
      };

      // Extraer contexto máximo si está disponible
      if (data.cardData?.max_length) {
        modeloData.contexto_maximo = data.cardData.max_length;
      }

      return { success: true, data: modeloData };
    } else {
      // Por defecto, tratar como LLM genérico
      const modeloData: Partial<ModeloLLM> = {
        categoria: 'llm',
        nombre: data.modelId || data.id || 'Modelo sin nombre',
        tipo: 'chat',
        framework: 'ollama',
        creador: data.author || extractAuthor(repoId),
        tags: tags.slice(0, 20),
        url_huggingface: url,
        imagen_principal: galeriaUrls[0] || undefined,
        galeria_urls: galeriaUrls,
        notas: `Modelo importado desde HuggingFace. Tags: ${tags.join(', ')}`,
      };
      return { success: true, data: modeloData };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Error de red. Verifica tu conexión a internet.' };
    }
    return { success: false, error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}` };
  }
}

// Detectar modelo base desde tags
function detectBaseModel(tags: string[]): string {
  if (tags.includes('stable-diffusion-xl') || tags.includes('sdxl')) return 'SDXL 1.0';
  if (tags.includes('stable-diffusion-2')) return 'SD 2.1';
  if (tags.includes('stable-diffusion') || tags.includes('sd15')) return 'SD 1.5';
  if (tags.includes('flux')) return 'Flux';
  return 'SD 1.5';
}

// Detectar tipo de LLM desde tags
function detectLLMTipo(tags: string[]): 'chat' | 'completion' | 'embedding' | 'vision' | 'code' {
  if (tags.includes('text-generation-inference') || tags.includes('conversational')) return 'chat';
  if (tags.includes('feature-extraction') || tags.includes('embeddings')) return 'embedding';
  if (tags.includes('image-text-to-text') || tags.includes('vision')) return 'vision';
  if (tags.includes('code')) return 'code';
  return 'completion';
}

// Extraer autor del repo_id
function extractAuthor(repoId: string): string {
  const parts = repoId.split('/');
  return parts.length > 1 ? parts[0] : '';
}
