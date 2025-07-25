import logger from "../../../../utils/logger";
import { MessageMedia } from "whatsapp-web.js";
import { Categoria, Producto } from "../types/product";
import { obtenerImagenProductoLogic } from "./obtenerImagenProducto";

export async function procesarSolicitudImagenLogic(
  productos: Categoria[],
  codigo: string,
  obtenerImagenProducto: (producto: Producto) => Promise<MessageMedia | undefined>
): Promise<{ texto: string; imagen?: MessageMedia; esCategoria: boolean }> {
  const partes = codigo.split(".").map((num) => parseInt(num) - 1);

  if (
    partes.length === 0 ||
    isNaN(partes[0]) ||
    partes[0] < 0 ||
    partes[0] >= productos.length
  ) {
    return {
      texto: `❌ Categoría no encontrada. Por favor, escribe *ver imágenes* para ver todas las categorías disponibles.`,
      esCategoria: false,
    };
  }

  const categoria = productos[partes[0]];
  const catNumber = partes[0] + 1;

  // Si solo tenemos la categoría, mostrar lista de productos en esa categoría
  if (partes.length === 1) {
    let mensaje = `📷 *Productos de ${categoria.categoria} (${catNumber}):*\n\n`;

    categoria.productos.forEach((producto, prodIndex) => {
      const prodNumber = `${catNumber}.${prodIndex + 1}`;
      const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
      mensaje += `- ${prodNumber} ${producto.nombre}: $${precioFormateado}\n`;
    });

    mensaje +=
      "\n💬 Para ver la imagen de un producto específico, escribe: *ver imágenes [código]*";
    mensaje +=
      "\nEjemplo: *ver imágenes 1.2* para ver el segundo producto de esta categoría";
    mensaje += "\n🔙 Para ver todas las categorías, escribe: *ver imágenes*";

    // Intentar mostrar una imagen de la categoría (primer producto)
    let imagen: MessageMedia | undefined;
    if (categoria.productos.length > 0 && categoria.productos[0].imagen) {
      try {
        imagen = await obtenerImagenProducto(categoria.productos[0]);
      } catch (error) {
        logger.error(`Error al cargar imagen de categoría: ${error}`);
      }
    }

    return {
      texto: mensaje,
      imagen,
      esCategoria: true,
    };
  }

  // Verificar si el índice del producto es válido
  if (
    isNaN(partes[1]) ||
    partes[1] < 0 ||
    partes[1] >= categoria.productos.length
  ) {
    return {
      texto: `❌ Producto no encontrado en la categoría ${categoria.categoria}. Escribe *ver imágenes ${catNumber}* para ver todos los productos disponibles.`,
      esCategoria: false,
    };
  }

  // Tenemos categoría y producto, mostrar imagen específica
  const producto = categoria.productos[partes[1]];
  const prodNumber = `${catNumber}.${partes[1] + 1}`;

  let mensaje = `📷 *${producto.nombre}*\n\n`;
  mensaje += `📦 Código: ${prodNumber}\n`;
  mensaje += `💰 Precio: $${producto.precio.toFixed(2).replace(".", ",")}\n`;
  mensaje += `🏷️ Categoría: ${categoria.categoria}\n\n`;

  // Si tiene variantes, mostrarlas
  if (producto.variantes && producto.variantes.length > 0) {
    mensaje += `*Variantes disponibles:*\n`;
    producto.variantes.forEach((variante, varIndex) => {
      const varNumber = `${prodNumber}.${varIndex + 1}`;
      mensaje += `- ${varNumber} ${variante.nombre}: $${variante.precio
        .toFixed(2)
        .replace(".", ",")}\n`;
    });
  }

  mensaje +=
    "\n💬 Para comprar este producto, escribe: *quiero comprar " +
    prodNumber +
    "*";
  mensaje +=
    "\n🔙 Para ver todos los productos de esta categoría, escribe: *ver imágenes " +
    catNumber +
    "*";

  // Obtener la imagen del producto
  let imagen: MessageMedia | undefined;
  try {
    imagen = await obtenerImagenProducto(producto);
  } catch (error) {
    logger.error(`Error al cargar imagen del producto: ${error}`);
  }

  return {
    texto: mensaje,
    imagen,
    esCategoria: false,
  };
}