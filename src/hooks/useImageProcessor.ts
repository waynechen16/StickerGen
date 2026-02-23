import { useState, useCallback, useEffect } from 'react';

export interface ProcessorState {
  imageFile: File | null;
  imageUrl: string | null;
  tolerance: number;
  thickness: number;
  mergeGap: number;
  targetColor: { r: number; g: number; b: number } | null;
  targetPos: { x: number; y: number } | null;
  processedDataUrl: string | null;
  isProcessing: boolean;
}

export const useImageProcessor = () => {
  const [state, setState] = useState<ProcessorState>({
    imageFile: null,
    imageUrl: null,
    tolerance: 15,
    thickness: 15,
    mergeGap: 0,
    targetColor: null,
    targetPos: null,
    processedDataUrl: null,
    isProcessing: false
  });

  const uploadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setState((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: url,
      targetColor: null,
      targetPos: null,
      processedDataUrl: null
    }));
  }, []);

  const setTolerance = useCallback((tolerance: number) => {
    setState((prev) => ({ ...prev, tolerance }));
  }, []);

  const setThickness = useCallback((thickness: number) => {
    setState((prev) => ({ ...prev, thickness }));
  }, []);

  const setMergeGap = useCallback((mergeGap: number) => {
    setState((prev) => ({ ...prev, mergeGap }));
  }, []);

  const pickColor = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] === 0) return;
    
    setState((prev) => ({
      ...prev,
      targetColor: { r: pixel[0], g: pixel[1], b: pixel[2] },
      targetPos: { x, y }
    }));
  }, []);

  useEffect(() => {
    if (!state.imageUrl) return;

    const process = async () => {
      setState(p => ({ ...p, isProcessing: true }));

      try {
        const img = new Image();
        img.src = state.imageUrl!;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const pad = state.thickness;
        const gap = state.mergeGap;

        const cleanCanvas = document.createElement('canvas');
        cleanCanvas.width = img.width;
        cleanCanvas.height = img.height;
        const cleanCtx = cleanCanvas.getContext('2d', { willReadFrequently: true });
        if (!cleanCtx) return;

        cleanCtx.drawImage(img, 0, 0);

        // Perform magic wand (flood fill) to only remove contiguous background
        if (state.targetColor && state.targetPos) {
          const imgData = cleanCtx.getImageData(0, 0, cleanCanvas.width, cleanCanvas.height);
          const data = imgData.data;
          const { r: tr, g: tg, b: tb } = state.targetColor;
          
          const maxDist = 441.67;
          const toleranceThreshold = (state.tolerance / 100) * maxDist;

          const w = cleanCanvas.width;
          const h = cleanCanvas.height;
          
          const visited = new Uint8Array(w * h);
          const stackX = new Int32Array(w * h);
          const stackY = new Int32Array(w * h);
          let stackPtr = 0;

          const startX = state.targetPos.x;
          const startY = state.targetPos.y;
          const startIdx = startY * w + startX;

          if (data[startIdx * 4 + 3] !== 0) {
              visited[startIdx] = 1;
              stackX[stackPtr] = startX;
              stackY[stackPtr] = startY;
              stackPtr++;
              
              data[startIdx * 4 + 3] = 0;

              while (stackPtr > 0) {
                stackPtr--;
                const x = stackX[stackPtr];
                const y = stackY[stackPtr];
                
                if (x + 1 < w) {
                    const nIdx = y * w + (x + 1);
                    if (!visited[nIdx] && data[nIdx * 4 + 3] !== 0) {
                        visited[nIdx] = 1;
                        const r = data[nIdx * 4];
                        const g = data[nIdx * 4 + 1];
                        const b = data[nIdx * 4 + 2];
                        const dist = Math.sqrt(Math.pow(r - tr, 2) + Math.pow(g - tg, 2) + Math.pow(b - tb, 2));
                        if (dist <= toleranceThreshold) {
                            data[nIdx * 4 + 3] = 0;
                            stackX[stackPtr] = x + 1; stackY[stackPtr] = y; stackPtr++;
                        }
                    }
                }
                if (x - 1 >= 0) {
                    const nIdx = y * w + (x - 1);
                    if (!visited[nIdx] && data[nIdx * 4 + 3] !== 0) {
                        visited[nIdx] = 1;
                        const r = data[nIdx * 4];
                        const g = data[nIdx * 4 + 1];
                        const b = data[nIdx * 4 + 2];
                        const dist = Math.sqrt(Math.pow(r - tr, 2) + Math.pow(g - tg, 2) + Math.pow(b - tb, 2));
                        if (dist <= toleranceThreshold) {
                            data[nIdx * 4 + 3] = 0;
                            stackX[stackPtr] = x - 1; stackY[stackPtr] = y; stackPtr++;
                        }
                    }
                }
                if (y + 1 < h) {
                    const nIdx = (y + 1) * w + x;
                    if (!visited[nIdx] && data[nIdx * 4 + 3] !== 0) {
                        visited[nIdx] = 1;
                        const r = data[nIdx * 4];
                        const g = data[nIdx * 4 + 1];
                        const b = data[nIdx * 4 + 2];
                        const dist = Math.sqrt(Math.pow(r - tr, 2) + Math.pow(g - tg, 2) + Math.pow(b - tb, 2));
                        if (dist <= toleranceThreshold) {
                            data[nIdx * 4 + 3] = 0;
                            stackX[stackPtr] = x; stackY[stackPtr] = y + 1; stackPtr++;
                        }
                    }
                }
                if (y - 1 >= 0) {
                    const nIdx = (y - 1) * w + x;
                    if (!visited[nIdx] && data[nIdx * 4 + 3] !== 0) {
                        visited[nIdx] = 1;
                        const r = data[nIdx * 4];
                        const g = data[nIdx * 4 + 1];
                        const b = data[nIdx * 4 + 2];
                        const dist = Math.sqrt(Math.pow(r - tr, 2) + Math.pow(g - tg, 2) + Math.pow(b - tb, 2));
                        if (dist <= toleranceThreshold) {
                            data[nIdx * 4 + 3] = 0;
                            stackX[stackPtr] = x; stackY[stackPtr] = y - 1; stackPtr++;
                        }
                    }
                }
              }
          }
          cleanCtx.putImageData(imgData, 0, 0);
        }
        
        let targetCanvasToDilate = cleanCanvas;
        let baseOffset = 0;

        if (gap > 0) {
            const padding = gap + 2;
            const cw = img.width + padding * 2;
            const ch = img.height + padding * 2;
            
            const closingCanvas = document.createElement('canvas');
            closingCanvas.width = cw;
            closingCanvas.height = ch;
            const cCtx = closingCanvas.getContext('2d', { willReadFrequently: true });
            if (cCtx) {
                // Dilate cleanCanvas by 'gap'
                const steps = Math.max(36, Math.ceil(gap * 2 * Math.PI)); 
                for (let i = 0; i < steps; i++) {
                    const angle = (i * Math.PI * 2) / steps;
                    const dx = Math.cos(angle) * gap;
                    const dy = Math.sin(angle) * gap;
                    cCtx.drawImage(cleanCanvas, padding + dx, padding + dy);
                }

                // Make the dilated silhouette solid white
                cCtx.globalCompositeOperation = 'source-in';
                cCtx.fillStyle = '#FFFFFF';
                cCtx.fillRect(0, 0, cw, ch);
                cCtx.globalCompositeOperation = 'source-over';
                
                // --- Safe Erosion (Morphological Closing) ---
                const idata = cCtx.getImageData(0, 0, cw, ch);
                const d = idata.data;
                const isExterior = new Uint8Array(cw * ch);
                const exStackX = new Int32Array(cw * ch);
                const exStackY = new Int32Array(cw * ch);
                let exPtr = 0;

                // Flood fill from top-left (0,0) down to all connected transparent pixels
                isExterior[0] = 1;
                exStackX[0] = 0;
                exStackY[0] = 0;
                exPtr++;

                while (exPtr > 0) {
                    exPtr--;
                    const x = exStackX[exPtr];
                    const y = exStackY[exPtr];
                    
                    if (x + 1 < cw) {
                        const nIdx = y * cw + (x + 1);
                        if (!isExterior[nIdx] && d[nIdx * 4 + 3] === 0) {
                            isExterior[nIdx] = 1;
                            exStackX[exPtr] = x + 1; exStackY[exPtr] = y; exPtr++;
                        }
                    }
                    if (x - 1 >= 0) {
                        const nIdx = y * cw + (x - 1);
                        if (!isExterior[nIdx] && d[nIdx * 4 + 3] === 0) {
                            isExterior[nIdx] = 1;
                            exStackX[exPtr] = x - 1; exStackY[exPtr] = y; exPtr++;
                        }
                    }
                    if (y + 1 < ch) {
                        const nIdx = (y + 1) * cw + x;
                        if (!isExterior[nIdx] && d[nIdx * 4 + 3] === 0) {
                            isExterior[nIdx] = 1;
                            exStackX[exPtr] = x; exStackY[exPtr] = y + 1; exPtr++;
                        }
                    }
                    if (y - 1 >= 0) {
                        const nIdx = (y - 1) * cw + x;
                        if (!isExterior[nIdx] && d[nIdx * 4 + 3] === 0) {
                            isExterior[nIdx] = 1;
                            exStackX[exPtr] = x; exStackY[exPtr] = y - 1; exPtr++;
                        }
                    }
                }
                
                // Find boundary points of the exterior (exterior pixels that touch white shape)
                const edgePoints = [];
                for (let y = 0; y < ch; y++) {
                    for (let x = 0; x < cw; x++) {
                        const idx = y * cw + x;
                        if (isExterior[idx]) { 
                            if ((y > 0 && d[(idx - cw)*4 + 3] > 0) ||
                                (y < ch-1 && d[(idx + cw)*4 + 3] > 0) ||
                                (x > 0 && d[(idx - 1)*4 + 3] > 0) ||
                                (x < cw-1 && d[(idx + 1)*4 + 3] > 0)) {
                                edgePoints.push({x, y});
                            }
                        }
                    }
                }
                
                // Carve gap-radius circles into the white shape from exactly the exterior boundaries.
                // Because closing(A, r) >= A mathematically, this preserves the original shape perfectly.
                if (edgePoints.length > 0) {
                    cCtx.globalCompositeOperation = 'destination-out';
                    cCtx.beginPath();
                    for (const pt of edgePoints) {
                        cCtx.moveTo(pt.x + gap, pt.y);
                        cCtx.arc(pt.x, pt.y, gap, 0, Math.PI * 2);
                    }
                    cCtx.fill();
                    cCtx.globalCompositeOperation = 'source-over';
                }
                
                targetCanvasToDilate = closingCanvas;
                baseOffset = padding;
            }
        }

        // Final Canvas: Apply Outline Thickness (Dilation)
        const finalWidth = img.width + pad * 2;
        const finalHeight = img.height + pad * 2;
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) return;

        if (pad > 0 || gap > 0) {
          const steps = Math.max(36, Math.ceil(pad * 2 * Math.PI)); 
          for (let i = 0; i < steps; i++) {
            const angle = (i * Math.PI * 2) / steps;
            const dx = Math.cos(angle) * pad;
            const dy = Math.sin(angle) * pad;
            // Draw the bridged backing (targetCanvasToDilate) stamped in a circle of radius thickness
            finalCtx.drawImage(targetCanvasToDilate, pad + dx - baseOffset, pad + dy - baseOffset);
          }

          finalCtx.globalCompositeOperation = 'source-in';
          finalCtx.fillStyle = '#FFFFFF';
          finalCtx.fillRect(0, 0, finalWidth, finalHeight);
          finalCtx.globalCompositeOperation = 'source-over';
        }

        finalCtx.drawImage(cleanCanvas, pad, pad);

        setState(p => ({ ...p, processedDataUrl: finalCanvas.toDataURL('image/png'), isProcessing: false }));

      } catch (err) {
        console.error('Image processing failed:', err);
        setState(p => ({ ...p, isProcessing: false }));
      }
    };

    process();
  }, [state.imageUrl, state.targetColor, state.targetPos, state.tolerance, state.thickness, state.mergeGap]);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tolerance: 15,
      thickness: 15,
      targetColor: null,
      targetPos: null,
      processedDataUrl: null
    }));
  }, []);

  const downloadImage = useCallback(() => {
    if (state.processedDataUrl) {
      const link = document.createElement('a');
      link.download = `sticker_${Date.now()}.png`;
      link.href = state.processedDataUrl;
      link.click();
    }
  }, [state.processedDataUrl]);

  return {
    state,
    uploadImage,
    setTolerance,
    setThickness,
    setMergeGap,
    pickColor,
    reset,
    downloadImage,
  };
};
