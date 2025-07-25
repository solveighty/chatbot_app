import { Categoria } from "../types/product";

export function generarMenuCategoriasLogic(productos: Categoria[]): string {
  let mensaje = "📷 *¿De qué categoría deseas ver imágenes?*\n\n";

  productos.forEach((categoria, index) => {
    mensaje += `${index + 1}. ${categoria.categoria}\n`;
  });

  mensaje += "\nEscribe el número o nombre de la categoría.\n";
  mensaje += "Ejemplo: 2 o Cake";

  return mensaje;
}