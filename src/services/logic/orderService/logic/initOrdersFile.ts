import fs from 'fs-extra';
import path from 'path';
import logger from '../../../../utils/logger';

export function initOrdersFileLogic(ordersFilePath: string): void {
  try {
    const dataDir = path.dirname(ordersFilePath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`Directorio de datos creado: ${dataDir}`);
    }

    if (!fs.existsSync(ordersFilePath)) {
      fs.writeFileSync(ordersFilePath, JSON.stringify([], null, 2));
      logger.info(`Archivo de pedidos inicializado: ${ordersFilePath}`);
    }
  } catch (error) {
    logger.error(`Error al inicializar archivo de pedidos: ${error}`);
  }
}