import fs from 'fs-extra';
import logger from '../../../../utils/logger';
import { OrderData } from '../types/orderData';

export function getAllOrdersLogic(ordersFilePath: string, initOrdersFile: () => void): OrderData[] {
  try {
    if (!fs.existsSync(ordersFilePath)) {
      initOrdersFile();
      return [];
    }

    const data = fs.readFileSync(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Error al leer pedidos: ${error}`);
    return [];
  }
}