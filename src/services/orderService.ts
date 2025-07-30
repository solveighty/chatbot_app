import path from 'path';
import { OrderData } from './logic/orderService/types/orderData';
import { initOrdersFileLogic } from './logic/orderService/logic/initOrdersFile';
import { saveOrderLogic } from './logic/orderService/logic/saveOrder';
import { getAllOrdersLogic } from './logic/orderService/logic/getAllOrders';
import { updateOrderStatusLogic } from './logic/orderService/logic/updateOrderStatus';
import { getOrdersByDateRangeLogic } from './logic/orderService/logic/getOrdersByDateRange';
import { getOrdersByProductLogic } from './logic/orderService/logic/getOrdersByProduct';
import { getOrdersByStatusLogic } from './logic/orderService/logic/getOrdersByStatus';
import { generateSalesSummaryLogic } from './logic/orderService/logic/generateSalesSummary';


export class OrderService {
  private ordersFilePath: string;

  constructor() {
    this.ordersFilePath = path.resolve(process.cwd(), 'dist/data', 'orders.json');
    this.initOrdersFile();
  }

  /**
   * Inicializar archivo de pedidos si no existe
   */
  private initOrdersFile(): void {
    initOrdersFileLogic(this.ordersFilePath);
  }

  /**
   * Guardar un nuevo pedido
   */
  public saveOrder(order: OrderData): boolean {
    const result = saveOrderLogic(this.ordersFilePath, order, () => this.getAllOrders());
    return result;
  }

  /**
   * Obtener todos los pedidos
   */
  public getAllOrders(): OrderData[] {
    return getAllOrdersLogic(this.ordersFilePath, () => this.initOrdersFile());
  }

  /**
   * Actualizar estado de un pedido
   */
  public updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled'): boolean {
    const result = updateOrderStatusLogic(
      this.ordersFilePath,
      orderId,
      status,
      () => this.getAllOrders()
    );
    return result;
  }

  /**
   * Buscar pedidos por fecha
   */
  public getOrdersByDateRange(startDate: string, endDate: string): OrderData[] {
    const orders = this.getAllOrders();
    return getOrdersByDateRangeLogic(orders, startDate, endDate);
  }

  /**
   * Filtrar pedidos por categoría/producto
   */
  public getOrdersByProduct(product: string): OrderData[] {
    const orders = this.getAllOrders();
    return getOrdersByProductLogic(orders, product);
  }

  /**
   * Filtrar pedidos por estado
   */
  public getOrdersByStatus(status: string): OrderData[] {
    const orders = this.getAllOrders();
    return getOrdersByStatusLogic(orders, status);
  }

  /**
   * Generar resumen de ventas para un rango de fechas
   */
  public generateSalesSummary(startDate: string, endDate: string, product?: string, status?: string) {
    const orders = this.getOrdersByDateRange(startDate, endDate);
    return generateSalesSummaryLogic(orders, startDate, endDate, product, status);
  }

  /**
   * Limpiar todas las órdenes
   */
  public clearAllOrders(): boolean {
    try {
      const fs = require('fs');
      const dir = path.dirname(this.ordersFilePath);
      
      // Asegurar que el directorio existe
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Escribir un array vacío al archivo
      fs.writeFileSync(this.ordersFilePath, JSON.stringify([], null, 2), 'utf8');
      
      return true;
    } catch (error) {
      console.error('Error al limpiar órdenes:', error);
      return false;
    }
  }
}