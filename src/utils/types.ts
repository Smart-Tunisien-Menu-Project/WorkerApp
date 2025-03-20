
export type TableStatus = 'available' | 'active' | 'attention' | 'paid';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  position: {
    x: number;
    y: number;
  };
  orders: Order[];
  callWaiter: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'canceled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  timestamp: Date;
  customerName?: string;
}
