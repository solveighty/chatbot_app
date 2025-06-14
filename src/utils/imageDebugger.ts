/**
 * Utilidad para diagnosticar problemas con las imágenes
 */
import fs from 'fs';
import path from 'path';
import logger from './logger';

export function verificarRutasImagenes() {
  logger.info('Verificando rutas de imágenes...');

  // Comprobar si existe el directorio de imágenes
  const dirImagenes = path.resolve(process.cwd(), 'src/data/images');
  logger.info(`Ruta de imágenes absoluta: ${dirImagenes}`);
  
  if (!fs.existsSync(dirImagenes)) {
    logger.error(`El directorio de imágenes no existe: ${dirImagenes}`);
    logger.info(`Directorios en la carpeta data:`);
    
    const dirData = path.resolve(process.cwd(), 'src/data');
    if (fs.existsSync(dirData)) {
      const archivos = fs.readdirSync(dirData);
      logger.info(archivos.join(', '));
    } else {
      logger.error(`El directorio 'src/data' no existe`);
    }
    
    return false;
  }
  
  logger.info(`Directorio de imágenes encontrado. Contenido:`);
  const imagenes = fs.readdirSync(dirImagenes);
  logger.info(`Archivos en directorio: ${imagenes.length}`);
  logger.info(`Primeras 5 imágenes: ${imagenes.slice(0, 5).join(', ')}`);
  
  return true;
}