// Componente principal de gestión de modelos
import React, { useState, useEffect, useCallback } from 'react';
import { Modelo, ModeloCategoria } from '../types';
import { cargarModelos, crearModelo, actualizarModelo, eliminarModelo, filtrarModelos, contarPorCategoria } from '../lib/store';
import { ModelCard } from './ModelCard';
import { ModelDetail } from './ModelDetail';
import { ModelForm } from './ModelForm';
import { ImportModal } from './ImportModal';

type TabActivo = 'todos' | ModeloCategoria;

const subtiposPorCategoria: Record<string, string[]> = {
  todos: ['todos'],
  sd: ['todos', 'checkpoint', 'lora', 'vae', 'upscaler', 'controlnet', 'embedding'],
  llm: ['todos', 'chat', 'completion', 'embedding', 'vision', 'code'],
  video: ['todos', 'text_to_video', 'image_to_video', 'video_to_video', 'animation'],
};

export const ModelosManager: React.FC = () => {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tabActivo, setTabActivo] = useState<TabActivo>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [subtipoFiltro, setSubtipoFiltro] = useState('todos');
  const [contadores, setContadores] = useState({ todos: 0, sd: 0, llm: 0, video: 0 });
  
  // Modales
  const [modeloDetalle, setModeloDetalle] = useState<Modelo | null>(null);
  const [modeloEditar, setModeloEditar] = useState<Modelo | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarImportar, setMostrarImportar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Cargar datos
  const refreshData = useCallback(() => {
    const filtered = filtrarModelos(
      tabActivo === 'todos' ? undefined : tabActivo,
      busqueda,
      subtipoFiltro === 'todos' ? undefined : subtipoFiltro
    );
    setModelos(filtered);
    setContadores(contarPorCategoria());
  }, [tabActivo, busqueda, subtipoFiltro]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Cambiar tab resetea filtro de subtipo
  const cambiarTab = (tab: TabActivo) => {
    setTabActivo(tab);
    setSubtipoFiltro('todos');
  };

  // Crear modelo
  const handleCrear = (datos: Partial<Modelo>) => {
    crearModelo(datos);
    setMostrarFormulario(false);
    refreshData();
  };

  // Editar modelo
  const handleEditar = (datos: Partial<Modelo>) => {
    if (modeloEditar) {
      actualizarModelo(modeloEditar.id, datos);
      setModeloEditar(null);
      setMostrarFormulario(false);
      refreshData();
    }
  };

  // Eliminar modelo
  const handleEliminar = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmarEliminar = () => {
    if (confirmDelete) {
      eliminarModelo(confirmDelete);
      setConfirmDelete(null);
      setModeloDetalle(null);
      refreshData();
    }
  };

  // Importar modelo
  const handleImportar = (datos: Partial<Modelo>) => {
    crearModelo(datos);
    setMostrarImportar(false);
    refreshData();
  };

  // Abrir formulario para editar
  const abrirEditar = (modelo: Modelo) => {
    setModeloEditar(modelo);
    setMostrarFormulario(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                🤖 AI Model Hub
              </h1>
              <p className="text-sm text-slate-400 mt-1">Galería unificada de modelos SD, LLM y Video</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setModeloEditar(null); setMostrarFormulario(true); }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                <span className="hidden sm:inline">Nuevo Modelo</span>
              </button>
              <button
                onClick={() => setMostrarImportar(true)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>📥</span>
                <span className="hidden sm:inline">Importar URL</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 mb-4">
            {([
              { key: 'todos', label: 'Todos', icon: '📦' },
              { key: 'sd', label: 'SD', icon: '🎨' },
              { key: 'llm', label: 'LLM', icon: '🧠' },
              { key: 'video', label: 'Video', icon: '🎬' },
            ] as { key: TabActivo; label: string; icon: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => cambiarTab(tab.key)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  tabActivo === tab.key
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
                <span className="ml-1 text-xs opacity-70">
                  ({contadores[tab.key]})
                </span>
              </button>
            ))}
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, tags, descripción..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Filtro de subtipo */}
            <select
              value={subtipoFiltro}
              onChange={(e) => setSubtipoFiltro(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              {subtiposPorCategoria[tabActivo].map(st => (
                <option key={st} value={st}>
                  {st === 'todos' ? 'Todos los tipos' : st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Estado vacío */}
        {modelos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {busqueda ? '🔍' : '📭'}
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {busqueda ? 'Sin resultados' : 'No hay modelos'}
            </h3>
            <p className="text-slate-500 mb-6">
              {busqueda 
                ? `No se encontraron modelos para "${busqueda}"`
                : 'Comienza creando tu primer modelo o importando desde una URL'
              }
            </p>
            {!busqueda && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setModeloEditar(null); setMostrarFormulario(true); }}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                >
                  ➕ Crear Modelo
                </button>
                <button
                  onClick={() => setMostrarImportar(true)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors"
                >
                  📥 Importar desde URL
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Contador de resultados */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Mostrando <span className="text-white font-medium">{modelos.length}</span> modelo{modelos.length !== 1 ? 's' : ''}
                {busqueda && <span> para "<span className="text-cyan-300">{busqueda}</span>"</span>}
              </p>
            </div>

            {/* Grid de modelos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modelos.map(modelo => (
                <ModelCard
                  key={modelo.id}
                  modelo={modelo}
                  onVerDetalle={setModeloDetalle}
                  onEditar={abrirEditar}
                  onEliminar={handleEliminar}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modales */}
      {modeloDetalle && (
        <ModelDetail
          modelo={modeloDetalle}
          onClose={() => setModeloDetalle(null)}
          onEditar={(m) => { setModeloDetalle(null); abrirEditar(m); }}
          onEliminar={handleEliminar}
        />
      )}

      {mostrarFormulario && (
        <ModelForm
          modelo={modeloEditar}
          onSave={modeloEditar ? handleEditar : handleCrear}
          onClose={() => { setMostrarFormulario(false); setModeloEditar(null); }}
        />
      )}

      {mostrarImportar && (
        <ImportModal
          onImport={handleImportar}
          onClose={() => setMostrarImportar(false)}
        />
      )}

      {/* Confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">¿Eliminar modelo?</h3>
              <p className="text-sm text-slate-400 mb-6">Esta acción no se puede deshacer. El modelo será eliminado permanentemente.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={confirmarEliminar}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🗑️ Eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
