
import React, { useState, useRef, useEffect } from 'react';
import { Table } from '@/utils/types';
import TableCard from './TableCard';
import { ZoomIn, ZoomOut, GripHorizontal, Move, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

interface TableMapProps {
  tables: Table[];
  onTableSelect: (tableId: string) => void;
  selectedTableId?: string;
  onTablePositionChange?: (tableId: string, newPosition: { x: number; y: number }) => void;
}

const TableMap: React.FC<TableMapProps> = ({ 
  tables, 
  onTableSelect, 
  selectedTableId,
  onTablePositionChange 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [dragModeEnabled, setDragModeEnabled] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculate map dimensions
  const getMapDimensions = () => {
    if (!tables.length) return { width: 500, height: 500 };
    
    const maxX = Math.max(...tables.map(t => t.position.x)) + 150;
    const maxY = Math.max(...tables.map(t => t.position.y)) + 150;
    
    return {
      width: Math.max(500, maxX),
      height: Math.max(500, maxY),
    };
  };

  const dimensions = getMapDimensions();

  // Handle zoom in/out
  const handleZoom = (zoomIn: boolean) => {
    setScale(prevScale => {
      const newScale = zoomIn ? 
        Math.min(prevScale + 0.1, 1.5) : 
        Math.max(prevScale - 0.1, 0.5);
      return newScale;
    });
  };

  // Handle mouse down for dragging map
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || draggedTableId) return; // Only left mouse button and not dragging table
    setIsMapDragging(true);
    setStartDragPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle mouse move for dragging map
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMapDragging || draggedTableId) return;
    setPosition({
      x: e.clientX - startDragPosition.x,
      y: e.clientY - startDragPosition.y,
    });
  };

  // Handle touch start for dragging on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (draggedTableId) return;
    const touch = e.touches[0];
    setIsMapDragging(true);
    setStartDragPosition({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  // Handle touch move for dragging on mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMapDragging || draggedTableId) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - startDragPosition.x,
      y: touch.clientY - startDragPosition.y,
    });
  };

  // Handle mouse up and touch end to stop dragging
  const handleMapDragEnd = () => {
    setIsMapDragging(false);
  };

  // Handle table drag start
  const handleTableDragStart = (tableId: string) => {
    if (!dragModeEnabled) return;
    setDraggedTableId(tableId);
  };

  // Handle table drag
  const handleTableDrag = (tableId: string, deltaX: number, deltaY: number) => {
    if (onTablePositionChange && dragModeEnabled) {
      // Find the table
      const table = tables.find(t => t.id === tableId);
      if (table) {
        const newPosition = {
          x: table.position.x + deltaX,
          y: table.position.y + deltaY
        };
        onTablePositionChange(tableId, newPosition);
      }
    }
  };

  // Handle table drag end
  const handleTableDragEnd = () => {
    setDraggedTableId(null);
  };

  // Toggle drag mode
  const toggleDragMode = () => {
    setDragModeEnabled(prev => !prev);
  };

  // Add event listeners for map dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMapDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="w-full h-full overflow-hidden relative rounded-lg bg-gray-50 border border-gray-100">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 glass-panel rounded-lg p-1">
        <button 
          onClick={() => handleZoom(true)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={() => handleZoom(false)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        
        {/* Toggle drag mode button */}
        <Toggle 
          pressed={dragModeEnabled}
          onPressedChange={toggleDragMode}
          aria-label="Toggle table drag mode"
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          {dragModeEnabled ? 
            <Move size={18} className="text-primary" /> : 
            <Hand size={18} />
          }
        </Toggle>
      </div>
      
      {/* Drag indicator */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center glass-panel rounded-lg p-2 text-xs text-gray-500">
        <GripHorizontal size={14} className="mr-1" />
        <span>Drag to pan</span>
      </div>
      
      {/* Drag mode indicator */}
      {dragModeEnabled && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center glass-panel rounded-lg p-2 text-xs text-primary animate-pulse-status">
          <Move size={14} className="mr-1" />
          <span>Table drag mode enabled</span>
        </div>
      )}
      
      {/* Map container */}
      <div 
        ref={mapRef}
        className={cn(
          "w-full h-full relative", 
          isMapDragging && !draggedTableId ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMapDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMapDragEnd}
      >
        {/* Map content - will be transformed for panning and zooming */}
        <div 
          className="absolute transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: dimensions.width,
            height: dimensions.height,
          }}
        >
          {/* Grid lines for visual reference */}
          <div className="absolute inset-0">
            {Array.from({ length: Math.ceil(dimensions.width / 50) }).map((_, i) => (
              <div 
                key={`vline-${i}`} 
                className="absolute top-0 bottom-0 w-px bg-gray-100" 
                style={{ left: `${i * 50}px` }} 
              />
            ))}
            {Array.from({ length: Math.ceil(dimensions.height / 50) }).map((_, i) => (
              <div 
                key={`hline-${i}`} 
                className="absolute left-0 right-0 h-px bg-gray-100" 
                style={{ top: `${i * 50}px` }} 
              />
            ))}
          </div>
          
          {/* Tables */}
          {tables.map(table => (
            <TableCard 
              key={table.id} 
              table={table} 
              onClick={onTableSelect} 
              selected={table.id === selectedTableId}
              onDragStart={handleTableDragStart}
              onDrag={handleTableDrag}
              onDragEnd={handleTableDragEnd}
              isDraggable={dragModeEnabled}
              isDragging={table.id === draggedTableId}
              mapScale={scale}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableMap;
