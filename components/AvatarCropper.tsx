import React, { useState, useRef, useEffect } from 'react';

interface AvatarCropperProps {
  imageUrl: string;
  onSave: (croppedImageUrl: string) => void;
  onClose: () => void;
}

export const AvatarCropper: React.FC<AvatarCropperProps> = ({ imageUrl, onSave, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!imageUrl) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The crop area is a 200x200 circle in the center of the 400x400 view
    const cropSize = 200;
    canvas.width = cropSize;
    canvas.height = cropSize;

    ctx.clearRect(0, 0, cropSize, cropSize);
    
    // Create circular clip
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Calculate source coordinates
    // The center of the view is (200, 200)
    // The image is drawn at (200 + offset.x, 200 + offset.y) with size (img.width * zoom, img.height * zoom)
    // We want to capture the 200x200 area centered at (200, 200)
    
    const viewCenterX = 200;
    const viewCenterY = 200;
    
    const drawX = viewCenterX + offset.x - (img.width * zoom) / 2;
    const drawY = viewCenterY + offset.y - (img.height * zoom) / 2;
    
    // We need to map the 200x200 crop area (centered at 200,200 in the view) to the canvas
    // The crop area in view coordinates is [100, 300] x [100, 300]
    
    ctx.drawImage(
      img,
      (img.width / 2) - (cropSize / 2 / zoom) - (offset.x / zoom),
      (img.height / 2) - (cropSize / 2 / zoom) - (offset.y / zoom),
      cropSize / zoom,
      cropSize / zoom,
      0,
      0,
      cropSize,
      cropSize
    );

    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-header uppercase tracking-widest text-slate-800">Crop Avatar</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div 
          ref={containerRef}
          className="relative w-[400px] h-[400px] mx-auto bg-slate-100 rounded-3xl overflow-hidden cursor-move mb-6 select-none shadow-inner border border-slate-100"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Image Layer */}
          <img 
            ref={imageRef}
            src={imageUrl} 
            crossOrigin="anonymous"
            alt="To crop"
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              maxWidth: 'none',
              display: 'block'
            }}
          />

          {/* Overlay Mask */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full">
              <defs>
                <mask id="avatar-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <circle cx="200" cy="200" r="100" fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#avatar-mask)" />
              <circle cx="200" cy="200" r="100" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            Drag to pan • Scroll to zoom
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-slate-800 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all"
          >
            Save Avatar
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
