// Modal de galería con carrusel para ver imágenes en grande
import React, { useState, useEffect, useCallback } from 'react';

interface GalleryModalProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ') {
        e.preventDefault();
        setIsZoomed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  // Prevenir scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Header con contador */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white">
            <span className="text-lg font-semibold">{currentIndex + 1}</span>
            <span className="text-slate-400 mx-2">/</span>
            <span className="text-slate-400">{images.length}</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Imagen principal */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón anterior */}
        {images.length > 1 && (
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 hover:bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl transition-all z-10 hover:scale-110"
            aria-label="Anterior"
          >
            ‹
          </button>
        )}

        {/* Contenedor de imagen */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>

        {/* Botón siguiente */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 hover:bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl transition-all z-10 hover:scale-110"
            aria-label="Siguiente"
          >
            ›
          </button>
        )}
      </div>

      {/* Thumbnails en la parte inferior */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex gap-2 justify-center overflow-x-auto max-w-4xl mx-auto pb-2">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex 
                    ? 'border-cyan-400 scale-110 shadow-lg shadow-cyan-500/30' 
                    : 'border-slate-600 hover:border-slate-400 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={url}
                  alt={`Miniatura ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controles de ayuda */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-slate-500 flex gap-4">
        <span>← → Navegar</span>
        <span>Espacio Zoom</span>
        <span>Esc Cerrar</span>
      </div>
    </div>
  );
};
