
import React, { useState, useCallback } from 'react';
import { getAllOrders } from '@/utils/dummyData';
import { OrderStatus } from '@/utils/types';
import MainLayout from '@/layouts/MainLayout';
import OrderItem from '@/components/OrderItem';
import { toast } from 'sonner';
import { Filter, Search, LayoutList, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Orders = () => {
  const [orders, setOrders] = useState(getAllOrders());
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
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
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return a.timestamp.getTime() - b.timestamp.getTime();
    }
  });
  
  // Handle order status update
  const handleUpdateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    // Show toast
    toast(`Order ${orderId.slice(-4)} status updated to ${newStatus}`);
  }, []);
  
  // Get counts for each status
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
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
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold mb-2 md:mb-0">All Orders</h1>
          
          <div className="flex space-x-2">
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="w-full md:w-64 py-2 px-4 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center py-2 px-4 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="mr-1">Sort: {sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Status filters */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 py-2">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
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
        
        {/* Orders grid */}
        {sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <LayoutList size={48} className="mb-3 opacity-20" />
            <p className="text-lg mb-1">No orders found</p>
            <p className="text-sm">
              {searchTerm 
                ? "Try adjusting your search query" 
                : statusFilter !== 'all' 
                  ? `No ${statusFilter} orders at the moment` 
                  : "There are no orders at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedOrders.map(order => (
              <OrderItem 
                key={order.id} 
                order={order}
                onStatusChange={handleUpdateOrderStatus}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;
