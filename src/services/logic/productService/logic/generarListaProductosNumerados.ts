import { Categoria } from "../types/product";

export function generarListaProductosNumeradosLogic(
  productos: Categoria[],
  getEmojiForCategory: (categoria: string) => string
): string {
  let mensaje = "📦 *Productos disponibles:*\n\n";

  productos.forEach((categoria, catIndex) => {
    const catNumber = catIndex + 1;
    const emoji = getEmojiForCategory(categoria.categoria);
    mensaje += `${emoji} *${catNumber}. ${categoria.categoria}*\n`;

    categoria.productos.forEach((producto, prodIndex) => {
      const prodNumber = `${catNumber}.${prodIndex + 1}`;
      const precioFormateado = producto.precio.toFixed(2).replace(".", ",");

      if (producto.variantes && producto.variantes.length > 0) {
        mensaje += `- ${prodNumber} ${producto.nombre} (ID: ${producto.id}): $${precioFormateado}\n`;

        producto.variantes.forEach((variante, varIndex) => {
          const varNumber = `${prodNumber}.${varIndex + 1}`;
          const precioVarianteFormateado = variante.precio
            .toFixed(2)
            .replace(".", ",");
          mensaje += `  • ${varNumber} ${variante.nombre}: $${precioVarianteFormateado}\n`;
        });

        mensaje += `  → Para ordenar, escribe: *${catNumber}* o *${prodNumber}* o *${prodNumber}.1*\n`;
      } else {
        mensaje += `- ${prodNumber} ${producto.nombre} (ID: ${producto.id}): $${precioFormateado}\n`;
      }
    });
    mensaje += "\n";
  });

  mensaje += "📷 Para ver imágenes, escribe: *ver imágenes*\n\n";
  mensaje += "🛒 *¿Cómo hacer un pedido?*\n";
  mensaje += "1. Escribe el número de la categoría, producto o variante.\n";
  mensaje += "   Ejemplos: *1* (categoría), *1.2* (producto), *1.2.3* (variante)\n";
  mensaje += "2. También puedes escribir *quiero comprar* seguido del número.\n";
  mensaje += "3. Indica la cantidad de unidades que deseas cuando se te pregunte.\n";
  mensaje += "4. Puedes agregar varios productos a tu carrito.\n";
  mensaje += "5. Escribe *carrito* para ver tus productos seleccionados.\n";
  mensaje += "6. Escribe *finalizar compra* cuando estés listo.\n\n";
  mensaje += "Para más ayuda, escribe: *ayuda*";

  return mensaje;
}