import { CartItem } from "../types/cartItem";

export function removeItemFromCartLogic(cart: CartItem[], index: number): boolean {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    return true;
  }
  return false;
}