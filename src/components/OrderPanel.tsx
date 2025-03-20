
import React, { useState } from 'react';
import { Order, OrderStatus } from '@/utils/types';
import OrderItem from './OrderItem';
import { LayoutList, Filter, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderPanel: React.FC<OrderPanelProps> = ({ orders, onUpdateOrderStatus }) => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Filter orders by status and search term
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(searchTermLower);
      const matchesTable = order.tableId.toLowerCase().includes(searchTermLower);
      const matchesItems = order.items.some(item => 
        item.name.toLowerCase().includes(searchTermLower)
      );
      
      return matchesId || matchesTable || matchesItems;
    }
    
    return true;
  });

  // Sort orders by timestamp (most recent first) and status priority
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Status priority: pending > preparing > ready > served > completed > canceled
    const statusPriority: Record<OrderStatus, number> = {
      pending: 0,
      preparing: 1,
      ready: 2,
      served: 3,
      completed: 4,
      canceled: 5
    };
    
    // First sort by status priority
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by timestamp (most recent first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  // Get counts for each status
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalCount = orders.length;

  // Status filter options
  const statusOptions: { label: string, value: OrderStatus | 'all', color: string }[] = [
    { label: 'All', value: 'all', color: 'bg-gray-100 text-gray-800' },
    { label: 'Pending', value: 'pending', color: 'bg-amber-100 text-amber-800' },
    { label: 'Preparing', value: 'preparing', color: 'bg-purple-100 text-purple-800' },
    { label: 'Ready', value: 'ready', color: 'bg-blue-100 text-blue-800' },
    { label: 'Served', value: 'served', color: 'bg-green-100 text-green-800' },
    { label: 'Completed', value: 'completed', color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Canceled', value: 'canceled', color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <div className="h-full flex flex-col rounded-lg border border-gray-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <LayoutList size={20} className="mr-2 text-gray-600" />
          <h2 className="text-lg font-semibold">Orders</h2>
          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-sm text-gray-700">
            {totalCount}
          </span>
        </div>
        
        <div className="flex space-x-2">
          {!isSearchActive ? (
            <button 
              onClick={() => setIsSearchActive(true)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          ) : (
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="w-40 py-1 px-3 pr-8 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchActive(false);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>
      
      {/* Status filters */}
      <div className="p-2 border-b overflow-auto">
        <div className="flex space-x-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors",
                statusFilter === option.value
                  ? option.color.replace('100', '200')
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              {option.label}
              {option.value !== 'all' && statusCounts[option.value] && (
                <span className="ml-1">({statusCounts[option.value] || 0})</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Orders list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <LayoutList size={40} className="mb-2 opacity-20" />
            <p className="text-sm">
              {searchTerm 
                ? "No orders matching your search" 
                : statusFilter !== 'all' 
                  ? `No ${statusFilter} orders` 
                  : "No orders found"}
            </p>
          </div>
        ) : (
          sortedOrders.map(order => (
            <OrderItem 
              key={order.id} 
              order={order}
              onStatusChange={onUpdateOrderStatus}
              compact
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrderPanel;
