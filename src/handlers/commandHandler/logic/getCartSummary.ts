import { ICartService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function getCartSummary(
  cartService: ICartService,
  userId: string
): CommandResult {
  return {
    response: cartService.generateCartSummary(userId),
  };
}