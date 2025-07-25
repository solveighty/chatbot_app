import { CartItem } from "../types/cartItem";

export function addItemToCartLogic(
  cart: CartItem[],
  producto: { nombre: string; precio: number; categoria: string },
  cantidad: number = 1
): CartItem[] {
  const existingItemIndex = cart.findIndex(
    item => item.nombre === producto.nombre && item.categoria === producto.categoria
  );

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].cantidad += cantidad;
  } else {
    cart.push({
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      cantidad: cantidad
    });
  }

  return cart;
}