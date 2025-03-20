
import { Table, Order, OrderItem, TableStatus, OrderStatus } from './types';

// Generate a random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Create dummy order items
const createOrderItems = (count: number): OrderItem[] => {
  const menuItems = [
    { name: 'Margherita Pizza', price: 12.99 },
    { name: 'Spaghetti Carbonara', price: 14.99 },
    { name: 'Caesar Salad', price: 8.99 },
    { name: 'Grilled Salmon', price: 18.99 },
    { name: 'Cheeseburger', price: 10.99 },
    { name: 'Tiramisu', price: 6.99 },
    { name: 'Iced Tea', price: 3.99 },
    { name: 'Espresso', price: 2.99 },
  ];

  return Array.from({ length: count }, () => {
    const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    
    return {
      id: generateId(),
      name: menuItem.name,
      quantity,
      price: menuItem.price,
      notes: Math.random() > 0.7 ? 'No onions please' : undefined,
    };
  });
};

// Create dummy orders
const createOrders = (tableId: string, count: number): Order[] => {
  const statuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'served', 'completed', 'canceled'];
  
  return Array.from({ length: count }, (_, i) => {
    const items = createOrderItems(Math.floor(Math.random() * 3) + 1);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 120));
    
    // Bias towards pending and preparing for active tables
    let status: OrderStatus;
    if (i === count - 1 && count > 1) {
      status = statuses[Math.floor(Math.random() * 3)]; // More recent orders tend to be in earlier stages
    } else {
      status = statuses[Math.floor(Math.random() * statuses.length)];
    }
    
    return {
      id: generateId(),
      tableId,
      items,
      status,
      totalAmount,
      timestamp,
      customerName: Math.random() > 0.5 ? `Customer ${i + 1}` : undefined,
    };
  });
};

// Create dummy tables
export const createTables = (count: number): Table[] => {
  const tables: Table[] = [];
  
  // Create an approximate grid layout with some randomization
  const gridSize = Math.ceil(Math.sqrt(count));
  const cellSize = 100;
  const grid: boolean[][] = Array.from({ length: gridSize }, () => 
    Array.from({ length: gridSize }, () => false)
  );
  
  for (let i = 0; i < count; i++) {
    // Find an empty spot in the grid
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
    } while (grid[y][x]);
    
    grid[y][x] = true;
    
    // Randomize position within cell a bit
    const jitter = 20;
    const posX = x * cellSize + (Math.random() * jitter - jitter/2);
    const posY = y * cellSize + (Math.random() * jitter - jitter/2);
    
    // Determine status based on probability
    let status: TableStatus;
    const rand = Math.random();
    if (rand < 0.4) {
      status = 'available';
    } else if (rand < 0.7) {
      status = 'active';
    } else if (rand < 0.85) {
      status = 'attention';
    } else {
      status = 'paid';
    }
    
    // Create orders based on status
    let orders: Order[] = [];
    let callWaiter = false;
    
    if (status === 'active') {
      orders = createOrders(i.toString(), Math.floor(Math.random() * 2) + 1);
    } else if (status === 'attention') {
      orders = createOrders(i.toString(), Math.floor(Math.random() * 3) + 1);
      callWaiter = Math.random() > 0.5;
    } else if (status === 'paid') {
      orders = createOrders(i.toString(), Math.floor(Math.random() * 2) + 2);
      // All orders for paid tables should be completed
      orders = orders.map(order => ({ ...order, status: 'completed' }));
    }
    
    tables.push({
      id: i.toString(),
      number: i + 1,
      capacity: Math.floor(Math.random() * 4) + 2,
      status,
      position: {
        x: posX,
        y: posY,
      },
      orders,
      callWaiter,
    });
  }
  
  return tables;
};

// Export dummy data
export const dummyTables = createTables(15);

// Get all orders across all tables
export const getAllOrders = (): Order[] => {
  return dummyTables.flatMap(table => table.orders);
};
