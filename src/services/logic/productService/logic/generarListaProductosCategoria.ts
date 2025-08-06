import { Categoria } from "../types/product";

export function generarListaProductosCategoriaLogic(
  productos: Categoria[],
  nombreCategoria: string,
  getEmojiForCategory: (categoria: string) => string
): string {
  const categoriaIndex = productos.findIndex(
    (cat) => cat.categoria.toLowerCase() === nombreCategoria.toLowerCase()
  );

  if (categoriaIndex === -1) {
    return `No encontré la categoría "${nombreCategoria}". Escribe *ver productos* para ver todas las categorías.`;
  }

  const categoria = productos[categoriaIndex];
  const catNumber = categoriaIndex + 1;
  const emoji = getEmojiForCategory(categoria.categoria);

  let mensaje = `${emoji} *Productos de ${categoria.categoria} (${catNumber}):*\n\n`;

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
    } else {
      mensaje += `- ${prodNumber} ${producto.nombre} (ID: ${producto.id}): $${precioFormateado}\n`;
    }
  });

  mensaje +=
    "\n💬 Para seleccionar un producto, escribe su código numérico (ejemplo: *1.2*)";
  mensaje += "\n💬 También puedes escribir: *quiero comprar 1.2*";
  mensaje += "\n🔙 Para ver todas las categorías escribe: *ver productos*";

  return mensaje;
}