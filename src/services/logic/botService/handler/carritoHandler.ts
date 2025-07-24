import { ICartService, IConversationStateManager } from '../../../../interfaces/services';

export class CarritoHandler {
  constructor(
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public manejarComandoCarrito(userId: string, userMessage: string, state: any): string | null {
    const mensaje = userMessage.toLowerCase();

    if (mensaje === 'carrito' || mensaje === 'ver carrito') {
      const carrito = this.cartService.getCart(userId);
      if (!carrito.length) {
        return '🛒 Tu carrito está vacío.';
      }

      let respuesta = '🛒 *Tu carrito actual:*\n\n';
      carrito.forEach((item, idx) => {
        respuesta += `${idx + 1}. ${item.nombre} (${item.categoria})\n`;
        respuesta += `   $${item.precio.toFixed(2).replace('.', ',')} x ${item.cantidad} = $${(item.precio * item.cantidad).toFixed(2).replace('.', ',')}\n\n`;
      });

      const total = this.cartService.getCartTotal(userId);
      respuesta += `💰 *Total: $${total.toFixed(2).replace('.', ',')}*\n\n`;
      respuesta += '✏️ Para eliminar un producto, escribe: *eliminar [nombre del producto]*\n';
      respuesta += '✅ Para finalizar tu compra, escribe: *finalizar compra*';

      return respuesta;
    }

    if (mensaje.startsWith('eliminar ')) {
      const nombreProducto = mensaje.replace('eliminar ', '').trim();
      const carrito = this.cartService.getCart(userId);
      const indice = carrito.findIndex(item => item.nombre.toLowerCase() === nombreProducto.toLowerCase());
      const eliminado = this.cartService.removeItemFromCart(userId, indice);
      if (eliminado) {
        this.stateManager.updateState(userId, { lastCategory: 'producto_eliminado', timestamp: new Date() });
        return `❌ Producto eliminado del carrito: ${nombreProducto}`;
      } else {
        return `No se encontró el producto "${nombreProducto}" en tu carrito.`;
      }
    }

    if (mensaje === 'vaciar carrito') {
      this.cartService.clearCart(userId);
      this.stateManager.updateState(userId, { lastCategory: 'carrito_vaciado', timestamp: new Date() });
      return '🗑️ Tu carrito ha sido vaciado.';
    }

    return null; // No es un comando de carrito
  }
}