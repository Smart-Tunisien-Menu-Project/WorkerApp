
import React, { useState, useEffect } from 'react';
import { Table, OrderStatus } from '@/utils/types';
import { Bell, QrCode, UserCheck, Send, X, Clock, ArrowLeft } from 'lucide-react';
import OrderItem from './OrderItem';
import { cn } from '@/lib/utils';

interface TableDetailProps {
  table: Table;
  onClose: () => void;
  onUpdateTableStatus: (tableId: string, status: 'available' | 'paid', clearOrders?: boolean) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onToggleCallWaiter: (tableId: string, value: boolean) => void;
}

const TableDetail: React.FC<TableDetailProps> = ({
  table,
  onClose,
  onUpdateTableStatus,
  onUpdateOrderStatus,
  onToggleCallWaiter
}) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Animation on mount
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Get filtered orders
  const getFilteredOrders = () => {
    if (selectedFilter === 'all') return table.orders;
    if (selectedFilter === 'active') return table.orders.filter(order => 
      ['pending', 'preparing', 'ready', 'served'].includes(order.status)
    );
    return table.orders.filter(order => 
      ['completed', 'canceled'].includes(order.status)
    );
  };

  const filteredOrders = getFilteredOrders();
  
  // Get status counts
  const orderCounts = {
    active: table.orders.filter(order => 
      ['pending', 'preparing', 'ready', 'served'].includes(order.status)
    ).length,
    completed: table.orders.filter(order => 
      ['completed', 'canceled'].includes(order.status)
    ).length,
  };

  // Get table status details  
  const getTableStatusDetails = () => {
    switch (table.status) {
      case 'available':
        return { 
          label: 'Available', 
          color: 'bg-emerald-100 text-emerald-800' 
        };
      case 'active':
        return { 
          label: 'Active', 
          color: 'bg-amber-100 text-amber-800' 
        };
      case 'attention':
        return { 
          label: 'Needs Attention', 
          color: 'bg-rose-100 text-rose-800' 
        };
      case 'paid':
        return { 
          label: 'Paid', 
          color: 'bg-indigo-100 text-indigo-800' 
        };
    }
  };

  const statusDetails = getTableStatusDetails();

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-0",
      "bg-black/20 backdrop-blur-sm transition-all duration-300",
      animateIn ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden",
        "transition-all duration-300 transform max-h-[90vh] flex flex-col",
        animateIn ? "translate-y-0 md:scale-100" : "translate-y-full md:scale-95"
      )}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">Table #{table.number}</h2>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm",
            statusDetails.color
          )}>
            {statusDetails.label}
          </div>
        </div>
        
        {/* Table details */}
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <div className="flex items-center">
            <div className="flex flex-col">
              <span className="font-medium">Capacity</span>
              <span className="text-sm">{table.capacity} people</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => onToggleCallWaiter(table.id, !table.callWaiter)}
              className={cn(
                "flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors",
                table.callWaiter ? 
                  "bg-rose-100 text-rose-800 hover:bg-rose-200" : 
                  "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
            >
              <Bell size={16} />
              <span>{table.callWaiter ? "Cancel Call" : "Call Waiter"}</span>
            </button>
            
            <button className="flex items-center justify-center p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors">
              <QrCode size={16} />
            </button>
          </div>
        </div>
        
        {/* Filter tabs */}
        <div className="flex border-b px-2">
          <button 
            onClick={() => setSelectedFilter('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              selectedFilter === 'all' ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
            )}
          >
            All Orders
            {table.orders.length > 0 && (
              <span className="ml-1 text-xs text-gray-500">({table.orders.length})</span>
            )}
            {selectedFilter === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          
          <button 
            onClick={() => setSelectedFilter('active')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              selectedFilter === 'active' ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Active
            {orderCounts.active > 0 && (
              <span className="ml-1 text-xs text-gray-500">({orderCounts.active})</span>
            )}
            {selectedFilter === 'active' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          
          <button 
            onClick={() => setSelectedFilter('completed')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              selectedFilter === 'completed' ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Completed
            {orderCounts.completed > 0 && (
              <span className="ml-1 text-xs text-gray-500">({orderCounts.completed})</span>
            )}
            {selectedFilter === 'completed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
        
        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-8">
              <Clock size={40} className="mb-2 opacity-20" />
              <p className="text-sm">No {selectedFilter !== 'all' ? selectedFilter : ''} orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderItem 
                key={order.id} 
                order={order}
                onStatusChange={onUpdateOrderStatus}
              />
            ))
          )}
        </div>
        
        {/* Actions footer */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            {table.status !== 'available' && (
              <button 
                onClick={() => onUpdateTableStatus(table.id, 'paid')}
                className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                <UserCheck size={18} />
                <span>Mark as Paid</span>
              </button>
            )}
            
            {table.status !== 'available' && (
              <button 
                onClick={() => onUpdateTableStatus(table.id, 'available', true)}
                className="flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors"
              >
                <Send size={18} />
                <span>Clear Table</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetail;
