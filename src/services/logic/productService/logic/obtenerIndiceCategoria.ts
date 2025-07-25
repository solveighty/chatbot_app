import { Categoria } from "../types/product";

export function obtenerIndiceCategoriaLogic(productos: Categoria[], seleccion: string): number {
  const seleccionNumero = parseInt(seleccion);

  if (
    !isNaN(seleccionNumero) &&
    seleccionNumero > 0 &&
    seleccionNumero <= productos.length
  ) {
    return seleccionNumero - 1;
  }

  // buscar por nombre
  return productos.findIndex((cat) =>
    cat.categoria.toLowerCase().includes(seleccion.toLowerCase())
  );
}