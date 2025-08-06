import { CartItem } from "../types/cartItem";
import { getCartTotalLogic } from "./getCartTotal";

export function generateCartSummaryLogic(userId: string, cart: CartItem[]): string {
  if (cart.length === 0) {
    return "Tu carrito está vacío. Escribe *ver productos* para ver el catálogo.";
  }

  let mensaje = "🛒 *Resumen de tu carrito:*\n\n";

  cart.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    const precioFormateado = item.precio.toFixed(2).replace('.', ',');
    const subtotalFormateado = subtotal.toFixed(2).replace('.', ',');

    mensaje += `${index + 1}. ${item.nombre} (${item.categoria})\n` +
      `   Precio: $${precioFormateado} x ${item.cantidad} = $${subtotalFormateado}\n\n`;
  });

  const total = getCartTotalLogic(cart);
  const totalFormateado = total.toFixed(2).replace('.', ',');
  mensaje += `💰 *Total: $${totalFormateado}*\n\n`;

  mensaje += "Comandos disponibles:\n" +
    "➕ *añadir [código]* - Ejemplo: añadir 1.2\n" +
    "➕ *añadir [cantidad] [código]* - Ejemplo: añadir 3 1.2\n" +
    "➖ *quitar [número]* - Quitar un producto\n" +
    "✅ *finalizar* - Proceder al pago\n" +
    "❌ *vaciar carrito* - Cancelar la compra";

  return mensaje;
}