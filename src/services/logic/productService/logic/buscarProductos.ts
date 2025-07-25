import { Categoria } from "../types/product";

export function buscarProductosLogic(productos: Categoria[], termino: string): string {
  termino = termino.toLowerCase();
  let resultados: {
    nombre: string;
    precio: number;
    precioFormateado: string;
    categoria: string;
  }[] = [];

  for (const categoria of productos) {
    for (const producto of categoria.productos) {
      if (producto.nombre?.toLowerCase().includes(termino)) {
        const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
        resultados.push({
          nombre: producto.nombre,
          precio: producto.precio,
          precioFormateado,
          categoria: categoria.categoria,
        });
      }
    }
  }

  if (resultados.length === 0) {
    return (
      `No encontré productos que coincidan con "${termino}". ` +
      `Escribe *ver productos* para ver todo nuestro catálogo.`
    );
  }

  let mensaje = `🔍 *Resultados de búsqueda para "${termino}":*\n\n`;

  resultados.forEach((resultado) => {
    mensaje +=
      `📦 ${resultado.nombre}\n` +
      `💰 Precio: $${resultado.precioFormateado}\n` +
      `🏷️ Categoría: ${resultado.categoria}\n\n`;
  });

  mensaje += `Para comprar, escribe: *quiero comprar* seguido del nombre del producto.`;

  return mensaje;
}