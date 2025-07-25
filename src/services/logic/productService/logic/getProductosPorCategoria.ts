import { Categoria, Producto } from "../types/product";

export function getProductosPorCategoriaLogic(productos: Categoria[], nombreCategoria: string): Producto[] {
  const categoria = productos.find(
    (cat) => cat.categoria.toLowerCase() === nombreCategoria.toLowerCase()
  );
  return categoria?.productos || [];
}