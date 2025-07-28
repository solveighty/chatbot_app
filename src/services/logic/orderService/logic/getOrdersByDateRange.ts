import logger from '../../../../utils/logger';
import { OrderData } from '../types/orderData';

export function getOrdersByDateRangeLogic(
  orders: OrderData[],
  startDate: string,
  endDate: string
): OrderData[] {
  try {
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