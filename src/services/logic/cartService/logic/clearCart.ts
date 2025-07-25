import { CartItem } from "../types/cartItem";

export function clearCartLogic(carts: Map<string, CartItem[]>, userId: string): void {
  carts.set(userId, []);
}