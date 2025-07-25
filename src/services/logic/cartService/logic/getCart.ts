import { CartItem } from "../types/cartItem";

export function getCartLogic(
  carts: Map<string, CartItem[]>,
  userId: string
): CartItem[] {
  return carts.get(userId) || [];
}