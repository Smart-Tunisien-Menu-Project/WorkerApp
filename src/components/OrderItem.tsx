
import React from 'react';
import { Order, OrderStatus } from '@/utils/types';
import { Clock, Check, CheckCheck, ChevronsRight, Ban, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItemProps {
  order: Order;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  compact?: boolean;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onStatusChange, compact = false }) => {
  // Order status configuration (icon, color, next status)
  const statusConfig: Record<OrderStatus, { icon: React.ReactNode, color: string, next?: OrderStatus, label: string }> = {
    pending: { 
      icon: <Clock size={compact ? 16 : 18} />, 
      color: 'text-amber-500 bg-amber-50', 
      next: 'preparing',
      label: 'Pending'
    },
    preparing: { 
      icon: <ChefHat size={compact ? 16 : 18} />, 
      color: 'text-purple-500 bg-purple-50', 
      next: 'ready',
      label: 'Preparing'
    },
    ready: { 
      icon: <ChevronsRight size={compact ? 16 : 18} />, 
      color: 'text-blue-500 bg-blue-50', 
      next: 'served',
      label: 'Ready'
    },
    served: { 
      icon: <Check size={compact ? 16 : 18} />, 
      color: 'text-green-500 bg-green-50', 
      next: 'completed',
      label: 'Served'
    },
    completed: { 
      icon: <CheckCheck size={compact ? 16 : 18} />, 
      color: 'text-emerald-500 bg-emerald-50',
      label: 'Completed'
    },
    canceled: { 
      icon: <Ban size={compact ? 16 : 18} />, 
      color: 'text-gray-500 bg-gray-50',
      label: 'Canceled'
    }
  };

  const { icon, color, next, label } = statusConfig[order.status];
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all duration-300 animate-scale-up",
      compact ? "p-2" : "p-3"
    )}>
      <div className="flex justify-between items-center mb-2">
        {/* Order ID and time */}
        <div className="flex items-center">
          <span className={cn(
            "font-medium",
            compact ? "text-xs" : "text-sm"
          )}>
            Order #{order.id.slice(-4)}
          </span>
          <span className={cn(
            "ml-2 text-gray-500",
            compact ? "text-xs" : "text-sm"
          )}>
            {formatTime(order.timestamp)}
          </span>
        </div>
        
        {/* Status badge */}
        <div className={cn(
          "flex items-center rounded-full px-2 py-0.5",
          color,
          compact ? "text-xs" : "text-xs"
        )}>
          {icon}
          <span className="ml-1">{label}</span>
        </div>
      </div>
      
      {/* Order items */}
      <div className={cn(
        "space-y-1 mb-2",
        compact ? "text-xs" : "text-sm"
      )}>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.quantity}× {item.name}</span>
            <span className="font-medium">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      {/* Total and actions */}
      <div className="flex justify-between items-center mt-3">
        <div className={cn(
          "font-semibold",
          compact ? "text-sm" : "text-base"
        )}>
          Total: ${order.totalAmount.toFixed(2)}
        </div>
        
        {/* Action button */}
        {onStatusChange && next && (
          <button
            onClick={() => onStatusChange(order.id, next)}
            className={cn(
              "px-3 py-1 rounded-md text-white transition-colors",
              compact ? "text-xs" : "text-sm",
              order.status === 'pending' ? "bg-amber-500 hover:bg-amber-600" :
              order.status === 'preparing' ? "bg-purple-500 hover:bg-purple-600" :
              order.status === 'ready' ? "bg-blue-500 hover:bg-blue-600" :
              order.status === 'served' ? "bg-green-500 hover:bg-green-600" :
              "bg-gray-400 hover:bg-gray-500"
            )}
          >
            Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderItem;
