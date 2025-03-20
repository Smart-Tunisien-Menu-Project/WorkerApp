
import React, { useState, useCallback } from 'react';
import { dummyTables } from '@/utils/dummyData';
import { Table, OrderStatus, TableStatus } from '@/utils/types';
import TableMap from '@/components/TableMap';
import TableDetail from '@/components/TableDetail';
import OrderPanel from '@/components/OrderPanel';
import MainLayout from '@/layouts/MainLayout';
import { toast } from 'sonner';

const Index = () => {
  const [tables, setTables] = useState<Table[]>(dummyTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  // Get selected table
  const selectedTable = tables.find(table => table.id === selectedTableId) || null;
  
  // Get all orders for order panel
  const allOrders = tables.flatMap(table => 
    table.orders.map(order => ({
      ...order,
      tableNumber: table.number // Add table number for reference
    }))
  );
  
  // Handle table selection
  const handleTableSelect = (tableId: string) => {
    setSelectedTableId(tableId);
  };
  
  // Handle update order status
  const handleUpdateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setTables(prevTables => 
      prevTables.map(table => ({
        ...table,
        orders: table.orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      }))
    );
    
    // Show toast
    toast(`Order ${orderId.slice(-4)} status updated to ${newStatus}`);
  }, []);
  
  // Update table status
  const handleUpdateTableStatus = useCallback((tableId: string, newStatus: TableStatus, clearOrders = false) => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            status: newStatus,
            // Clear orders if requested
            orders: clearOrders ? [] : table.orders,
            // If marking as paid, set all active orders to completed
            ...(newStatus === 'paid' && !clearOrders ? {
              orders: table.orders.map(order => 
                ['pending', 'preparing', 'ready', 'served'].includes(order.status)
                  ? { ...order, status: 'completed' }
                  : order
              )
            } : {})
          };
        }
        return table;
      })
    );
    
    // Show toast
    toast(`Table ${tables.find(t => t.id === tableId)?.number} marked as ${newStatus}`);
  }, [tables]);
  
  // Toggle call waiter
  const handleToggleCallWaiter = useCallback((tableId: string, value: boolean) => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          // If changing to true, also update table status to attention
          const newStatus = value && table.status !== 'attention' ? 'attention' : table.status;
          
          return {
            ...table,
            callWaiter: value,
            status: newStatus
          };
        }
        return table;
      })
    );
    
    const tableNumber = tables.find(t => t.id === tableId)?.number;
    
    // Show toast
    if (value) {
      toast(`Waiter called to Table ${tableNumber}`);
    } else {
      toast(`Waiter call canceled for Table ${tableNumber}`);
    }
  }, [tables]);

  // Handle table position change
  const handleTablePositionChange = useCallback((tableId: string, newPosition: { x: number; y: number }) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId 
          ? { ...table, position: newPosition } 
          : table
      )
    );
  }, []);

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row h-full overflow-hidden p-4 gap-4">
        <div className="h-[calc(100vh-6rem)] lg:h-auto lg:flex-1 relative rounded-lg overflow-hidden shadow-sm animate-fade-in">
          <TableMap 
            tables={tables} 
            onTableSelect={handleTableSelect}
            selectedTableId={selectedTableId || undefined}
            onTablePositionChange={handleTablePositionChange}
          />
        </div>
        
        <div className="h-[calc(100vh-6rem)] lg:h-auto lg:w-96 animate-fade-in">
          <OrderPanel 
            orders={allOrders} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </div>
      </div>
      
      {/* Table detail modal */}
      {selectedTable && (
        <TableDetail 
          table={selectedTable}
          onClose={() => setSelectedTableId(null)}
          onUpdateTableStatus={handleUpdateTableStatus}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onToggleCallWaiter={handleToggleCallWaiter}
        />
      )}
    </MainLayout>
  );
};

export default Index;
