import { Categoria } from "../types/product";

export function generarListaProductosLogic(
  productos: Categoria[],
  getEmojiForCategory: (categoria: string) => string
): string {
  let mensaje = "📦 *Productos disponibles:*\n\n";

  productos.forEach((categoria) => {
    const emoji = getEmojiForCategory(categoria.categoria);
    mensaje += `${emoji} *${categoria.categoria}*\n`;

    categoria.productos.forEach((producto) => {
      const precioFormateado = producto.precio.toFixed(2).replace(".", ",");

      if (producto.variantes && producto.variantes.length > 0) {
        mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;

        producto.variantes.forEach((variante) => {
          const precioVarianteFormateado = variante.precio
            .toFixed(2)
            .replace(".", ",");
          mensaje += `  • ${variante.nombre}: $${precioVarianteFormateado}\n`;
        });

        const primerVariante = producto.variantes[0];
        mensaje += `  → Para ordenar: "quiero comprar ${producto.nombre} ${primerVariante.nombre}"\n`;
      } else {
        mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
      }
    });
    mensaje += "\n";
  });

  mensaje += "📷 Para ver imágenes, escribe: *ver imágenes*\n\n";
  mensaje += "🛒 *¿Cómo hacer un pedido?*\n";
  mensaje += "1. Escribe *quiero comprar* seguido del nombre exacto del producto.\n";
  mensaje += "2. Para productos con colores u opciones, especifícalo en tu pedido.\n";
  mensaje += "3. Indica la cantidad de unidades que deseas cuando se te pregunte.\n";
  mensaje += "4. Puedes agregar varios productos a tu carrito.\n";
  mensaje += "5. Escribe *carrito* para ver tus productos seleccionados.\n";
  mensaje += "6. Escribe *finalizar compra* cuando estés listo.\n\n";
  mensaje += "Para más ayuda, escribe: *ayuda*";

  return mensaje;
}