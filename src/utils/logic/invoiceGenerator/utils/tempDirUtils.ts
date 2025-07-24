import fs from "fs-extra";
import path from "path";
import logger from "../../../logger";

export const TEMP_DIR = path.resolve(process.cwd(), "temp");

export function initTempDir(): void {
  try {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
      logger.info(`Directorio temporal creado: ${TEMP_DIR}`);
    }
  } catch (error) {
    logger.error(`Error al crear directorio temporal: ${error}`);
  }
}

export function cleanupOldInvoices(maxAgeHours: number = 24): void {
  try {
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      const now = new Date();
      files.forEach(file => {
        const filePath = path.join(TEMP_DIR, file);
        const stats = fs.statSync(filePath);
        const fileAge = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60);
        if (fileAge > maxAgeHours) {
          fs.unlinkSync(filePath);
          logger.info(`Archivo temporal eliminado: ${filePath}`);
        }
      });
    }
  } catch (error) {
    logger.error(`Error al limpiar archivos temporales: ${error}`);
  }
}