import { ICartService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function processCheckout(
  cartService: ICartService,
  userId: string
): CommandResult {
  const cart = cartService.getCart(userId);
  if (cart.length === 0) {
    return {
      response: "❌ Tu carrito está vacío. Añade productos antes de finalizar la compra."
    };
  }

  return {
    response:
      `🛒 *Finalizar*\n\n` +
      `📝 *Para procesar tu pedido, necesito algunos datos:*\n\n` +
      `👤 *Por favor, escribe tu nombre completo:*\n\n` +
      `❌ O escribe *cancelar* para salir sin finalizar la compra.`,
    stateUpdates: {
      lastCategory: 'solicitar_nombre_checkout',
      timestamp: new Date()
    }
  };
}