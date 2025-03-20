
import React, { useRef, useState } from 'react';
import { Table } from '@/utils/types';
import { Bell, Coffee, CheckSquare, QrCode, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
  onClick: (tableId: string) => void;
  selected: boolean;
  isDraggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (tableId: string) => void;
  onDrag?: (tableId: string, deltaX: number, deltaY: number) => void;
  onDragEnd?: () => void;
  mapScale?: number;
}

const TableCard: React.FC<TableCardProps> = ({ 
  table, 
  onClick, 
  selected, 
  isDraggable = false,
  isDragging = false,
  onDragStart,
  onDrag,
  onDragEnd,
  mapScale = 1
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);
  
  const statusColors = {
    available: 'bg-table-available border-emerald-200',
    active: 'bg-table-active border-amber-200',
    attention: 'bg-table-attention border-rose-200',
    paid: 'bg-table-paid border-indigo-100',
  };

  const pendingOrders = table.orders.filter(order => 
    ['pending', 'preparing', 'ready'].includes(order.status)
  ).length;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDraggable || e.button !== 0) return; // Only proceed if draggable and left mouse button
    
    if (onDragStart) {
      setHasMovedDuringDrag(false);
      onDragStart(table.id);
      setLastPosition({ x: e.clientX, y: e.clientY });
    }

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isDragging && onDrag) {
      const deltaX = e.clientX - lastPosition.x;
      const deltaY = e.clientY - lastPosition.y;
      
      // Only register as a move if there's significant movement
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        setHasMovedDuringDrag(true);
        
        // Apply drag with scale compensation
        const scaledDeltaX = deltaX / mapScale;
        const scaledDeltaY = deltaY / mapScale;
        
        onDrag(table.id, scaledDeltaX, scaledDeltaY);
        setLastPosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleGlobalMouseUp = (e: MouseEvent) => {
    // Clean up global event listeners
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedDuringDrag) {
      e.stopPropagation();
      return;
    }
    onClick(table.id);
  };

  return (
    <div
      ref={tableRef}
      className={cn(
        'table-card absolute w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center',
        'rounded-lg border shadow-sm cursor-pointer transition-all duration-300',
        statusColors[table.status],
        selected && 'ring-2 ring-primary-foreground scale-110 shadow-md',
        isDragging && 'opacity-80 z-50 cursor-grabbing',
        isDraggable && !isDragging && 'hover:ring-1 hover:ring-primary/30 hover:shadow-md cursor-grab'
      )}
      style={{
        transform: `translate(${table.position.x}px, ${table.position.y}px)`,
        touchAction: 'none' // Prevent browser handling of all panning and zooming gestures
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {isDraggable && (
        <div className="absolute top-1 right-1 opacity-50 hover:opacity-100">
          <GripVertical size={12} className={cn("text-gray-500", isDraggable && "text-primary")} />
        </div>
      )}
      
      <div className="text-sm font-medium text-gray-800 mb-1">#{table.number}</div>
      
      {/* Capacity indicator */}
      <div className="flex items-center text-xs text-gray-600 mb-1">
        <div className="flex">
          {Array.from({ length: Math.min(table.capacity, 4) }).map((_, i) => (
            <div key={i} className="w-1 h-3 bg-gray-400 rounded-full mx-0.5" />
          ))}
          {table.capacity > 4 && <span className="ml-1">+{table.capacity - 4}</span>}
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center space-x-1.5 mt-0.5">
        {pendingOrders > 0 && (
          <div className="relative">
            <Coffee size={14} className="text-amber-600" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] text-white">
              {pendingOrders}
            </span>
          </div>
        )}
        
        {table.callWaiter && (
          <Bell size={14} className="text-rose-600 animate-pulse-status" />
        )}
        
        {table.status === 'paid' && (
          <CheckSquare size={14} className="text-indigo-600" />
        )}
        
        <QrCode size={14} className="text-gray-500" />
      </div>
    </div>
  );
};

export default TableCard;
