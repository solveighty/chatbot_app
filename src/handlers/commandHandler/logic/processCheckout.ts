import { ICartService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function processCheckout(
  cartService: ICartService,
  userId: string
): CommandResult {
  const cart = cartService.getCart(userId);
  if (cart.length === 0) {
    return {
      response: "Tu carrito está vacío. Añade productos antes de finalizar la compra."
    };
  }

  return {
    response:
      `Por favor, proporciona los siguientes datos para finalizar tu compra:\n\n` +
      `1️⃣ *Tu nombre completo* (mínimo 3 caracteres)\n` +
      `2️⃣ *Tu dirección de entrega* (o indica si recogerás en el Monasterio)\n` +
      `3️⃣ *Tu número de teléfono* (formato válido)\n\n` +
      `Ejemplo:\n` +
      `María Pérez\n` +
      `Calle Principal 123, Ciudad\n` +
      `0991234567\n\n` +
      `Nota: Es muy importante proporcionar la información completa para procesar tu pedido.`,
    stateUpdates: {
      lastCategory: 'checkout',
      etapaPedido: 'datos_cliente',
      timestamp: new Date()
    }
  };
}