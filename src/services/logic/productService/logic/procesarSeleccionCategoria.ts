import path from "path";
import fs from "fs";
import logger from "../../../../utils/logger";
import { MessageMedia } from "whatsapp-web.js";
import { Categoria } from "../types/product";

export async function procesarSeleccionCategoriaLogic(
  productos: Categoria[],
  seleccion: string
): Promise<{ texto: string; imagen?: MessageMedia }> {
  const seleccionNumero = parseInt(seleccion);
  let categoriaSeleccionada: Categoria | undefined;

  if (
    !isNaN(seleccionNumero) &&
    seleccionNumero > 0 &&
    seleccionNumero <= productos.length
  ) {
    categoriaSeleccionada = productos[seleccionNumero - 1];
  } else {
    categoriaSeleccionada = productos.find((cat) =>
      cat.categoria.toLowerCase().includes(seleccion.toLowerCase())
    );
  }

  if (!categoriaSeleccionada) {
    return {
      texto: "❌ Categoría no encontrada. Por favor, elige una categoría válida del menú.",
    };
  }

  const productosCat = categoriaSeleccionada.productos;
  let mensaje = `🛒 *Productos de ${categoriaSeleccionada.categoria}:*\n\n`;

  productosCat.forEach((producto) => {
    const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
    mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
  });

  mensaje +=
    "\n💬 Para hacer un pedido, escribe: *quiero comprar* seguido del producto.";

  try {
    if (productosCat.length > 0 && productosCat[0].imagen) {
      const imagenPath = productosCat[0].imagen;
      const mediaPath = path.resolve(process.cwd(), "src/data", imagenPath);

      logger.info(`Intentando cargar imagen desde: ${mediaPath}`);

      if (fs.existsSync(mediaPath)) {
        const media = MessageMedia.fromFilePath(mediaPath);
        return { texto: mensaje, imagen: media };
      } else {
        logger.error(`Archivo de imagen no encontrado: ${mediaPath}`);
      }
    }
  } catch (error) {
    logger.error(`Error al cargar imagen: ${error}`);
  }

  return { texto: mensaje };
}