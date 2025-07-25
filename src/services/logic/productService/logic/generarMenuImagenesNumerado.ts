import { Categoria } from "../types/product";

export function generarMenuImagenesNumeradoLogic(productos: Categoria[], getEmojiForCategory: (categoria: string) => string): string {
  let mensaje = "📷 *¿De qué categoría deseas ver imágenes?*\n\n";

  productos.forEach((categoria, index) => {
    const emoji = getEmojiForCategory(categoria.categoria);
    mensaje += `${emoji} *${index + 1}. ${categoria.categoria}*\n`;
  });

  mensaje += "\n📱 Escribe el número de la categoría para ver sus productos.";
  mensaje += "\nEjemplo: *ver imágenes 1* o simplemente *1*";

  return mensaje;
}