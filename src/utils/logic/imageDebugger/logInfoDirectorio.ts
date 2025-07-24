import logger from '../../logger';

export function logInfoDirectorio(ruta: string, archivos: string[]) {
  logger.info(`Archivos en ${ruta}: ${archivos.length}`);
  logger.info(`Primeras 5 entradas: ${archivos.slice(0, 5).join(', ')}`);
}