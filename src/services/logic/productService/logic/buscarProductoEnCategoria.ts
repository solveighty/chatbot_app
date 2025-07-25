import { Categoria, Producto } from "../types/product";

export function buscarProductoEnCategoriaLogic(
  productos: Categoria[],
  nombreCategoria: string,
  nombreProducto: string
): Producto | null {
  const categoriaIndex = productos.findIndex(
    (cat) => cat.categoria.toLowerCase() === nombreCategoria.toLowerCase()
  );
  if (categoriaIndex === -1) return null;

  const categoria = productos[categoriaIndex];
  return (
    categoria.productos.find((p) =>
      p.nombre.toLowerCase().includes(nombreProducto.toLowerCase())
    ) || null
  );
}