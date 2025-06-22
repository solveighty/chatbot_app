import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger';
import { CartItem } from './cartService';

export interface OrderData {
  orderId: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  paymentMethod?: string;
  notes?: string;
}

export class OrderService {
  private ordersFilePath: string;

  constructor() {
    this.ordersFilePath = path.resolve(process.cwd(), 'data', 'orders.json');
    this.initOrdersFile();
  }

  /**
   * Inicializar archivo de pedidos si no existe
   */
  private initOrdersFile(): void {
    try {
      const dataDir = path.dirname(this.ordersFilePath);
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logger.info(`Directorio de datos creado: ${dataDir}`);
      }
      
      if (!fs.existsSync(this.ordersFilePath)) {
        fs.writeFileSync(this.ordersFilePath, JSON.stringify([], null, 2));
        logger.info(`Archivo de pedidos inicializado: ${this.ordersFilePath}`);
      }
    } catch (error) {
      logger.error(`Error al inicializar archivo de pedidos: ${error}`);
    }
  }

  /**
   * Guardar un nuevo pedido
   */
  public saveOrder(order: OrderData): boolean {
    try {
      const orders = this.getAllOrders();
      orders.push(order);
      fs.writeFileSync(this.ordersFilePath, JSON.stringify(orders, null, 2));
      logger.info(`Pedido guardado correctamente: ${order.orderId}`);
      return true;
    } catch (error) {
      logger.error(`Error al guardar pedido: ${error}`);
      return false;
    }
  }

  /**
   * Obtener todos los pedidos
   */
  public getAllOrders(): OrderData[] {
    try {
      if (!fs.existsSync(this.ordersFilePath)) {
        this.initOrdersFile();
        return [];
      }
      
      const data = fs.readFileSync(this.ordersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error al leer pedidos: ${error}`);
      return [];
    }
  }

  /**
   * Actualizar estado de un pedido
   */
  public updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled'): boolean {
    try {
      const orders = this.getAllOrders();
      const orderIndex = orders.findIndex(order => order.orderId === orderId);
      
      if (orderIndex === -1) {
        logger.warn(`Pedido no encontrado: ${orderId}`);
        return false;
      }
      
      orders[orderIndex].status = status;
      fs.writeFileSync(this.ordersFilePath, JSON.stringify(orders, null, 2));
      logger.info(`Estado del pedido ${orderId} actualizado a ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error al actualizar estado del pedido: ${error}`);
      return false;
    }
  }

  /**
   * Buscar pedidos por fecha
   */
  public getOrdersByDateRange(startDate: string, endDate: string): OrderData[] {
    try {
      const orders = this.getAllOrders();
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Incluir todo el día de fin
      
      return orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= start && orderDate <= end;
      });
    } catch (error) {
      logger.error(`Error al filtrar pedidos por fecha: ${error}`);
      return [];
    }
  }

  /**
   * Filtrar pedidos por categoría/producto
   */
  public getOrdersByProduct(product: string): OrderData[] {
    const orders = this.getAllOrders();
    
    if (!product) return orders;
    
    const productLower = product.toLowerCase();
    
    return orders.filter(order => 
      order.items.some(item => 
        item.nombre.toLowerCase().includes(productLower) || 
        item.categoria.toLowerCase().includes(productLower)
      )
    );
  }

  /**
   * Filtrar pedidos por estado
   */
  public getOrdersByStatus(status: string): OrderData[] {
    const orders = this.getAllOrders();
    
    if (!status) return orders;
    
    return orders.filter(order => order.status === status);
  }

  /**
   * Generar resumen de ventas para un rango de fechas
   */
  public generateSalesSummary(startDate: string, endDate: string, product?: string, status?: string) {
    try {
      let orders = this.getOrdersByDateRange(startDate, endDate);
      
      // Aplicar filtros adicionales si se proporcionan
      if (product) {
        orders = orders.filter(order => 
          order.items.some(item => 
            item.nombre.toLowerCase().includes(product.toLowerCase()) || 
            item.categoria.toLowerCase().includes(product.toLowerCase())
          )
        );
      }
      
      if (status) {
        orders = orders.filter(order => order.status === status);
      }

      // Calcular estadísticas de ventas
      let totalAmount = 0;
      const productSales: Record<string, { quantity: number, total: number, category: string }> = {};

      // Procesar cada pedido
      orders.forEach(order => {
        if (order.status !== 'cancelled') {
          totalAmount += order.total;
          
          // Procesar items del pedido
          order.items.forEach(item => {
            const itemKey = `${item.nombre} (${item.categoria})`;
            
            if (!productSales[itemKey]) {
              productSales[itemKey] = { 
                quantity: 0, 
                total: 0,
                category: item.categoria
              };
            }
            
            productSales[itemKey].quantity += item.cantidad;
            productSales[itemKey].total += item.precio * item.cantidad;
          });
        }
      });

      // Convertir a un array para ordenar
      const sortedProducts = Object.keys(productSales).map(key => ({
        name: key,
        category: productSales[key].category,
        quantity: productSales[key].quantity,
        total: productSales[key].total
      })).sort((a, b) => b.total - a.total);

      // Producto más vendido (por cantidad)
      const topProduct = sortedProducts.length > 0 ? 
        sortedProducts.reduce((prev, current) => 
          (current.quantity > prev.quantity) ? current : prev
        ) : null;

      return {
        summary: {
          startDate,
          endDate,
          totalAmount,
          totalOrders: orders.filter(order => order.status !== 'cancelled').length,
          cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
          topProductName: topProduct ? topProduct.name : 'Ninguno',
          topProductQuantity: topProduct ? topProduct.quantity : 0
        },
        products: sortedProducts,
        orders: orders
      };
    } catch (error) {
      logger.error(`Error al generar resumen de ventas: ${error}`);
      return {
        summary: {
          startDate,
          endDate,
          totalAmount: 0,
          totalOrders: 0,
          cancelledOrders: 0,
          topProductName: 'Error',
          topProductQuantity: 0
        },
        products: [],
        orders: []
      };
    }
  }
}