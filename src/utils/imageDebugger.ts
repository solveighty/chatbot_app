/**
 * Utilidad para diagnosticar problemas con las imágenes
 */
import path from 'path';
import logger from './logger';
import { existeDirectorio } from './logic/imageDebugger/existeDirectorio';
import { listarArchivosDirectorio } from './logic/imageDebugger/listarArchivosDirectorio';
import { logInfoDirectorio } from './logic/imageDebugger/logInfoDirectorio';

export function verificarRutasImagenes() {
  logger.info('Verificando rutas de imágenes...');

  const dirImagenes = path.resolve(process.cwd(), 'dist/data/images');
  logger.info(`Ruta de imágenes absoluta: ${dirImagenes}`);
  
  if (!existeDirectorio(dirImagenes)) {
    logger.error(`El directorio de imágenes no existe: ${dirImagenes}`);
    logger.info(`Directorios en la carpeta data:`);
    
    const dirData = path.resolve(process.cwd(), 'dist/data');
    if (existeDirectorio(dirData)) {
      const archivos = listarArchivosDirectorio(dirData);
      logInfoDirectorio(dirData, archivos);
    } else {
      logger.error(`El directorio 'data' no existe`);
    }
    return false;
  }
  
  logger.info(`Directorio de imágenes encontrado. Contenido:`);
  const imagenes = listarArchivosDirectorio(dirImagenes);
  logInfoDirectorio(dirImagenes, imagenes);
  
  return true;
}