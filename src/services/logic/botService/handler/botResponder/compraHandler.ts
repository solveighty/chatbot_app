import { IProductService, IConversationStateManager, ICartService } from '../../../../../interfaces/services';

export class CompraHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public manejarCompra(userId: string, userMessage: string): string {
    // Extraer el nombre del producto del mensaje
    const nombreProducto = userMessage.replace(/quiero comprar|comprar|pedir/gi, '').trim();
    
    if (!nombreProducto) {
      return '❌ Por favor, especifica qué producto quieres comprar.\n\n' +
             'Ejemplo: *quiero comprar Frasco de 500 ml*';
    }

    // Buscar el producto
    const producto = this.productService.buscarProductoExacto(nombreProducto);
    
    if (!producto) {
      return `❌ No se encontró el producto "${nombreProducto}".\n\n` +
             '📋 Escribe *productos* para ver el catálogo completo.\n' +
             '💡 Asegúrate de escribir el nombre exacto del producto.';
    }

    // Actualizar estado para solicitar cantidad
    this.stateManager.updateState(userId, {
      lastCategory: 'solicitar_cantidad_compra',
      productoSeleccionado: producto,
      productName: producto.nombre,
      productPrice: producto.precio,
      timestamp: new Date()
    });

    return `🛒 *${producto.nombre}*\n\n` +
           `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
           `📦 Categoría: ${producto.categoria}\n\n` +
           `📝 *¿Cuántas unidades quieres agregar al carrito?*\n\n` +
           `❌ O escribe *cancelar* para salir sin agregar.`;
  }

  public manejarCantidad(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Operación cancelada*\n\n` +
             `No se agregó ningún producto al carrito.\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito actual.\n` +
             `📋 Escribe *productos* para ver el catálogo completo.\n` +
             `➕ Puedes seguir comprando escribiendo *quiero comprar [producto]*.`;
    }

    const cantidad = parseInt(userMessage);
    
    // Validar que sea un número válido
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > 100) {
      return `❌ Por favor, escribe un número válido de unidades (1-100).\n\n` +
             `❌ O escribe *cancelar* para salir sin agregar.`;
    }

    try {
      // Agregar producto al carrito
      this.cartService.addItemToCart(userId, {
        nombre: state.productName,
        precio: state.productPrice,
        categoria: 'Producto',
        cantidad: cantidad
      }, cantidad);

      // Actualizar estado a menu principal
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      const total = (state.productPrice * cantidad).toFixed(2).replace('.', ',');

      return `✅ *Producto agregado al carrito*\n\n` +
             `🛒 *Producto:* ${state.productName}\n` +
             `💰 *Precio unitario:* $${state.productPrice.toFixed(2).replace('.', ',')}\n` +
             `📦 *Cantidad:* ${cantidad} unidad${cantidad > 1 ? 'es' : ''}\n` +
             `💵 *Subtotal:* $${total}\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito.\n` +
             `💳 Escribe *finalizar* para completar tu pedido.\n` +
             `📋 Escribe *productos* para seguir comprando.`;
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      return '❌ Error al agregar el producto al carrito. Por favor, intenta nuevamente.';
    }
  }
}