// Importador desde Civitai API
import { ImportResult, ModeloSD } from '../../types';

/**
 * Importa datos desde Civitai API
 * @param url - URL de Civitai (ej: https://civitai.com/models/1490179)
 * @returns Datos del modelo extraídos
 */
export async function importarDesdeCivitai(url: string): Promise<ImportResult> {
  try {
    // Extraer ID del modelo de la URL
    const match = url.match(/models\/(\d+)/);
    if (!match) {
      return { success: false, error: 'URL de Civitai inválida. Formato esperado: https://civitai.com/models/XXXXX' };
    }

    const modelId = match[1];
    
    // Intentar obtener datos de la API de Civitai
    const response = await fetch(`https://civitai.com/api/v1/models/${modelId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Modelo no encontrado en Civitai' };
      }
      if (response.status === 403) {
        return { success: false, error: 'Acceso denegado. La API de Civitai puede requerir autenticación.' };
      }
      return { success: false, error: `Error HTTP ${response.status} al consultar Civitai` };
    }

    const data = await response.json();

    // Mapear datos de Civitai a nuestro esquema
    const version = data.modelVersions?.[0];
    const imagen = version?.images?.[0]?.url || undefined;

    const modeloData: Partial<ModeloSD> = {
      categoria: 'sd',
      nombre: data.name || 'Modelo sin nombre',
      tipo: (data.type || 'Checkpoint').toLowerCase() as ModeloSD['tipo'],
      modelo_base: data.baseModel || 'SD 1.5',
      tags: data.tags || [],
      galeria_urls: version?.images?.map((img: { url: string }) => img.url).slice(0, 12) || [],
      url_civitai: url,
      imagen_principal: imagen || undefined,
      notas: data.description ? stripHtml(data.description).substring(0, 500) : '',
      prompt_referencia: version?.trainedWords?.join(', ') || '',
    };

    // Intentar extraer configuración de la descripción
    if (version?.files?.[0]) {
      const file = version.files[0];
      if (file.sizeKB) {
        modeloData.notas = (modeloData.notas || '') + `\nTamaño: ${(file.sizeKB / 1024).toFixed(1)}MB`;
      }
    }

    return { success: true, data: modeloData };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Error de red. Verifica tu conexión a internet.' };
    }
    return { success: false, error: `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}` };
  }
}

// Función auxiliar para limpiar HTML
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
