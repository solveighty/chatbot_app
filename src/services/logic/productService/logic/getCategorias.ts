import { Categoria } from "../types/product";

export function getCategoriasLogic(productos: Categoria[]): string[] {
  return productos.map((categoria) => categoria.categoria);
}