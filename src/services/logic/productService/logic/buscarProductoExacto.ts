import { Categoria, Producto } from "../types/product";

export function buscarProductoExactoLogic(
  productos: Categoria[],
  nombreProducto: string
): { nombre: string; precio: number; categoria: string } | null {
  nombreProducto = nombreProducto.toLowerCase().trim();

  // buscar coincidencias de variantes primero
  for (const categoria of productos) {
    for (const producto of categoria.productos) {
      if (producto.variantes && producto.variantes.length > 0) {
        for (const variante of producto.variantes) {
          const nombreVariante = variante.nombre.toLowerCase();
          const nombreProductoBase = producto.nombre.toLowerCase();

          let esTamanoCorrecto = false;
          let esColorCorrecto = false;

          if (nombreProductoBase.includes("cm")) {
            const tamanoMatch = nombreProductoBase.match(/(\d+)\s*cm/);
            if (tamanoMatch && nombreProducto.includes(tamanoMatch[1])) {
              esTamanoCorrecto = true;
            }
          } else {
            esTamanoCorrecto = nombreProducto.includes(
              nombreProductoBase.split("-")[0].trim()
            );
          }

          if (nombreVariante.includes("color")) {
            const colorMatch = nombreVariante.match(/color\s+(\w+)/i);
            if (
              colorMatch &&
              nombreProducto.includes(colorMatch[1].toLowerCase())
            ) {
              esColorCorrecto = true;
            }
          }

          if (
            (esTamanoCorrecto && esColorCorrecto) ||
            nombreProducto.includes(nombreVariante) ||
            (nombreProducto.includes(nombreProductoBase) &&
              nombreProducto.includes(nombreVariante))
          ) {
            return {
              nombre: `${producto.nombre} - ${variante.nombre}`,
              precio: variante.precio,
              categoria: categoria.categoria,
            };
          }
        }
      }
    }
  }

  // si no encontró variante, intentar el método normal
  let mejorCoincidencia = null;
  let mejorPuntuacion = 0;

  for (const categoria of productos) {
    for (const producto of categoria.productos) {
      const nombreActual = producto.nombre?.toLowerCase() || "";
      let puntuacion = 0;

      if (nombreActual === nombreProducto) {
        puntuacion = 100;
      } else if (nombreProducto.includes(nombreActual)) {
        puntuacion = 75 + (nombreActual.length / nombreProducto.length) * 20;
      } else if (nombreActual.includes(nombreProducto)) {
        puntuacion = 50 + (nombreProducto.length / nombreActual.length) * 20;
      }

      if (
        puntuacion > 0 &&
        nombreProducto.includes(categoria.categoria.toLowerCase())
      ) {
        puntuacion += 25;
      }

      if (puntuacion > mejorPuntuacion) {
        mejorPuntuacion = puntuacion;
        mejorCoincidencia = {
          nombre: producto.nombre,
          precio: producto.precio,
          categoria: categoria.categoria,
        };
      }
    }
  }

  return mejorPuntuacion > 40 ? mejorCoincidencia : null;
}