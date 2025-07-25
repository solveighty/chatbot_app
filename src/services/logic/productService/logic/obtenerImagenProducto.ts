import fs from "fs";
import path from "path";
import logger from "../../../../utils/logger";
import { MessageMedia } from "whatsapp-web.js";
import { Producto } from "../types/product";

export async function obtenerImagenProductoLogic(
  producto: Producto
): Promise<MessageMedia | undefined> {
  try {
    if (producto && producto.imagen) {
      const mediaPath = path.resolve(
        process.cwd(),
        "src/data",
        producto.imagen
      );

      if (fs.existsSync(mediaPath)) {
        return MessageMedia.fromFilePath(mediaPath);
      }
    }
    return undefined;
  } catch (error) {
    logger.error(`Error al obtener imagen del producto: ${error}`);
    return undefined;
  }
}