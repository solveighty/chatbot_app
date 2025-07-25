import logger from '../utils/logger';
import { ICartService } from '../interfaces/services';
import { CartItem } from './logic/cartService/types/cartItem';
import { addItemToCartLogic } from './logic/cartService/logic/addItemToCart';
import { getCartLogic } from './logic/cartService/logic/getCart';
import { getCartTotalLogic } from './logic/cartService/logic/getCartTotal';
import { generateCartSummaryLogic } from './logic/cartService/logic/generateCartSummary';
import { removeItemFromCartLogic } from './logic/cartService/logic/removeItemFromCart';
import { clearCartLogic } from './logic/cartService/logic/clearCart';

export class CartService implements ICartService {
  private carts: Map<string, CartItem[]>;
  
  constructor() {
    this.carts = new Map();
  }
  
  /**
   * Añade un producto al carrito del usuario
   */
  public addItemToCart(
    userId: string,
    producto: { nombre: string; precio: number; categoria: string },
    cantidad: number = 1
  ): CartItem[] {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, []);
    }

    const cart = this.carts.get(userId)!;

    addItemToCartLogic(cart, producto, cantidad);

    logger.info(`Producto añadido al carrito de ${userId}: ${producto.nombre} x${cantidad}`);
    return cart;
  }
  
  /**
   * Obtiene el carrito del usuario
   */
  public getCart(userId: string): CartItem[] {
    return getCartLogic(this.carts, userId);
  }
  
  /**
   * Calcula el total del carrito
   */
  public getCartTotal(userId: string): number {
    const cart = this.getCart(userId);
    return getCartTotalLogic(cart);
  }
  
  /**
   * Genera un mensaje con el resumen del carrito
   */
  public generateCartSummary(userId: string): string {
    const cart = this.getCart(userId);
    return generateCartSummaryLogic(userId, cart);
  }
  
  /**
   * Elimina un producto del carrito
   */
  public removeItemFromCart(userId: string, index: number): boolean {
    const cart = this.getCart(userId);
    return removeItemFromCartLogic(cart, index);
  }
  
  /**
   * Vacía el carrito del usuario
   */
  public clearCart(userId: string): void {
    clearCartLogic(this.carts, userId);
    logger.info(`Carrito de ${userId} vaciado`);
  }
}