import { ICartService, IConversationStateManager } from '../../../../../interfaces/services';

export class CantidadHandler {
  constructor(
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public manejarSolicitudCantidad(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase().trim();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      // Limpiar el estado y volver al menú principal
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        productoSeleccionado: null,
        timestamp: new Date()
      });

      return `❌ *Compra cancelada*\n\n` +
             `No se agregó ningún producto al carrito.\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito actual.\n` +
             `📋 Escribe *productos* para ver el catálogo completo.\n` +
             `➕ Puedes seguir comprando escribiendo *quiero comprar [producto]*.`;
    }

    const cantidad = parseInt(userMessage);

    if (isNaN(cantidad) || cantidad <= 0) {
      return `Por favor, indica una cantidad válida usando solo números.\n` +
             `Ejemplo: *2* para añadir dos unidades.\n\n` +
             `❌ O escribe *cancelar* para salir sin agregar el producto.`;
    }

    const producto = state.productoSeleccionado;
    if (producto) {
      this.cartService.addItemToCart(userId, producto, cantidad);

      this.stateManager.updateState(userId, {
        lastCategory: 'producto_agregado',
        lastProductAdded: producto,
        timestamp: new Date()
      });

      return `✅ *Producto añadido al carrito:*\n\n` +
             `📦 ${producto.nombre}\n` +
             `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')} x ${cantidad} = $${(producto.precio * cantidad).toFixed(2).replace('.', ',')}\n` +
             `🏷️ Categoría: ${producto.categoria}\n\n` +
             `🛒 Escribe *carrito* para ver todos los productos seleccionados.\n` +
             `➕ Puedes seguir añadiendo más productos escribiendo *quiero comprar [producto]*.\n` +
             `✅ Cuando termines, escribe *finalizar compra* para proceder al pago.`;
    } else {
      return `Lo siento, ha ocurrido un error. Por favor, intenta seleccionar el producto nuevamente.`;
    }
  }
}