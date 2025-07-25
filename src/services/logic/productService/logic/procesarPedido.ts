import { Categoria } from "../types/product";

export function procesarPedidoLogic(
  productos: Categoria[],
  pedido: string,
  buscarProductoExacto: (nombreProducto: string) => { nombre: string; precio: number; categoria: string } | null
): {
  texto: string;
  encontrado: boolean;
  producto?: { nombre: string; precio: number; categoria: string };
} {
  const textoPedido = pedido
    .toLowerCase()
    .replace(/quiero comprar|comprar|me gustaría|quisiera|necesito|quiero|pedir/gi, "")
    .trim();

  if (textoPedido.length < 3) {
    return {
      texto:
        "Por favor, especifica qué producto deseas comprar.\n\n" +
        "Escribe *ver productos* para ver el catálogo completo, y luego\n" +
        "escribe *quiero comprar* seguido del nombre exacto del producto.\n\n" +
        'Ejemplo: "quiero comprar Frasco de 500 ml"',
      encontrado: false,
    };
  }

  const productoEncontrado = buscarProductoExacto(textoPedido);

  if (productoEncontrado) {
    const precioFormateado = productoEncontrado.precio.toFixed(2).replace(".", ",");
    return {
      texto:
        `✅ *Producto encontrado:*\n\n` +
        `📦 ${productoEncontrado.nombre}\n` +
        `💰 Precio: $${precioFormateado}\n` +
        `🏷️ Categoría: ${productoEncontrado.categoria}\n\n` +
        `Para confirmar tu pedido, por favor envía los siguientes datos:\n\n` +
        `1️⃣ Tu nombre completo\n` +
        `2️⃣ Tu dirección de entrega (o indica si recogerás en el Monasterio)\n` +
        `3️⃣ Tu número de teléfono\n` +
        `4️⃣ Cantidad de unidades\n\n` +
        `Nota: La información se usará únicamente para procesar tu pedido.`,
      encontrado: true,
      producto: productoEncontrado,
    };
  }

  for (const categoria of productos) {
    if (textoPedido.includes(categoria.categoria.toLowerCase())) {
      let mensaje = `No has especificado qué producto de *${categoria.categoria}* deseas comprar.\n\n`;
      mensaje += "Algunos productos de esta categoría:\n\n";

      categoria.productos.forEach(producto => {
        const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
        if (producto.variantes && producto.variantes.length > 0) {
          mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
          mensaje += `  Opciones disponibles:\n`;
          producto.variantes.forEach(variante => {
            mensaje += `  • ${variante.nombre}\n`;
          });
          mensaje += `\n  Ejemplo: "Quiero comprar ${producto.nombre} ${producto.variantes[0].nombre}"\n\n`;
        } else {
          mensaje += `- ${producto.nombre}: $${precioFormateado}\n\n`;
        }
      });

      return {
        texto: mensaje,
        encontrado: false
      };
    }
  }

  return {
    texto:
      `Lo siento, no encontré ese producto en nuestro catálogo.\n\n` +
      `👉 Asegúrate de escribir el nombre exacto como aparece en el catálogo.\n\n` +
      `Escribe *ver productos* para consultar los productos disponibles.\n` +
      `Para productos con colores u opciones, especifícalos claramente.\n` +
      `Ejemplo: "quiero comprar De 12 cm Color blanco"\n\n` +
      `Para obtener ayuda, escribe: *ayuda*`,
    encontrado: false,
  };
}