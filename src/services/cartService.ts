import logger from '../utils/logger';
import { ICartService } from '../interfaces/services';

export interface CartItem {
  nombre: string;
  precio: number;
  categoria: string;
  cantidad: number;
}

export class CartService implements ICartService {
  private carts: Map<string, CartItem[]>;
  
  constructor() {
    this.carts = new Map();
  }
  
  /**
   * Añade un producto al carrito del usuario
   */
  public addItemToCart(userId: string, producto: { nombre: string, precio: number, categoria: string }, cantidad: number = 1): CartItem[] {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, []);
    }
    
    const cart = this.carts.get(userId)!;
    
    // se verifica si el producto ya existe en el carrito
    const existingItemIndex = cart.findIndex(item => 
      item.nombre === producto.nombre && item.categoria === producto.categoria
    );
    
    if (existingItemIndex >= 0) {
      // se actualiza la cantidad si el producto ya existe
      cart[existingItemIndex].cantidad += cantidad;
    } else {
      // se agrega un nuevo producto
      cart.push({
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: producto.categoria,
        cantidad: cantidad
      });
    }
    
    logger.info(`Producto añadido al carrito de ${userId}: ${producto.nombre} x${cantidad}`);
    return cart;
  }
  
  /**
   * Obtiene el carrito del usuario
   */
  public getCart(userId: string): CartItem[] {
    return this.carts.get(userId) || [];
  }
  
  /**
   * Calcula el total del carrito
   */
  public getCartTotal(userId: string): number {
    const cart = this.getCart(userId);
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }
  
  /**
   * Genera un mensaje con el resumen del carrito
   */
  public generateCartSummary(userId: string): string {
    const cart = this.getCart(userId);
    
    if (cart.length === 0) {
      return "Tu carrito está vacío. Escribe *ver productos* para ver el catálogo.";
    }
    
    let mensaje = "🛒 *Resumen de tu carrito:*\n\n";
    
    cart.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      const precioFormateado = item.precio.toFixed(2).replace('.', ',');
      const subtotalFormateado = subtotal.toFixed(2).replace('.', ',');
      
      mensaje += `${index + 1}. ${item.nombre} (${item.categoria})\n` +
                `   Precio: $${precioFormateado} x ${item.cantidad} = $${subtotalFormateado}\n\n`;
    });
    
    const total = this.getCartTotal(userId);
    const totalFormateado = total.toFixed(2).replace('.', ',');
    mensaje += `💰 *Total: $${totalFormateado}*\n\n`;
    
    mensaje += "Comandos disponibles:\n" +
              "➕ *añadir [producto]* - Añadir producto (se preguntará la cantidad)\n" +
              "➕ *añadir [cantidad] [producto]* - Añadir cantidad específica\n" +
              "➖ *quitar [número]* - Quitar un producto\n" +
              "✅ *finalizar compra* - Proceder al pago\n" +
              "❌ *vaciar carrito* - Cancelar la compra";
    
    return mensaje;
  }
  
  /**
   * Elimina un producto del carrito
   */
  public removeItemFromCart(userId: string, index: number): boolean {
    const cart = this.getCart(userId);
    
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * Vacía el carrito del usuario
   */
  public clearCart(userId: string): void {
    this.carts.set(userId, []);
    logger.info(`Carrito de ${userId} vaciado`);
  }
}