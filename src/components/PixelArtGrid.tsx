import React, { useState, useEffect, useCallback } from 'react';
import './PixelArtGrid.css';

interface PixelArtGridProps {
  gridSize: number;
  initialColor?: string;
  initialPixels?: string[][]; // For loading saved pixel art
  isReadOnly?: boolean;       // To disable editing if already completed
  onPixelsChange?: (pixels: string[][]) => void; // To notify parent of changes
}

const DEFAULT_INITIAL_COLOR = '#FFFFFF';
const DEFAULT_SELECTED_COLOR = '#000000';
const MIN_GRID_SIZE = 8;
const MAX_GRID_SIZE = 32;
const PIXEL_SCALE = 20;

export const PixelArtGrid: React.FC<PixelArtGridProps> = ({
  gridSize: rawGridSize,
  initialColor = DEFAULT_INITIAL_COLOR,
  initialPixels,
  isReadOnly = false,
  onPixelsChange,
}) => {
  const gridSize = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, rawGridSize));

  const createInitialGrid = useCallback(() => {
    return Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(initialColor));
  }, [gridSize, initialColor]);

  // Initialize pixels from initialPixels if provided, else create a new grid
  const [pixels, setPixelsInternal] = useState<string[][]>(
    () => initialPixels || createInitialGrid()
  );
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_SELECTED_COLOR);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  // Effect to update parent component when pixels change
  useEffect(() => {
    if (onPixelsChange) {
      onPixelsChange(pixels);
    }
  }, [pixels, onPixelsChange]);

  // Effect to re-initialize or load grid if gridSize, initialColor, or initialPixels prop changes
  useEffect(() => {
    if (initialPixels) {
        // Ensure the loaded pixels match the current gridSize, otherwise, it might be stale data
        if (initialPixels.length === gridSize && initialPixels.every(row => row.length === gridSize)) {
            setPixelsInternal(initialPixels);
        } else {
            console.warn('Mismatch between initialPixels dimensions and gridSize. Re-initializing grid.');
            setPixelsInternal(createInitialGrid());
        }
    } else if (!isReadOnly) { // Only create new grid if not read-only and no initialPixels
        setPixelsInternal(createInitialGrid());
    }
    // If it's read-only and initialPixels is not provided, it will just show an empty (default color) grid
    // of the correct size, which is fine as there's no saved state to load.
  }, [gridSize, initialColor, initialPixels, createInitialGrid, isReadOnly]);


  const handlePixelInteraction = (rowIndex: number, colIndex: number) => {
    if (isReadOnly) return;
    const newPixels = pixels.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((pixelColor, cIdx) =>
            cIdx === colIndex ? selectedColor : pixelColor
          )
        : row
    );
    setPixelsInternal(newPixels);
  };

  const handlePixelMouseDown = (rowIndex: number, colIndex: number) => {
    if (isReadOnly) return;
    setIsMouseDown(true);
    handlePixelInteraction(rowIndex, colIndex);
  };

  const handlePixelMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isReadOnly || !isMouseDown) return;
    handlePixelInteraction(rowIndex, colIndex);
  };

  const handleMouseUp = () => {
    if (isReadOnly) return;
    setIsMouseDown(false);
  };
  
  useEffect(() => {
    if (isReadOnly) return; // Don't add listener in read-only mode
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isReadOnly]); // Add isReadOnly to dependency array

  const resetGrid = () => {
    if (isReadOnly) return;
    const confirmed = window.confirm(
      "Are you sure you want to reset this pixel art? Any unsaved changes will be lost."
    );
    if (confirmed) {
      setPixelsInternal(createInitialGrid());
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = gridSize * PIXEL_SCALE;
    canvas.height = gridSize * PIXEL_SCALE;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Could not get canvas context for download.");
      return;
    }

    // Ensure pixels array is valid and has content
    if (!pixels || pixels.length === 0 || pixels[0].length === 0) {
        console.error("Pixel data is empty or invalid for download.");
        // Optionally, draw a blank canvas or an error message
        ctx.fillStyle = '#cccccc'; // Light grey background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Pixel Data', canvas.width / 2, canvas.height / 2);
    } else {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
            // Check if pixels[r] and pixels[r][c] exist to prevent errors with malformed data
            ctx.fillStyle = (pixels[r] && pixels[r][c]) ? pixels[r][c] : DEFAULT_INITIAL_COLOR;
            ctx.fillRect(c * PIXEL_SCALE, r * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
            }
        }
    }

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `pixel-art-${gridSize}x${gridSize}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pixel-art-container">
      <div className="pixel-art-controls">
        <label htmlFor="colorPicker">Pick a color:</label>
        <input
          type="color"
          id="colorPicker"
          value={selectedColor}
          onChange={(e) => !isReadOnly && setSelectedColor(e.target.value)}
          className="color-picker-input"
          disabled={isReadOnly}
        />
        <button onClick={resetGrid} className="pixel-grid-reset-button" disabled={isReadOnly}>
          Reset Grid
        </button>
        <button onClick={handleDownload} className="pixel-grid-download-button">
          Download PNG
        </button>
      </div>
      <div
        className={`pixel-grid ${isReadOnly ? 'read-only' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          cursor: isReadOnly ? 'not-allowed' : 'default',
        }}
        onMouseLeave={handleMouseUp} // Still useful to reset isMouseDown if dragging off
      >
        {pixels.map((row, rowIndex) =>
          row.map((pixelColor, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="pixel"
              style={{ backgroundColor: pixelColor, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
              onMouseDown={() => handlePixelMouseDown(rowIndex, colIndex)} // These will do nothing if isReadOnly
              onMouseEnter={() => handlePixelMouseEnter(rowIndex, colIndex)} // These will do nothing if isReadOnly
            />
          ))
        )}
      </div>
    </div>
  );
}; 