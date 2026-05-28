'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Zap, X } from 'lucide-react';

const BANNER_STORAGE_KEY = 'publications_banner_dismissed';

export function PublicationsBanner() {
  const [publications, setPublications] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    // Check if banner was dismissed
    const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (isClient && !isDismissed) {
      cargarPublicaciones();
    } else {
      setLoading(false);
    }
  }, [isClient, isDismissed]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!loading && publications.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev === publications.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, publications.length]);

  async function cargarPublicaciones() {
    try {
      const response = await fetch('/api/advertisements?_t=' + Date.now(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[v0] Publications loaded:', data);
        const pubs = Array.isArray(data) ? data : data.data || [];
        // Normalize field names (handle both snake_case and camelCase)
        const normalized = pubs.map((pub: any) => ({
          id: pub.id,
          title: pub.title,
          description: pub.description,
          // Support both imageUrl and image_url
          image_url: pub.image_url || pub.imageUrl || '',
          imageUrl: pub.imageUrl || pub.image_url || '',
          // Support both linkUrl and link_url
          link_url: pub.link_url || pub.linkUrl || '',
          linkUrl: pub.linkUrl || pub.link_url || '',
          link: pub.link_url || pub.linkUrl || '',
          is_active: pub.is_active !== undefined ? pub.is_active : true,
        }));
        console.log('[v0] Normalized publications:', normalized);
        setPublications(normalized);
        setCurrentIndex(0);
      } else {
        console.warn('[v0] Error loading publications, status:', response.status);
        setPublications([]);
      }
    } catch (error) {
      console.error('[v0] Error cargando publicaciones:', error);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(BANNER_STORAGE_KEY, 'true');
    setIsDismissed(true);
    console.log('[v0] Publications banner dismissed by user');
  }

  // Don't render if dismissed
  if (isDismissed) return null;

  // Don't render if loading or no publications
  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-2xl overflow-hidden h-[350px] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        </div>
      </div>
    );
  }

  if (publications.length === 0) return null;

  const currentPub = publications[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? publications.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === publications.length - 1 ? 0 : prev + 1));
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleRefresh = () => {
    console.log('[v0] Refreshing publications...');
    cargarPublicaciones();
  };

  return (
    <div className="w-full py-8" style={{ background: '#fff !important' }}>
      <div className="max-w-7xl mx-auto px-4 relative">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-2xl group" 
          style={{ 
            minHeight: '350px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%) !important',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition hover:scale-110"
            aria-label="Cerrar banner"
            title="No volver a mostrar este banner"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>

          {/* Banner Container */}
          <div className="relative">
            {/* Background con overlay */}
            {currentPub.image_url && (
              <img
                src={currentPub.image_url}
                alt={currentPub.title}
                className="w-full h-[350px] object-cover group-hover:scale-105 transition duration-500"
              />
            )}
            
            {!currentPub.image_url && (
              <div className="w-full h-[350px] bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="inline-block mb-4 p-3 bg-white/20 rounded-full">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    {currentPub.title}
                  </h2>
                  {currentPub.description && (
                    <p className="text-lg text-white/90 max-w-2xl mx-auto">{currentPub.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Overlay gradient oscuro */}
            {currentPub.image_url && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            )}

            {/* Content overlay */}
            {currentPub.image_url && (
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h2 className="text-4xl font-bold mb-2">{currentPub.title}</h2>
                {currentPub.description && (
                  <p className="text-lg text-white/90 max-w-2xl">{currentPub.description}</p>
                )}
                {currentPub.link && (
                  <Link 
                    href={currentPub.link}
                    className="inline-block mt-4 px-6 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition"
                  >
                    Ver más →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {publications.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition hover:scale-110"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition hover:scale-110"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Indicators */}
          {publications.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {publications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleIndicatorClick(index)}
                  className={`h-3 rounded-full transition transform hover:scale-125 ${
                    index === currentIndex
                      ? 'bg-white w-8 shadow-lg'
                      : 'bg-white/60 w-3 hover:bg-white/80'
                  }`}
                  aria-label={`Ir a publicación ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
