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
    
    // Verificar si el archivo está vacío
    if (!data || data.trim() === '') {
      logger.warn(`Archivo de pedidos vacío: ${ordersFilePath}`);
      return [];
    }
    
    const parsedData = JSON.parse(data);
    
    // Verificar que el resultado sea un array
    if (!Array.isArray(parsedData)) {
      logger.warn(`Archivo de pedidos no contiene un array válido: ${ordersFilePath}`);
      return [];
    }
    
    return parsedData;
  } catch (error) {
    logger.error(`Error al leer pedidos: ${error}`);
    // Intentar reinicializar el archivo si hay error de parsing
    try {
      initOrdersFile();
    } catch (initError) {
      logger.error(`Error al reinicializar archivo de pedidos: ${initError}`);
    }
    return [];
  }
}