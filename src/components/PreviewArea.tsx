import React, { useRef, useEffect } from 'react';

interface PreviewAreaProps {
  processedDataUrl: string | null;
  onColorPick: (x: number, y: number, canvas: HTMLCanvasElement) => void;
  isProcessing: boolean;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ 
  processedDataUrl, 
  onColorPick,
  isProcessing
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (processedDataUrl && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = processedDataUrl;
    }
  }, [processedDataUrl]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // We pass the canvas so the hook can read the true pixel color exactly where clicked
    onColorPick(Math.floor(x), Math.floor(y), canvas);
  };

  return (
    <main className="preview-container">
      {processedDataUrl ? (
        <div style={{ position: 'relative' }}>
          <div className="canvas-wrapper" style={{ opacity: isProcessing ? 0.7 : 1, transition: 'opacity 0.2s' }}>
            <canvas 
              ref={canvasRef} 
              onPointerDown={handlePointerDown}
              style={{ touchAction: 'none' }}
              title="Click on the background to remove it"
            />
          </div>
          {isProcessing && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: 4, fontSize: '12px' }}>
              Processing...
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No Image Selected</h2>
          <p>Please upload an image using the sidebar.</p>
        </div>
      )}
    </main>
  );
};
