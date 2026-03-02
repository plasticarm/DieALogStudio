import React, { useState, useEffect, useRef } from 'react';
import { imageStore } from '../services/imageStore';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
  fallback?: React.ReactNode;
}

/**
 * A wrapper around <img> that automatically resolves 'vault:ID' references
 * from IndexedDB. If the src is a normal URL or data URL, it behaves like a standard <img>.
 * Implements lazy loading to only resolve and render when in view.
 */
export const CachedImage: React.FC<CachedImageProps> = ({ src, fallback, ...props }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !src) return;

    let isMounted = true;

    const resolve = async () => {
      if (imageStore.isVaultReference(src)) {
        setIsLoading(true);
        try {
          const data = await imageStore.getImage(src);
          if (isMounted) {
            setResolvedSrc(data || undefined);
          }
        } catch (err) {
          console.error("Failed to resolve cached image:", err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        setResolvedSrc(src);
      }
    };

    resolve();

    return () => {
      isMounted = false;
    };
  }, [src, isInView]);

  if (!isInView) {
    return (
      <div 
        ref={containerRef} 
        className={`bg-slate-100 animate-pulse ${props.className || ''}`} 
        style={{ minHeight: '100px' }}
      />
    );
  }

  if (isLoading) {
    return fallback ? <>{fallback}</> : <div className={`bg-slate-100 animate-pulse ${props.className || ''}`} />;
  }

  if (!resolvedSrc) {
    return fallback ? <>{fallback}</> : null;
  }

  return <img src={resolvedSrc || null} {...props} />;
};
