import { Categoria } from "../types/product";

export function buscarProductosLogic(productos: Categoria[], termino: string): any[] {
  termino = termino.toLowerCase();
  let resultados: any[] = [];

  for (const categoria of productos) {
    for (const producto of categoria.productos) {
      if (producto.nombre?.toLowerCase().includes(termino)) {
        resultados.push({
          ...producto,
          categoria: categoria.categoria
        });
      }
    }
  }

  return resultados;
}