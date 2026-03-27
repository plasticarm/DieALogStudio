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
  const [error, setError] = useState<string | null>(null);

  // Optimization: If it's already a data or blob URL, we can use it directly
  const isDirectUrl = typeof src === 'string' && (src.startsWith('data:') || src.startsWith('blob:'));

  useEffect(() => {
    if (!src || isDirectUrl) {
      setResolvedSrc(src || undefined);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const resolve = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`[CachedImage] Resolving src: ${src.substring(0, 50)}...`);
      try {
        // Use getImage instead of getSafeUrl for display to avoid unnecessary blob fetching
        // for cloud URLs. getImage will still resolve vault: references to data URLs.
        const data = await imageStore.getImage(src);
        if (isMounted) {
          if (!data) {
            console.warn(`[CachedImage] Failed to resolve: ${src}`);
            if (src.startsWith('vault:')) {
              setError(`Vault reference missing: ${src.substring(0, 20)}`);
            } else {
              setError(`Failed to load image: ${src.substring(0, 20)}`);
            }
          } else {
            console.log(`[CachedImage] Resolved successfully: ${src.substring(0, 30)}... (Type: ${data.startsWith('data:') ? 'Data URL' : data.startsWith('blob:') ? 'Blob URL' : 'Direct URL'})`);
            setResolvedSrc(data);
          }
        }
      } catch (err: any) {
        console.error("[CachedImage] Error resolving image:", err);
        if (isMounted) setError(err.message || "Failed to resolve image");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    resolve();

    return () => {
      isMounted = false;
    };
  }, [src, isDirectUrl]);

  const displaySrc = isDirectUrl ? src : resolvedSrc;

  if (isLoading && !isDirectUrl) {
    return (
      <div className={`bg-slate-100 animate-pulse flex items-center justify-center ${props.className || ''}`} style={{ minHeight: '100px', ...props.style }}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Resolving</span>
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className={`bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 ${props.className || ''}`} style={{ minHeight: '100px', ...props.style }}>
        <svg className="w-8 h-8 mb-2 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-center px-2">
          No Source
        </span>
      </div>
    );
  }

  if (error || !displaySrc) {
    console.warn(`[CachedImage] Rendering error state for: ${src}`, { error, displaySrc });
    return (
      <div className={`bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 ${props.className || ''}`} style={{ minHeight: '100px', ...props.style }}>
        <svg className="w-8 h-8 mb-2 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-center px-2">
          {error || "Image Unavailable"}
        </span>
      </div>
    );
  }

  return <img src={displaySrc} {...props} />;
};
