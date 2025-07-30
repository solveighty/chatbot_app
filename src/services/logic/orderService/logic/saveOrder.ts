import fs from 'fs-extra';
import logger from '../../../../utils/logger';
import { OrderData } from '../types/orderData';

export function saveOrderLogic(ordersFilePath: string, order: OrderData, getAllOrders: () => OrderData[]): boolean {
  try {
    let orders = getAllOrders();
    
    // Verificar que orders sea un array válido
    if (!Array.isArray(orders)) {
      logger.warn('Orders no es un array válido, inicializando como array vacío');
      orders = [];
    }
    
    orders.push(order);
    
    // Verificar que el directorio existe
    const dir = require('path').dirname(ordersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Escribir el archivo con formato legible
    const jsonData = JSON.stringify(orders, null, 2);
    fs.writeFileSync(ordersFilePath, jsonData, 'utf8');
    
    logger.info(`Pedido guardado correctamente: ${order.orderId}`);
    return true;
  } catch (error) {
    logger.error(`Error al guardar pedido: ${error}`);
    return false;
  }
}