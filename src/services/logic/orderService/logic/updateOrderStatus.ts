import fs from 'fs-extra';
import logger from '../../../../utils/logger';
import { OrderData } from '../types/orderData';

export function updateOrderStatusLogic(
  ordersFilePath: string,
  orderId: string,
  status: 'pending' | 'completed' | 'cancelled',
  getAllOrders: () => OrderData[]
): boolean {
  try {
    const orders = getAllOrders();
    const orderIndex = orders.findIndex(order => order.orderId === orderId);

    if (orderIndex === -1) {
      logger.warn(`Pedido no encontrado: ${orderId}`);
      return false;
    }

    orders[orderIndex].status = status;
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
    logger.info(`Estado del pedido ${orderId} actualizado a ${status}`);
    return true;
  } catch (error) {
    logger.error(`Error al actualizar estado del pedido: ${error}`);
    return false;
  }
}