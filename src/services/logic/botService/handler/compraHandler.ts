import { IProductService, IConversationStateManager } from '../../../../interfaces/services';

export class CompraHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public manejarCompra(userId: string, userMessage: string): string {
    const resultado = this.productService.procesarPedido(userMessage);

    if (resultado.encontrado && resultado.producto) {
      this.stateManager.updateState(userId, {
        lastCategory: 'solicitar_cantidad',
        productoSeleccionado: resultado.producto,
        timestamp: new Date()
      });

      return `✅ *Producto encontrado:*\n\n` +
             `📦 ${resultado.producto.nombre}\n` +
             `💰 Precio: $${resultado.producto.precio.toFixed(2).replace('.', ',')}\n` +
             `🏷️ Categoría: ${resultado.producto.categoria}\n\n` +
             `*¿Cuántas unidades deseas añadir al carrito?*\n` +
             `Responde con un número (ejemplo: 2)`;
    }

    return resultado.texto;
  }
}