import fs from 'fs';
import path from 'path';
import logger from './logger';

/**
 * Sincroniza el archivo orders.json entre data/ y dist/data/
 * Mantiene ambos archivos siempre actualizados
 */
export function syncOrdersFile(): void {
  try {
    const sourcePath = path.resolve(process.cwd(), 'data', 'orders.json');
    const targetPath = path.resolve(process.cwd(), 'dist/data', 'orders.json');
    
    // Crear directorios si no existen
    const sourceDir = path.dirname(sourcePath);
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
    }
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Determinar cuál archivo es más reciente
    let sourceExists = fs.existsSync(sourcePath);
    let targetExists = fs.existsSync(targetPath);
    
    if (sourceExists && targetExists) {
      // Ambos existen, comparar fechas de modificación
      const sourceStats = fs.statSync(sourcePath);
      const targetStats = fs.statSync(targetPath);
      
      if (sourceStats.mtime > targetStats.mtime) {
        // El archivo fuente es más reciente
        fs.copyFileSync(sourcePath, targetPath);
        logger.debug(`Orders synced from source: ${sourcePath} -> ${targetPath}`);
      } else {
        // El archivo destino es más reciente
        fs.copyFileSync(targetPath, sourcePath);
        logger.debug(`Orders synced from target: ${targetPath} -> ${sourcePath}`);
      }
    } else if (sourceExists) {
      // Solo existe el archivo fuente
      fs.copyFileSync(sourcePath, targetPath);
      logger.debug(`Orders synced from source: ${sourcePath} -> ${targetPath}`);
    } else if (targetExists) {
      // Solo existe el archivo destino
      fs.copyFileSync(targetPath, sourcePath);
      logger.debug(`Orders synced from target: ${targetPath} -> ${sourcePath}`);
    } else {
      // Ninguno existe, crear archivo vacío en ambos lugares
      const emptyOrders = '[]';
      fs.writeFileSync(sourcePath, emptyOrders);
      fs.writeFileSync(targetPath, emptyOrders);
      logger.debug(`Created empty orders files in both locations`);
    }
  } catch (error) {
    logger.error(`Error syncing orders file: ${error}`);
  }
}

/**
 * Sincroniza después de una modificación en dist/data/orders.json
 * Se llama después de guardar un pedido
 */
export function syncAfterDistModification(): void {
  setTimeout(() => {
    try {
      const sourcePath = path.resolve(process.cwd(), 'dist/data', 'orders.json');
      const targetPath = path.resolve(process.cwd(), 'data', 'orders.json');
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        logger.debug(`Orders synced after dist modification: ${sourcePath} -> ${targetPath}`);
      }
    } catch (error) {
      logger.error(`Error syncing after dist modification: ${error}`);
    }
  }, 100);
}

/**
 * Sincroniza después de una modificación en data/orders.json
 * Se llama después de actualizar desde la página web
 */
export function syncAfterDataModification(): void {
  setTimeout(() => {
    try {
      const sourcePath = path.resolve(process.cwd(), 'data', 'orders.json');
      const targetPath = path.resolve(process.cwd(), 'dist/data', 'orders.json');
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        logger.debug(`Orders synced after data modification: ${sourcePath} -> ${targetPath}`);
      }
    } catch (error) {
      logger.error(`Error syncing after data modification: ${error}`);
    }
  }, 100);
} 