// Componente de tarjeta de modelo
import React from 'react';
import { Modelo, ModeloSD, ModeloLLM, ModeloVideo } from '../types';

interface ModelCardProps {
  modelo: Modelo;
  onVerDetalle: (modelo: Modelo) => void;
  onEditar: (modelo: Modelo) => void;
  onEliminar: (id: string) => void;
}

// Colores por categoría
const categoriaColors = {
  sd: {
    bg: 'bg-slate-900',
    border: 'border-slate-700',
    hoverBorder: 'hover:border-blue-500/50',
    gradient: 'from-blue-900/40 to-slate-900',
  },
  llm: {
    bg: 'bg-green-950/30',
    border: 'border-green-900/50',
    hoverBorder: 'hover:border-green-500/50',
    gradient: 'from-green-900/40 to-slate-900',
  },
  video: {
    bg: 'bg-purple-950/30',
    border: 'border-purple-900/50',
    hoverBorder: 'hover:border-purple-500/50',
    gradient: 'from-purple-900/40 to-slate-900',
  },
};

// Badge colors por tipo
const tipoBadgeColors: Record<string, string> = {
  checkpoint: 'bg-blue-900/60 text-blue-200 border-blue-700',
  lora: 'bg-green-900/60 text-green-200 border-green-700',
  vae: 'bg-orange-900/60 text-orange-200 border-orange-700',
  upscaler: 'bg-yellow-900/60 text-yellow-200 border-yellow-700',
  controlnet: 'bg-red-900/60 text-red-200 border-red-700',
  embedding: 'bg-pink-900/60 text-pink-200 border-pink-700',
  chat: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
  completion: 'bg-teal-900/60 text-teal-200 border-teal-700',
  vision: 'bg-cyan-900/60 text-cyan-200 border-cyan-700',
  code: 'bg-indigo-900/60 text-indigo-200 border-indigo-700',
  text_to_video: 'bg-purple-900/60 text-purple-200 border-purple-700',
  image_to_video: 'bg-violet-900/60 text-violet-200 border-violet-700',
  video_to_video: 'bg-fuchsia-900/60 text-fuchsia-200 border-fuchsia-700',
  animation: 'bg-pink-900/60 text-pink-200 border-pink-700',
};

// Iconos por categoría
const categoriaIcons: Record<string, string> = {
  sd: '🎨',
  llm: '🧠',
  video: '🎬',
};

export const ModelCard: React.FC<ModelCardProps> = ({ modelo, onVerDetalle, onEditar, onEliminar }) => {
  const colors = categoriaColors[modelo.categoria];
  const badgeColor = tipoBadgeColors[modelo.tipo] || 'bg-slate-700 text-slate-200';
  const icon = categoriaIcons[modelo.categoria];
  const descripcion = (modelo.notas || '').substring(0, 80);

  return (
    <div className={`${colors.bg} border ${colors.border} ${colors.hoverBorder} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 group`}>
      {/* Imagen principal o placeholder */}
      <div className="relative h-40 overflow-hidden">
        {modelo.imagen_principal ? (
          <img
            src={modelo.imagen_principal}
            alt={modelo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
            <span className="text-5xl">{icon}</span>
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badgeColor} backdrop-blur-sm`}>
            {modelo.tipo}
          </span>
        </div>

        {/* Badge de categoría */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-200 border border-slate-600 backdrop-blur-sm">
            {modelo.categoria.toUpperCase()}
          </span>
        </div>

        {/* Estado */}
        {modelo.estado !== 'activo' && (
          <div className="absolute bottom-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              modelo.estado === 'archivado' ? 'bg-gray-700 text-gray-300' : 'bg-yellow-700 text-yellow-200'
            }`}>
              {modelo.estado}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm truncate mb-1" title={modelo.nombre}>
          {modelo.nombre}
        </h3>
        
        {descripcion && (
          <p className="text-slate-400 text-xs mb-3 line-clamp-2">{descripcion}...</p>
        )}

        {/* Info específica según tipo */}
        {modelo.categoria === 'sd' && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(modelo as ModeloSD).sampler && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                {(modelo as ModeloSD).sampler}
              </span>
            )}
            {(modelo as ModeloSD).steps && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                Steps: {(modelo as ModeloSD).steps}
              </span>
            )}
            {(modelo as ModeloSD).cfg_scale && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                CFG: {(modelo as ModeloSD).cfg_scale}
              </span>
            )}
          </div>
        )}

        {modelo.categoria === 'llm' && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(modelo as ModeloLLM).tamaño_parametros && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                {(modelo as ModeloLLM).tamaño_parametros} params
              </span>
            )}
            {(modelo as ModeloLLM).cuantizacion && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                {(modelo as ModeloLLM).cuantizacion}
              </span>
            )}
            {(modelo as ModeloLLM).framework && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                {(modelo as ModeloLLM).framework}
              </span>
            )}
          </div>
        )}

        {modelo.categoria === 'video' && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(modelo as ModeloVideo).fps_recomendado && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                {(modelo as ModeloVideo).fps_recomendado} FPS
              </span>
            )}
            {(modelo as ModeloVideo).resolucion && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                {(modelo as ModeloVideo).resolucion}
              </span>
            )}
            {(modelo as ModeloVideo).framework && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                {(modelo as ModeloVideo).framework}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {modelo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {modelo.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-cyan-900/30 text-cyan-300 rounded text-[10px] border border-cyan-800/50">
                #{tag}
              </span>
            ))}
            {modelo.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-slate-500 text-[10px]">
                +{modelo.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <button
            onClick={() => onVerDetalle(modelo)}
            className="flex-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg transition-colors font-medium"
          >
            Ver Detalle
          </button>
          <button
            onClick={() => onEditar(modelo)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onEliminar(modelo.id)}
            className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs rounded-lg transition-colors"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};
