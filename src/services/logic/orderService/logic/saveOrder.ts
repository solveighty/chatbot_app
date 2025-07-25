import fs from 'fs-extra';
import logger from '../../../../utils/logger';
import { OrderData } from '../types/orderData';

export function saveOrderLogic(ordersFilePath: string, order: OrderData, getAllOrders: () => OrderData[]): boolean {
  try {
    const orders = getAllOrders();
    orders.push(order);
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
    logger.info(`Pedido guardado correctamente: ${order.orderId}`);
    return true;
  } catch (error) {
    logger.error(`Error al guardar pedido: ${error}`);
    return false;
  }
}