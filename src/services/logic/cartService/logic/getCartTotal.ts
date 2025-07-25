import { CartItem } from "../types/cartItem";

export function getCartTotalLogic(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}