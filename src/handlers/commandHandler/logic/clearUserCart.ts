import { ICartService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function clearUserCart(
  cartService: ICartService,
  userId: string
): CommandResult {
  cartService.clearCart(userId);
  return {
    response: "🗑️ Tu carrito ha sido vaciado. Puedes seguir explorando nuestros productos."
  };
}