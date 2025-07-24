import { ICartService } from '../../../interfaces/services';
import { CommandResult } from '../../types/commandResult';

export function removeFromCart(
  message: string,
  userId: string,
  cartService: ICartService
): CommandResult | null {
  const partes = message.toLowerCase().split(' ');
  if (partes.length < 2) {
    return {
      response: "Para quitar un producto, escribe: *quitar [número]*\n" +
        "El número es la posición del producto en el carrito.\n" +
        "Ejemplo: quitar 1"
    };
  }
  const indiceStr = partes[1];
  const indice = parseInt(indiceStr) - 1;
  if (isNaN(indice) || indice < 0) {
    return {
      response: "Por favor, indica un número válido. Ejemplo: *quitar 1*"
    };
  }
  const eliminado = cartService.removeItemFromCart(userId, indice);
  if (eliminado) {
    return {
      response: "✅ Producto eliminado del carrito.\n\n" +
        cartService.generateCartSummary(userId)
    };
  } else {
    return {
      response: "❌ No encontré ese producto en tu carrito. Verifica el número."
    };
  }
}