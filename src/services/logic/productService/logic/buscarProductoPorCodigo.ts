import { Categoria } from "../types/product";

export function buscarProductoPorCodigoLogic(
  productos: Categoria[],
  codigo: string
): { nombre: string; precio: number; categoria: string } | null {
  const partes = codigo.split(".").map((num) => parseInt(num) - 1);

  if (
    partes.length === 0 ||
    isNaN(partes[0]) ||
    partes[0] < 0 ||
    partes[0] >= productos.length
  ) {
    return null;
  }

  const categoria = productos[partes[0]];

  if (partes.length === 1) {
    return null;
  }

  if (
    isNaN(partes[1]) ||
    partes[1] < 0 ||
    partes[1] >= categoria.productos.length
  ) {
    return null;
  }

  const producto = categoria.productos[partes[1]];

  if (partes.length > 2 && producto.variantes) {
    if (
      isNaN(partes[2]) ||
      partes[2] < 0 ||
      partes[2] >= producto.variantes.length
    ) {
      return null;
    }

    const variante = producto.variantes[partes[2]];

    return {
      nombre: `${producto.nombre} - ${variante.nombre}`,
      precio: variante.precio,
      categoria: categoria.categoria,
    };
  }

  return {
    nombre: producto.nombre,
    precio: producto.precio,
    categoria: categoria.categoria,
  };
}