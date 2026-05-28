'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageLoaderProps {
  src?: string;
  alt: string;
  fallback?: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

export function ImageLoader({
  src,
  alt,
  fallback = '📦',
  className = '',
  width = 400,
  height = 300,
  objectFit = 'cover',
}: ImageLoaderProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasValidSrc = src && src.trim() && !error;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center ${className}`}>
      {hasValidSrc ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          className={`w-full h-full transition-all duration-300 ${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : objectFit === 'fill' ? 'object-fill' : 'object-scale-down'} ${loading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            maxWidth: width,
            maxHeight: height,
          }}
        />
      ) : null}
      
      {!hasValidSrc && (
        <div className="text-4xl md:text-6xl text-center">{fallback}</div>
      )}

      {loading && hasValidSrc && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
