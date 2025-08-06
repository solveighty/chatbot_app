import { IProductService, IConversationStateManager } from '../../../../../interfaces/services';

export class SeleccionProductoHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public manejarSeleccionPorCodigo(userId: string, userMessage: string, state: any): string | null {
    const producto = this.productService.buscarProductoPorCodigo(userMessage);

    if (producto) {
      this.stateManager.updateState(userId, {
        lastCategory: 'solicitar_cantidad',
        productoSeleccionado: producto,
        timestamp: new Date()
      });

      return `✅ *Producto encontrado:*\n\n` +
             `📦 ${producto.nombre}\n` +
             `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
             `🏷️ Categoría: ${producto.categoria}\n\n` +
             `*¿Cuántas unidades deseas añadir al carrito?*\n` +
             `Responde con un número (ejemplo: 2)\n\n` +
             `❌ O escribe *cancelar* para salir sin agregar el producto.`;
    }

    return null;
  }
}