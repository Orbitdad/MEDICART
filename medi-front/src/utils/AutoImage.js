import { removeBackground } from '@imgly/background-removal';

export const processAutoImage = async (file, onProgress) => {
  try {
    // 1. Remove background using imgly
    const blob = await removeBackground(file, {
      output: { format: 'image/png' },
      progress: (key, current, total) => {
        if (onProgress) {
          onProgress(`Downloading ${key} models...`, Math.round((current / total) * 100));
        }
      }
    });

    if (onProgress) onProgress('Processing image...', 100);

    // 2. Load into an Image object
    const imgUrl = URL.createObjectURL(blob);
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imgUrl;
    });

    // 3. Find tight crop bounds
    const offCanvas = document.createElement('canvas');
    offCanvas.width = img.width;
    offCanvas.height = img.height;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(img, 0, 0);
    
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imgData.data;
    
    let minX = offCanvas.width;
    let minY = offCanvas.height;
    let maxX = 0;
    let maxY = 0;
    
    for (let y = 0; y < offCanvas.height; y++) {
      for (let x = 0; x < offCanvas.width; x++) {
        const alpha = data[(y * offCanvas.width + x) * 4 + 3];
        if (alpha > 10) { // Not transparent
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    const cropWidth = Math.max(1, maxX - minX);
    const cropHeight = Math.max(1, maxY - minY);

    // 4. Create final 800x800 canvas with white background
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 800;
    finalCanvas.height = 800;
    const ctx = finalCanvas.getContext('2d');
    
    // Fill white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 800);
    
    // Calculate scaling to fit within 700x700 (leaving 50px padding on 800x800)
    const padding = 50;
    const maxTargetSize = 800 - (padding * 2);
    const scale = Math.min(maxTargetSize / cropWidth, maxTargetSize / cropHeight);
    
    const drawWidth = cropWidth * scale;
    const drawHeight = cropHeight * scale;
    
    // Center it
    const drawX = (800 - drawWidth) / 2;
    const drawY = (800 - drawHeight) / 2;
    
    // Draw cropped image onto final canvas (with upscale if needed)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      offCanvas, 
      minX, minY, cropWidth, cropHeight, // Source bounds
      drawX, drawY, drawWidth, drawHeight // Destination bounds
    );
    
    URL.revokeObjectURL(imgUrl);
    
    // Return as File
    return new Promise((resolve) => {
      finalCanvas.toBlob((finalBlob) => {
        const newFile = new File([finalBlob], file.name.replace(/\.[^/.]+$/, "") + "_auto.jpg", {
          type: 'image/jpeg',
        });
        resolve({ file: newFile, previewUrl: URL.createObjectURL(finalBlob) });
      }, 'image/jpeg', 0.95);
    });
  } catch (error) {
    console.error("AutoImage processing failed:", error);
    throw error;
  }
};
